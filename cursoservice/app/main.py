# cursoservice/app/main.py
from __future__ import annotations

from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.exceptions.handlers import register_exception_handlers

from app.api.v1.routers import (
    curso_router,
    categoria_router,
    curso_categoria_router,
    horario_router,
    reserva_router,
)

APP_DESCRIPTION = """
API para gestionar Cursos, Categorías, Horarios y Reservas.
Incluye validaciones de negocio (cupos, solapes de horarios, vínculos curso-categoría).
"""

def create_app() -> FastAPI:
    setup_logging()
    logger = get_logger(__name__)

    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        description=APP_DESCRIPTION,
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Routers
    app.include_router(curso_router.router)
    app.include_router(categoria_router.router)
    app.include_router(curso_categoria_router.router)
    app.include_router(horario_router.router)
    app.include_router(reserva_router.router)

    # Excepciones globales uniformes
    register_exception_handlers(app)

    @app.get("/", tags=["Health"])
    def health():
        return {
            "name": settings.APP_NAME,
            "env": settings.APP_ENV,
            "docs": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
        }

    logger.info("Aplicación iniciada")
    return app


app = create_app()
