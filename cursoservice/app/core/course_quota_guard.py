# cursoservice/app/core/course_quota_guard.py
from __future__ import annotations

import os
from typing import Optional, Any, Dict

import httpx
from fastapi import Header, HTTPException, status

from app.core.auth_helper import extract_token_from_header
from app.core.logging import get_logger
from app.external.ms_usuarios_integration import get_usuarios_integration
from app.external.ms_payments_integration import get_payments_integration
from app.services.curso_service import CursoService

logger = get_logger(__name__)


def _get_free_limit() -> int:
    try:
        return int(os.getenv("FREE_COURSE_LIMIT", "3"))
    except Exception:
        return 3


def _fail_open() -> bool:
    # por defecto: NO fail-open (seguro). Si payments cae, bloquea creación.
    return str(os.getenv("COURSE_QUOTA_FAIL_OPEN", "false")).lower() in ("1", "true", "yes", "on")


def _is_active_sub(sub: Dict[str, Any]) -> bool:
    estado = (sub.get("estado") or sub.get("status") or "").strip().lower()
    return estado in ("activa", "activo", "active")


def _extract_plan_id(sub: Dict[str, Any]) -> Optional[str]:
    id_plan = sub.get("id_plan") or sub.get("plan_id")
    if isinstance(id_plan, dict):
        pid = id_plan.get("id") or id_plan.get("_id")
        return str(pid) if pid else None
    if id_plan is None:
        return None
    return str(id_plan)


async def _resolve_tutor_id_from_token(token: str) -> str:
    usuarios = get_usuarios_integration()
    return await usuarios.resolve_tutor_id_from_token(token)


async def _get_course_limit_from_payments(token: str) -> tuple[int, str]:
    """
    Retorna (limite, descripcion)
      - si no hay suscripción activa -> (FREE_COURSE_LIMIT, "gratis")
      - si hay suscripción activa -> (plan.cantidadCursos, "plan:<nombre>")
    """
    payments = get_payments_integration()
    subs = await payments.list_my_subscriptions(token)

    active = None
    for s in subs:
        if isinstance(s, dict) and _is_active_sub(s):
            active = s
            break

    if not active:
        return _get_free_limit(), "gratis"

    plan_id = _extract_plan_id(active)
    if not plan_id:
        raise ValueError("Suscripción activa pero no incluye id_plan")

    plan = await payments.get_plan(token, plan_id)
    limite = (
        plan.get("cantidadCursos")
        or plan.get("cantidad_cursos")
        or plan.get("cantidadCursos".lower())
    )

    if not isinstance(limite, int):
        # a veces viene como string
        try:
            limite = int(limite)
        except Exception:
            limite = None

    if not isinstance(limite, int) or limite <= 0:
        raise ValueError("No se pudo determinar cantidadCursos del plan")

    nombre = plan.get("nombre") or plan.get("name") or plan_id
    return limite, f'plan:{nombre}'


async def enforce_course_quota(
    authorization: Optional[str] = Header(None),
) -> None:
    """
    Dependency guard: bloquea creación si el tutor excede el límite de cursos
    (gratis=3, o cantidadCursos del plan activo).
    """
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")

    # 1) resolver tutor
    try:
        tutor_id = await _resolve_tutor_id_from_token(token)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("No se pudo resolver tutor desde token: %s", str(e))
        raise HTTPException(status_code=500, detail="Error validando tutor")

    # 2) contar cursos existentes del tutor
    try:
        cursos = CursoService().list(id_tutor=tutor_id)
        cursos_count = len(cursos) if isinstance(cursos, list) else 0
    except Exception as e:
        logger.exception("No se pudo contar cursos del tutor: %s", str(e))
        raise HTTPException(status_code=500, detail="Error contando cursos del tutor")

    # 3) obtener limite desde payments
    try:
        limite, origen = await _get_course_limit_from_payments(token)
    except (httpx.HTTPError, ValueError) as e:
        logger.warning("No se pudo validar límite con payments: %s", str(e))

        if _fail_open():
            # Modo DEV opcional: si payments está caído, no bloqueamos (NO recomendado)
            return

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo validar tu plan en este momento. Intenta nuevamente.",
        )

    # 4) validar
    if cursos_count >= limite:
        if origen == "gratis":
            msg = f"Has alcanzado el límite de {limite} cursos gratuitos. Debes suscribirte a un plan para crear más cursos."
        else:
            msg = f"Has alcanzado el límite de {limite} cursos permitido por tu {origen.replace('plan:', 'plan ')}."
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=msg)

    # ok
    return None
