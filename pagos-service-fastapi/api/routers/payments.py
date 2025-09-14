from fastapi import APIRouter, Header, Query
from domain.schemas import PagoCreate, PagoOut, PagoUpdate, ErrorResponse, PagoEstado, MetodoPago
from domain.services import PaymentsService

router = APIRouter(prefix="/pagos", tags=["pagos"])
svc = PaymentsService()

@router.get(
    "/",
    response_model=list[PagoOut],
    summary="Listar pagos",
    description="Devuelve pagos. Permite filtrar por `suscripcion_id`, `estado` y `metodo`.",
)
def list_payments(
    suscripcion_id: str | None = Query(default=None, description="Filtrar por ID de suscripción."),
    estado: PagoEstado | None = Query(default=None, description="Filtrar por estado."),
    metodo: MetodoPago | None = Query(default=None, description="Filtrar por método."),
):
    return svc.list_pagos(suscripcion_id=suscripcion_id, estado=estado, metodo=metodo)

@router.post(
    "/",
    response_model=PagoOut,
    status_code=201,
    summary="Crear pago",
    description="Crea un pago en estado `creado`. ",
    responses={
        404: {"model": ErrorResponse, "description": "Suscripción no encontrada."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
def create_payment(
    payload: PagoCreate,
    x_idempotency_key: str | None = Header(
        default=None,
        description="Clave opcional para idempotencia. Si se repite, retorna el mismo resultado previo."
    ),
):
    return svc.create_pago(payload.suscripcion_id, payload.monto, payload.metodo)

@router.get(
    "/{pid}",
    response_model=PagoOut,
    summary="Obtener pago por ID",
    responses={404: {"model": ErrorResponse, "description": "Pago no encontrado."}},
)
def get_payment(pid: str):
    return svc.get_pago(pid)

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
def update_payment(pid: str, payload: PagoUpdate):
    return svc.update_pago(pid, payload.model_dump(exclude_none=True))

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
def delete_payment(pid: str):
    svc.delete_pago(pid)
    return Response(status_code=204)
