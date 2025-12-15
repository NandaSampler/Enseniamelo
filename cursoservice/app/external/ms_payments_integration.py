# cursoservice/app/external/ms_payments_integration.py
from __future__ import annotations

import os
from typing import Any, Dict, Optional, List

import httpx

from app.core.logging import get_logger

logger = get_logger(__name__)


def _truthy(v: str | None) -> bool:
    return str(v or "").strip().lower() in ("1", "true", "yes", "on")


class MsPaymentsIntegration:
    """
    Cliente para consultar límites de cursos desde payments-service.

    Config:
      PAYMENTS_SERVICE_URL:
        - recomendado en docker: http://payments-service:8002
        - alternativa por gateway (dev): https://localhost:8443/ms-payments  (ojo TLS self-signed)
      PAYMENTS_VERIFY_TLS: true/false (por defecto false, útil si usas https self-signed)
    """
    def __init__(self, base_url: Optional[str] = None):
        base_url = (base_url or os.getenv("PAYMENTS_SERVICE_URL", "http://payments-service:8002")).strip()
        self.base_url = base_url.rstrip("/")
        self.timeout = httpx.Timeout(10.0, connect=5.0)
        self.verify_tls = _truthy(os.getenv("PAYMENTS_VERIFY_TLS", "false"))

    def _headers(self, token: Optional[str]) -> Dict[str, str]:
        h: Dict[str, str] = {}
        if token:
            h["Authorization"] = f"Bearer {token}"
        return h

    async def _get(self, path: str, token: Optional[str]) -> httpx.Response:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify_tls) as client:
            return await client.get(url, headers=self._headers(token))

    async def list_my_subscriptions(self, token: str) -> List[Dict[str, Any]]:
        """
        payments-service: GET /v1/suscripciones/mias  (requiere Authorization)
        """
        resp = await self._get("/v1/suscripciones/mias", token)
        resp.raise_for_status()
        data = resp.json()
        return data if isinstance(data, list) else []

    async def get_plan(self, token: str, plan_id: str) -> Dict[str, Any]:
        """
        Intentamos GET /v1/planes/{id} y /v1/planes/{id}/ por si el router usa slash final.
        """
        for path in (f"/v1/planes/{plan_id}", f"/v1/planes/{plan_id}/"):
            resp = await self._get(path, token)
            if resp.status_code == 404:
                continue
            resp.raise_for_status()
            data = resp.json()
            return data if isinstance(data, dict) else {}
        raise httpx.HTTPStatusError("Plan no encontrado", request=None, response=resp)


_payments: Optional[MsPaymentsIntegration] = None


def get_payments_integration() -> MsPaymentsIntegration:
    global _payments
    if _payments is None:
        _payments = MsPaymentsIntegration()
        logger.info("MsPaymentsIntegration base_url=%s verify_tls=%s", _payments.base_url, _payments.verify_tls)
    return _payments
