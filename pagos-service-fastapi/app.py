# app.py (fragmento clave)
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
import py_eureka_client.eureka_client as eureka_client
from domain.settings import settings
from infra.mongo import connect_mongo, close_mongo, db
from infra.indexes import ensure_indexes
from payments_errors.errors import AppError
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from api.routers import plans, subscriptions, payments

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_mongo()
    await ensure_indexes()
    await eureka_client.init_async(
        eureka_server=f"http://{settings.eureka_host}:{settings.eureka_port}/eureka/",
        app_name=settings.eureka_app_name,                 # <- "payments-service"
        instance_host=settings.eureka_instance_host,       # <- "payments-service"
        instance_port=settings.eureka_instance_port,       # <- 8002
        instance_secure=settings.eureka_secure,
        health_check_url=f"http://{settings.eureka_instance_host}:{settings.eureka_instance_port}/health",
        renewal_interval_in_secs=settings.eureka_heartbeat,
        registry_fetch_interval=settings.eureka_refresh,
    )
    yield
    await close_mongo()

app = FastAPI(  # <-- CREA la app antes de los decorators
    title="Payments Service",
    version="1.0.0",
    lifespan=lifespan,
    description="API de pagos con Mongo Atlas, Eureka y Gateway.",
)

# Handlers globales
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status_code,
                        content={"error":{"code":exc.code,"message":exc.message,"extra":exc.extra}})

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422,
                        content={"error":{"code":"validation_error","message":"Payload inválido","extra":exc.errors()}})

# Routers versionados
app.include_router(plans.router, prefix="/v1")
app.include_router(subscriptions.router, prefix="/v1")
app.include_router(payments.router, prefix="/v1")

@app.get("/health", tags=["health"])
def health():
    return {"status": "UP"}

@app.get("/health/mongo", tags=["health"])
async def health_mongo():
    await db().command("ping")
    return {"mongo": "UP"}
