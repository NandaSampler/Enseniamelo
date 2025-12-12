from fastapi import APIRouter, Header, Query, Response
from domain.schemas import PagoCreate, PagoOut, PagoUpdate, ErrorResponse, PagoEstado, MetodoPago
from domain.services import PaymentsService

router = APIRouter(prefix="/pagos", tags=["pagos"])
svc = PaymentsService()

@router.get(
    "/",
    response_model=list[PagoOut],
    summary="Listar pagos",
    description="Devuelve pagos desde MongoDB. Permite filtrar por `id_suscripcion`, `estado` y `metodo`.",
)
async def list_payments(
    id_suscripcion: str | None = Query(default=None, description="Filtrar por ID de suscripción."),
    estado: PagoEstado | None = Query(default=None, description="Filtrar por estado."),
    metodo: MetodoPago | None = Query(default=None, description="Filtrar por método."),
):
    return await svc.list_pagos(id_suscripcion=id_suscripcion, estado=estado, metodo=metodo)

@router.post(
    "/",
    response_model=PagoOut,
    status_code=201,
    summary="Crear pago",
    description="Crea un pago en estado `creado`. Soporta idempotencia vía header `X-Idempotency-Key`.",
    responses={
        404: {"model": ErrorResponse, "description": "Suscripción no encontrada."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
async def create_payment(
    payload: PagoCreate,
    x_idempotency_key: str | None = Header(
        default=None,
        alias="X-Idempotency-Key",
        description="Clave opcional para idempotencia. Si se repite, retorna el mismo resultado previo."
    ),
):
    return await svc.create_pago(payload.id_suscripcion, payload.monto, payload.metodo, x_idempotency_key)

@router.get(
    "/{pid}",
    response_model=PagoOut,
    summary="Obtener pago por ID",
    responses={404: {"model": ErrorResponse, "description": "Pago no encontrado."}},
)
async def get_payment(pid: str):
    return await svc.get_pago(pid)

@router.put(
    "/{pid}",
    response_model=PagoOut,
    summary="Actualizar pago",
    description="Permite actualizar `estado` y/o `provider_ref`. Si `estado` pasa a `exitoso`, "
                "la suscripción asociada cambia a `activa`.",
    responses={
        404: {"model": ErrorResponse, "description": "Pago no encontrado."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
async def update_payment(pid: str, payload: PagoUpdate):
    return await svc.update_pago(pid, payload.model_dump(exclude_unset=True))

@router.delete(
    "/{pid}",
    status_code=204,
    summary="Eliminar pago",
    description="No permite eliminar pagos en estado `exitoso`.",
    responses={
        204: {"description": "Eliminado."},
        404: {"model": ErrorResponse, "description": "Pago no encontrado."},
        409: {"model": ErrorResponse, "description": "No se puede eliminar un pago exitoso."},
    },
)
async def delete_payment(pid: str):
    await svc.delete_pago(pid)
    return Response(status_code=204)
