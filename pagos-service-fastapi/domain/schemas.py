from typing import Literal, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, constr


from uuid import UUID

# Documentar respuestas de error
class ErrorBody(BaseModel):
    code: str = Field(..., examples=["not_found", "validation_error"])
    message: str = Field(..., examples=["Pago no encontrado", "Payload inválido"])
    extra: Optional[Any] = Field(None, description="Detalles adicionales")

class ErrorResponse(BaseModel):
    error: ErrorBody

# Valores válidos/ @Schema(allowableValues=
PlanEstado = Literal["activo", "inactivo"]
SubsEstado = Literal["pendiente", "activa", "expirada", "cancelada"]
PagoEstado = Literal["creado", "procesando", "exitoso", "fallido", "reembolsado"]
MetodoPago = Literal["tarjeta", "transferencia", "stripe_simulado"]


# ---------- Planes ----------
class PlanCreate(BaseModel):
    nombre: str = Field(..., min_length=1, description="Nombre del plan")
    precio: float = Field(..., gt=0, description="Precio del plan")
    duracion: int = Field(..., gt=0, description="Duración en días")
    estado: Literal["activo", "inactivo"] = Field(..., description="Estado del plan")
    model_config = ConfigDict(json_schema_extra={
        "example": {"nombre":"Basic","precio":9.99,"duracion":30,"estado":"activo"}
    })

class PlanUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1)
    precio: Optional[float] = Field(None, gt=0)
    duracion: Optional[int] = Field(None, gt=0)
    estado: Optional[Literal["activo","inactivo"]] = None
    model_config = ConfigDict(json_schema_extra={"example":{"precio":12.99,"estado":"activo"}})

class PlanOut(BaseModel):
    id: str
    nombre: str
    precio: float
    duracion: int
    estado: Literal["activo","inactivo"]

# ---------- Suscripciones ----------
class SubsCreate(BaseModel):
    user_id: str = Field(..., description="ID del usuario")
    plan_id: str = Field(..., description="ID del plan (ObjectId en string)")
    inicio_iso: str = Field(..., description="Fecha inicio ISO 8601 (YYYY-MM-DDTHH:MM:SS)")
    model_config = ConfigDict(json_schema_extra={
        "example":{"user_id":"user-1","plan_id":"64f1c24dbd3a1a33e6e9a111","inicio_iso":"2025-01-01T00:00:00"}
    })

class SubsUpdate(BaseModel):
    plan_id: Optional[str] = None
    inicio_iso: Optional[str] = None
    estado: Optional[Literal["cancelada"]] = None
    model_config = ConfigDict(json_schema_extra={"example":{"estado":"cancelada"}})

class SubsOut(BaseModel):
    id: str
    user_id: str
    plan_id: str
    inicio_iso: str
    fin_iso: str
    estado: Literal["pendiente","activa","cancelada"]

# ---------- Pagos ----------
class PagoCreate(BaseModel):
    suscripcion_id: str = Field(..., description="ID de la suscripción (ObjectId en string)")
    monto: float = Field(..., gt=0)
    metodo: Literal["tarjeta","transferencia","stripe_simulado"]
    model_config = ConfigDict(json_schema_extra={
        "example":{"suscripcion_id":"64f1c24dbd3a1a33e6e9a222","monto":9.99,"metodo":"stripe_simulado"}
    })

class PagoUpdate(BaseModel):
    estado: Optional[Literal["creado","exitoso","fallido","cancelado"]] = None
    provider_ref: Optional[str] = None
    model_config = ConfigDict(json_schema_extra={"example":{"estado":"exitoso","provider_ref":"sim_123"}})

class PagoOut(BaseModel):
    id: str
    suscripcion_id: str
    monto: float
    metodo: Literal["tarjeta","transferencia","stripe_simulado"]
    estado: Literal["creado","exitoso","fallido","cancelado"]
    provider_ref: str | None = None
