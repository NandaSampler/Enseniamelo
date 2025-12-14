from fastapi import APIRouter, Response
from domain.schemas import PlanOut, PlanCreate, PlanUpdate, ErrorResponse
from domain.services import PaymentsService

import stripe
from bson import ObjectId
from domain.settings import settings
from infra.mongo import db
from datetime import datetime

router = APIRouter(prefix="/planes", tags=["planes"])
svc = PaymentsService()

@router.get(
    "/",
    response_model=list[PlanOut],
    summary="Listar planes",
    description="Devuelve todos los planes disponibles desde MongoDB.",
)
async def list_plans():
    return await svc.list_plans()

@router.post(
    "/",
    response_model=PlanOut,
    status_code=201,
    summary="Crear un plan",
    description="Crea un nuevo plan con nombre, descripción, precio, duración en días y cantidad de cursos.",
    responses={
        409: {"model": ErrorResponse, "description": "Conflicto (plan ya existe)."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
async def create_plan(payload: PlanCreate):
    # 1) Crear en Mongo 
    plan = await svc.create_plan(payload.model_dump())  # devuelve dict con "id"

    # 2) Crear en Stripe
    stripe.api_key = settings.stripe_secret_key

    product = stripe.Product.create(
        name=plan["nombre"],
        description=plan.get("descripcion", ""),
    )

    unit_amount = int(round(float(plan["precio"]) * 100))
    price = stripe.Price.create(
        product=product["id"],
        unit_amount=unit_amount,
        currency="usd",
    )

    # 3) Persistir IDs de Stripe en el plan (Mongo)
    await db().plan.update_one(
        {"_id": ObjectId(plan["id"])},
        {
            "$set": {
                "stripe_product_id": product["id"],
                "stripe_price_id": price["id"],
                "updatedAt": datetime.utcnow(),
            }
        },
    )

    # 4) Responder (mismo formato que siempre)
    plan["stripe_product_id"] = product["id"]
    plan["stripe_price_id"] = price["id"]
    return plan

@router.get(
    "/{pid}",
    response_model=PlanOut,
    summary="Obtener plan por ID",
    description="Obtiene un plan por su ID (ObjectId en string).",
    responses={
        404: {"model": ErrorResponse, "description": "Plan no encontrado."},
    },
)
async def get_plan(pid: str):
    return await svc.get_plan(pid)

@router.put(
    "/{pid}",
    response_model=PlanOut,
    summary="Actualizar plan",
    description="Actualiza los campos del plan indicado. Persiste cambios en MongoDB.",
    responses={
        404: {"model": ErrorResponse, "description": "Plan no encontrado."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
async def update_plan(pid: str, payload: PlanUpdate):
    return await svc.update_plan(pid, payload.model_dump(exclude_unset=True))

@router.delete(
    "/{pid}",
    status_code=204,
    summary="Eliminar plan",
    description="Elimina el plan si **no** está referenciado por suscripciones.",
    responses={
        204: {"description": "Eliminado."},
        404: {"model": ErrorResponse, "description": "Plan no encontrado."},
        409: {"model": ErrorResponse, "description": "Plan en uso por suscripciones."},
    },
)
async def delete_plan(pid: str):
    await svc.delete_plan(pid)
    return Response(status_code=204)
