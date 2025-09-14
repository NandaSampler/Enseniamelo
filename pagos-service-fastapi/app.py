from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from api.routers.plans import router as plans_router
from api.routers.subscriptions import router as subs_router
from api.routers.payments import router as payments_router
from payments_errors.errors import AppError

app = FastAPI(title="Payments Service", version="1.0.0")

#Handlers globales de errores
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message, "extra": exc.extra}},
    )

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "validation_error", "message": "Payload inválido", "extra": exc.errors()}},
    )


# Registrar routers 
app.include_router(plans_router, prefix="/v1")
app.include_router(subs_router, prefix="/v1")
app.include_router(payments_router, prefix="/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8002, reload=True)

from fastapi.exceptions import RequestValidationError







