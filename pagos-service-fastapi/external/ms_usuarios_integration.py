from __future__ import annotations
from typing import Optional, Dict, Any
import httpx

from domain.settings import settings

class MsUsuariosIntegration:
    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or settings.usuarios_service_url).rstrip("/")
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    async def get_usuario_from_jwt(self, token: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v1/auth/me"
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    async def get_usuario_info(self, id_usuario: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v1/usuario/{id_usuario}"
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()


_integration: Optional[MsUsuariosIntegration] = None

def get_usuarios_integration() -> MsUsuariosIntegration:
    global _integration
    if _integration is None:
        _integration = MsUsuariosIntegration()
    return _integration
