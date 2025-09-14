from fastapi import APIRouter, Response
from domain.schemas import PlanOut, PlanCreate, PlanUpdate, ErrorResponse
from domain.services import PaymentsService

router = APIRouter(prefix="/planes", tags=["planes"])
svc = PaymentsService()

@router.get(
    "/",
    response_model=list[PlanOut],
    summary="Listar planes",
    description="Devuelve todos los planes disponibles (mock, en memoria).",
)
def list_plans():
    return svc.list_plans()

@router.post(
    "/",
    response_model=PlanOut,
    status_code=201,
    summary="Crear un plan",
    description="Crea un nuevo plan con nombre único, precio y duración.",
    responses={
        409: {"model": ErrorResponse, "description": "Conflicto (plan ya existe)."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
def create_plan(payload: PlanCreate):
    return svc.create_plan(payload.model_dump())

@router.put(
    "/{pid}",
    response_model=PlanOut,
    summary="Actualizar plan",
    description="Actualiza los campos del plan indicado.",
    responses={
        404: {"model": ErrorResponse, "description": "Plan no encontrado."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
def update_plan(pid: str, payload: PlanUpdate):
    return svc.update_plan(pid, payload.model_dump(exclude_none=True))

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
def delete_plan(pid: str):
    svc.delete_plan(pid)
    return Response(status_code=204)
