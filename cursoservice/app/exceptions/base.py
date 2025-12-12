# cursoservice/app/exceptions/base.py
from __future__ import annotations
from typing import Any, Dict, Optional


class BaseAppError(Exception):
    """Error de dominio genérico."""
    status_code: int = 400
    error_type: str = "app_error"

    def __init__(self, message: str, *, status_code: Optional[int] = None, error_type: Optional[str] = None, extra: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message)
        if status_code is not None:
            self.status_code = status_code
        if error_type is not None:
            self.error_type = error_type
        self.extra = extra or {}

    @property
    def message(self) -> str:
        return str(self)


class NotFoundError(BaseAppError):
    status_code = 404
    error_type = "not_found"


class BadRequestError(BaseAppError):
    status_code = 400
    error_type = "bad_request"


class ConflictError(BaseAppError):
    status_code = 409
    error_type = "conflict"


def build_error_payload(status_code: int, error_type: str, message: str, details: Optional[Any] = None) -> Dict[str, Any]:
    payload = {
        "error": {
            "type": error_type,
            "message": message,
            "status": status_code,
        }
    }
    if details is not None:
        payload["error"]["details"] = details
    return payload
