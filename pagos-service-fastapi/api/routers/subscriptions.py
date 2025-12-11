from fastapi import APIRouter, Query, Response
from domain.schemas import SubsCreate, SubsOut, SubsUpdate, ErrorResponse, SubsEstado
from domain.services import PaymentsService

router = APIRouter(prefix="/suscripciones", tags=["suscripciones"])
svc = PaymentsService()

@router.get(
    "/",
    response_model=list[SubsOut],
    summary="Listar suscripciones",
    description="Devuelve suscripciones desde MongoDB. Permite filtrar por `id_usuario`, `id_plan` y `estado`.",
)
async def list_subscriptions(
    id_usuario: str | None = Query(default=None, description="Filtrar por usuario externo."),
    id_plan: str | None = Query(default=None, description="Filtrar por ID de plan."),
    estado: SubsEstado | None = Query(default=None, description="Filtrar por estado."),
):
    return await svc.list_subs(id_usuario=id_usuario, id_plan=id_plan, estado=estado)

@router.post(
    "/",
    response_model=SubsOut,
    status_code=201,
    summary="Crear suscripción",
    description="Crea una suscripción **pendiente** basada en un plan existente. Calcula `fin = inicio + duracionDias(plan)`.",
    responses={
        404: {"model": ErrorResponse, "description": "Plan no encontrado."},
        422: {"model": ErrorResponse, "description": "Error de validación."},
    },
)
async def create_subscription(payload: SubsCreate):
    return await svc.create_sub(payload.id_usuario, payload.id_plan, payload.inicio)

@router.get(
    "/{sid}",
    response_model=SubsOut,
    summary="Obtener suscripción por ID",
    responses={404: {"model": ErrorResponse, "description": "Suscripción no encontrada."}},
)
async def get_subscription(sid: str):
    return await svc.get_sub(sid)

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
async def update_subscription(sid: str, payload: SubsUpdate):
    return await svc.update_sub(sid, payload.model_dump(exclude_unset=True))

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
async def delete_subscription(sid: str):
    await svc.delete_sub(sid)
    return Response(status_code=204)
