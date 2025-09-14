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


# Planes
class PlanCreate(BaseModel):
    nombre: constr(strip_whitespace=True, min_length=1, max_length=50) = Field(
        ..., description="Nombre del plan."
    )
    precio: float = Field(..., gt=0, description="Precio en decimales.")
    duracion: int = Field(..., gt=0, description="Duración del plan en días.")
    estado: PlanEstado = Field("activo", description="Estado operativo del plan.")

    model_config = ConfigDict(json_schema_extra={
        "examples": [{
            "nombre": "Basic", "precio": 9.99, "duracion": 30, "estado": "activo"
        }]
    })

class PlanOut(PlanCreate):
    id: str = Field(..., description="Identificador del plan.")

# Suscripciones
class SubsCreate(BaseModel):
    user_id: str = Field(..., min_length=1, description="Identificador externo del usuario.")
    plan_id: str = Field(..., description="ID de plan existente.")
    inicio_iso: str = Field(..., description="Fecha/hora de inicio en formato ISO 8601.")

    model_config = ConfigDict(json_schema_extra={
        "examples": [{
            "user_id": "user-123",
            "plan_id": "plan_basic",
            "inicio_iso": "2025-09-11T09:00:00"
        }]
    })

class SubsOut(BaseModel):
    id: str
    user_id: str
    plan_id: str
    inicio_iso: str
    fin_iso: str #se calcula en services.py
    estado: SubsEstado

# Pagos
class PagoCreate(BaseModel):
    suscripcion_id: str = Field(..., description="ID de la suscripción destino.")
    monto: float = Field(..., gt=0, description="Monto a cobrar.")
    metodo: MetodoPago = Field(..., description="Medio de pago simulado.")

    model_config = ConfigDict(json_schema_extra={
        "examples": [{
            "suscripcion_id": "1",
            "monto": 9.99,
            "metodo": "stripe_simulado"
        }]
    })

class PagoOut(BaseModel):
    id: str
    suscripcion_id: str
    monto: float
    metodo: MetodoPago
    estado: PagoEstado
    provider_ref: Optional[str] = Field(None, description="Referencia del proveedor.")

# Actualizaciones

class PlanUpdate(BaseModel):
    nombre: constr(strip_whitespace=True, min_length=1, max_length=50) | None = Field(
        None, description="Nuevo nombre del plan."
    )
    precio: float | None = Field(None, gt=0, description="Nuevo precio.")
    duracion: int | None = Field(None, gt=0, description="Nueva duración en días.")
    estado: PlanEstado | None = Field(None, description="Nuevo estado.")
    model_config = ConfigDict(json_schema_extra={"examples": [{
        "nombre": "Basic Plus", "precio": 12.99, "duracion": 30, "estado": "activo"
    }]})

class SubsUpdate(BaseModel):
    plan_id: str | None = Field(None, description="Nuevo plan para la suscripción.")
    inicio_iso: str | None = Field(None, description="Nuevo inicio ISO 8601.")
    estado: SubsEstado | None = Field(
        None,
        description="Estado a aplicar",
    )
    model_config = ConfigDict(json_schema_extra={"examples": [{
        "plan_id": "plan_basic", "estado": "cancelada"
    }]})

class PagoUpdate(BaseModel):
    estado: PagoEstado | None = Field(
        None,
        description="Nuevo estado. Si pasa a `exitoso`, la suscripción se vuelve `activa`.",
    )
    provider_ref: str | None = Field(None, description="Referencia del proveedor")
    model_config = ConfigDict(json_schema_extra={"examples": [{
        "estado": "exitoso", "provider_ref": "stripe_sim_123"
    }]})
