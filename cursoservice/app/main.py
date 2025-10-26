# cursoservice/app/main.py
from __future__ import annotations
import os
import socket
from fastapi import FastAPI
from py_eureka_client import eureka_client

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.exceptions.handlers import register_exception_handlers
from app.api.v1.routers import (
    curso_router, categoria_router, curso_categoria_router, horario_router, reserva_router
)

# Importa SOLO las clases (no singletons) para evitar conectar en import
from app.repositories.curso_repository import CursoRepository
from app.repositories.categoria_repository import CategoriaRepository
from app.repositories.horario_repository import HorarioRepository
from app.repositories.reserva_repository import ReservaRepository
from app.repositories.curso_categoria_repository import CursoCategoriaRepository


APP_DESCRIPTION = "API para gestionar Cursos, Categorías, Horarios y Reservas."


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

    # Root informativo
    @app.get("/", tags=["Health"])
    def root():
        return {
            "name": settings.APP_NAME,
            "env": settings.APP_ENV,
            "docs": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
            "health": "/health",
        }

    # Health (Eureka/Gateway lo consultan)
    @app.get("/health", tags=["Health"])
    def health():
        return {"status": "UP"}

    register_exception_handlers(app)

    # ---------- Startup (ASYNC) ----------
    @app.on_event("startup")
    async def on_startup():
        # -------- Registro en Eureka (async) --------
        try:
            app_name = os.getenv("APP_NAME", "CURSOSERVICE")
            port = int(os.getenv("PORT", "8000"))
            eureka_server = os.getenv("EUREKA_SERVER", "http://eureka-server:8761/eureka/")

            hostname = socket.gethostname()
            try:
                instance_ip = socket.gethostbyname(hostname)
            except Exception:
                instance_ip = "127.0.0.1"

            # Para el status/health usa el host que publicas dentro de la red docker
            base_host = hostname  # o instance_ip si prefieres IP
            base_url = f"http://{base_host}:{port}"

            await eureka_client.init_async(
                eureka_server=eureka_server,
                app_name=app_name,
                instance_port=port,
                instance_host=hostname,     # p.ej. "cursoservice" (nombre del contenedor)
                instance_ip=instance_ip,    # IP interna del contenedor
                status_page_url=f"{base_url}/health",
                health_check_url=f"{base_url}/health",
                renewal_interval_in_secs=10,
                duration_in_secs=30,
            )
            logger.info("Registrado en Eureka como %s", app_name)
        except Exception as e:
            # No tumbar la app si falla el registro; log y seguimos
            logger.warning("No se pudo registrar en Eureka: %s", e)

        # -------- Índices de Mongo (no tumbar si falla) --------
        try:
            CursoRepository().ensure_indexes()
            CategoriaRepository().ensure_indexes()
            HorarioRepository().ensure_indexes()
            ReservaRepository().ensure_indexes()
            CursoCategoriaRepository().ensure_indexes()
            logger.info("Índices de Mongo verificados/creados")
        except Exception as e:
            logger.warning("No se pudieron crear índices de Mongo: %s", e)

    # ---------- Shutdown (ASYNC) ----------
    @app.on_event("shutdown")
    async def on_shutdown():
        try:
            await eureka_client.stop_async()
        except Exception as e:
            logger.debug("Error al detener eureka_client: %s", e)

    logger.info("Aplicación iniciada")
    return app


app = create_app()
