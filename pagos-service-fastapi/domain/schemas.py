from typing import Literal, Optional, Any
from pydantic import BaseModel, Field, ConfigDict

# ----------------- ERRORES -----------------

class ErrorBody(BaseModel):
    code: str = Field(..., examples=["not_found", "validation_error"])
    message: str = Field(..., examples=["Pago no encontrado", "Payload inválido"])
    extra: Optional[Any] = Field(None, description="Detalles adicionales")

class ErrorResponse(BaseModel):
    error: ErrorBody

# ----------------- ENUMS -----------------

PlanEstado = Literal["activo", "inactivo"]
SubsEstado = Literal["pendiente", "activa", "expirada", "cancelada"]
PagoEstado = Literal["creado", "procesando", "exitoso", "fallido", "reembolsado", "cancelado"]
MetodoPago = Literal["tarjeta", "transferencia", "stripe", "stripe_simulado"]

# ---------- PLANES ----------

class PlanCreate(BaseModel):
    nombre: str = Field(..., min_length=1, description="Nombre del plan")
    descripcion: str = Field(..., min_length=1, description="Descripción del plan")
    precio: float = Field(..., gt=0, description="Precio del plan")
    duracionDias: int = Field(..., gt=0, description="Duración en días")
    cantidadCursos: int = Field(..., gt=0, description="Cantidad de cursos que incluye")
    estado: PlanEstado = Field("activo", description="Estado del plan")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "nombre": "Plan prueba 1",
            "descripcion": "stripe 1",
            "precio": 5,
            "duracionDias": 30,
            "cantidadCursos": 4,
            "estado": "activo"
        }
    })

class PlanUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1)
    descripcion: Optional[str] = Field(None, min_length=1)
    precio: Optional[float] = Field(None, gt=0)
    duracionDias: Optional[int] = Field(None, gt=0)
    cantidadCursos: Optional[int] = Field(None, gt=0)
    estado: Optional[PlanEstado] = None

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "precio": 10,
            "estado": "inactivo"
        }
    })

class PlanOut(BaseModel):
    id: str
    nombre: str
    descripcion: str
    precio: float
    duracionDias: int
    cantidadCursos: int
    estado: PlanEstado
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

# ---------- SUSCRIPCIONES ----------

class SubsCreate(BaseModel):
    id_usuario: str = Field(..., description="ID del usuario (ObjectId en string)")
    id_plan: str = Field(..., description="ID del plan (ObjectId en string)")
    inicio: str = Field(..., description="Fecha inicio ISO 8601 (YYYY-MM-DDTHH:MM:SS)")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id_usuario": "69273c94255856093cddb381",
            "id_plan": "693a422519bbla8cea295ed3",
            "inicio": "2025-12-11T04:01:41"
        }
    })

class SubsUpdate(BaseModel):
    id_plan: Optional[str] = None
    inicio: Optional[str] = None
    estado: Optional[SubsEstado] = None  # el servicio limitará a "cancelada"

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "estado": "cancelada"
        }
    })

class SubsOut(BaseModel):
    id: str
    id_usuario: str
    id_plan: str
    inicio: str
    fin: str
    estado: SubsEstado
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    fechaCancelacion: Optional[str] = None

# ---------- PAGOS ----------

class PagoCreate(BaseModel):
    id_suscripcion: str = Field(..., description="ID de la suscripción (ObjectId en string)")
    monto: float = Field(..., gt=0)
    metodo: MetodoPago

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id_suscripcion": "693a428a19bbla8cea295ef1",
            "monto": 5,
            "metodo": "stripe"
        }
    })

class PagoUpdate(BaseModel):
    estado: Optional[PagoEstado] = None
    stripeSessionId: Optional[str] = None

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "estado": "exitoso",
            "stripeSessionId": "cs_test_a1..."
        }
    })

class PagoOut(BaseModel):
    id: str
    id_suscripcion: str
    monto: float
    metodo: MetodoPago
    estado: PagoEstado
    stripeSessionId: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UsuarioOut(BaseModel):
    # lo mínimo; dejamos extra permitido por si el MS usuarios trae más campos
    id: str | None = None
    email: str | None = None
    model_config = ConfigDict(extra="allow")

class SubsOutEnriched(SubsOut):
    usuario: UsuarioOut | None = None

class SubsCreateMe(BaseModel):
    id_plan: str
    inicio: str