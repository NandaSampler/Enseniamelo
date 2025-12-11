# cursoservice/app/exceptions/handlers.py
from __future__ import annotations
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.exceptions.base import (
    BaseAppError,
    NotFoundError,
    BadRequestError,
    ConflictError,
    build_error_payload,
)

def register_exception_handlers(app: FastAPI) -> None:
    """Registra handlers globales con una respuesta JSON uniforme."""

    @app.exception_handler(BaseAppError)
    async def handle_base_app_error(_: Request, exc: BaseAppError):
        return JSONResponse(
            status_code=exc.status_code,
            content=build_error_payload(exc.status_code, exc.error_type, exc.message, getattr(exc, "extra", None)),
        )

    @app.exception_handler(KeyError)
    async def handle_key_error(_: Request, exc: KeyError):
        # Mapear KeyError a 404
        msg = str(exc) or "recurso no encontrado"
        return JSONResponse(
            status_code=404,
            content=build_error_payload(404, "not_found", msg.strip("'")),
        )

    @app.exception_handler(ValueError)
    async def handle_value_error(_: Request, exc: ValueError):
        # Reglas de negocio inválidas -> 400
        return JSONResponse(
            status_code=400,
            content=build_error_payload(400, "bad_request", str(exc)),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(_: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=build_error_payload(exc.status_code, "http_error", exc.detail),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError):
        # Errores de validación Pydantic/FastAPI -> 422
        return JSONResponse(
            status_code=422,
            content=build_error_payload(422, "validation_error", "Error de validación", details=exc.errors()),
        )

# Azúcar para importar rápido en main.py
__all__ = ["register_exception_handlers", "BaseAppError", "NotFoundError", "BadRequestError", "ConflictError"]
