from fastapi import APIRouter, Query, Response
from domain.schemas import SubsCreate, SubsOut, SubsUpdate, ErrorResponse, SubsEstado
from domain.services import PaymentsService

router = APIRouter(prefix="/suscripciones", tags=["suscripciones"])
svc = PaymentsService()

@router.get(
    "/",
    response_model=list[SubsOut],
    summary="Listar suscripciones",
    description="Devuelve suscripciones. Permite filtrar por `user_id`, `plan_id` y `estado`.",
)
def list_subscriptions(
    user_id: str | None = Query(default=None, description="Filtrar por usuario externo."),
    plan_id: str | None = Query(default=None, description="Filtrar por ID de plan."),
    estado: SubsEstado | None = Query(default=None, description="Filtrar por estado."),
):
    return svc.list_subs(user_id=user_id, plan_id=plan_id, estado=estado)


@router.post(
    "/",
    response_model=SubsOut,
    status_code=201,
    summary="Crear suscripción",
    description="Crea una suscripción **pendiente** basada en un plan existente. "
                "Calcula `fin_iso = inicio_iso + duracion(plan)`.",
    responses={
        404: {"model": ErrorResponse, "description": "Plan no encontrado."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
def create_subscription(payload: SubsCreate):
    return svc.create_sub(payload.user_id, payload.plan_id, payload.inicio_iso)

@router.get(
    "/{sid}",
    response_model=SubsOut,
    summary="Obtener suscripción por ID",
    responses={404: {"model": ErrorResponse, "description": "Suscripción no encontrada."}},
)
def get_subscription(sid: str):
    return svc.get_sub(sid)

@router.put(
    "/{sid}",
    response_model=SubsOut,
    summary="Actualizar suscripción",
    description="Permite cambiar `plan_id` o `inicio_iso` (recalcula `fin_iso`). "
                "Cambio de `estado` solo a **cancelada**.",
    responses={
        404: {"model": ErrorResponse, "description": "Suscripción/Plan no encontrado."},
        409: {"model": ErrorResponse, "description": "Transición de estado no permitida."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
def update_subscription(sid: str, payload: SubsUpdate):
    return svc.update_sub(sid, payload.model_dump(exclude_none=True))

@router.delete(
    "/{sid}",
    status_code=204,
    summary="Eliminar suscripción",
    description="Elimina la suscripción si **no** tiene pagos asociados.",
    responses={
        204: {"description": "Eliminada."},
        404: {"model": ErrorResponse, "description": "Suscripción no encontrada."},
        409: {"model": ErrorResponse, "description": "Tiene pagos asociados."},
    },
)
def delete_subscription(sid: str):
    svc.delete_sub(sid)
    return Response(status_code=204)
