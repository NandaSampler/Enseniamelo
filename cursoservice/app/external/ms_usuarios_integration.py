# cursoservice/app/external/ms_usuarios_integration.py
"""
Integración con el microservicio de usuarios para obtener información de tutores.
Estilo payments: /v1/auth/me -> mongo_user_id -> /v1/tutores/usuario/{mongo_user_id}
"""
from __future__ import annotations

import os
from typing import Optional, Dict, Any

import httpx

from app.core.logging import get_logger

logger = get_logger(__name__)


def _safe_text(resp: Optional[httpx.Response]) -> str:
    if resp is None:
        return ""
    try:
        return str(resp.json())
    except Exception:
        return (resp.text or "").strip()[:800]


class MsUsuariosIntegration:
    def __init__(self, base_url: str | None = None):
        base_url = (base_url or "http://usuarios:8081").strip()
        self.base_url = base_url.rstrip("/")
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    def _headers(self, token: Optional[str]) -> Dict[str, str]:
        h: Dict[str, str] = {}
        if token:
            h["Authorization"] = f"Bearer {token}"
        return h

    async def _get(self, path: str, token: Optional[str] = None) -> httpx.Response:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            return await client.get(url, headers=self._headers(token))

    async def get_usuario_from_jwt(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene el usuario usando /v1/auth/me (lee del JWT).
        Retorna dict o None si 404.
        """
        resp = await self._get("/v1/auth/me", token)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()

    async def get_perfil_tutor_by_usuario(
        self, id_usuario: str, token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene el perfil de tutor asociado a un usuario (id_usuario interno / Mongo).
        Retorna dict o None si 404.
        """
        resp = await self._get(f"/v1/tutores/usuario/{id_usuario}", token)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()

    async def get_perfil_tutor_by_id(
        self, id_tutor: str, token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene el perfil de tutor por su ID.
        Retorna dict o None si 404.
        """
        resp = await self._get(f"/v1/tutores/{id_tutor}", token)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()

    async def resolve_tutor_id_from_token(self, token: str) -> str:
        """
        Resuelve el id_tutor REAL usando el JWT:

        1) /v1/auth/me -> obtiene usuario interno {id/_id}
        2) /v1/tutores/usuario/{usuario_id} -> obtiene tutor {id/_id}
        """
        user = await self.get_usuario_from_jwt(token)
        if not user:
            raise ValueError("No se pudo obtener el usuario desde /v1/auth/me")

        usuario_id = user.get("id") or user.get("_id")
        if not usuario_id:
            raise ValueError("Respuesta de /v1/auth/me inválida: no incluye id/_id")

        tutor = await self.get_perfil_tutor_by_usuario(str(usuario_id), token)
        if not tutor:
            raise ValueError("El usuario autenticado no tiene perfil de tutor")

        tutor_id = tutor.get("id") or tutor.get("_id")
        if not tutor_id:
            raise ValueError("Respuesta de tutor inválida: no incluye id/_id")

        return str(tutor_id)

    # helpers para debug (opcional)
    @staticmethod
    def debug_http_error(e: httpx.HTTPStatusError) -> str:
        url = str(e.request.url) if e.request else "unknown_url"
        status = e.response.status_code if e.response else None
        body = _safe_text(e.response)
        return f"usuarios-service respondió {status} en {url}: {body}"


_integration: Optional[MsUsuariosIntegration] = None


def get_usuarios_integration() -> MsUsuariosIntegration:
    global _integration
    if _integration is None:
        base_url = os.getenv("USUARIOS_SERVICE_URL", "http://usuarios:8081")
        _integration = MsUsuariosIntegration(base_url)
        logger.info("MsUsuariosIntegration base_url=%s", _integration.base_url)
    return _integration
