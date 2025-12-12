from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field, condecimal

EstadoReserva = Literal["pendiente", "confirmada", "cancelada"]


class ReservaBase(BaseModel):
    id_usuario: str = Field(..., description="FK a usuario._id (ObjectId)")
    id_curso: str = Field(..., description="FK a curso._id (ObjectId)")
    id_horario: str = Field(..., description="FK a horario._id (ObjectId)")

    pago: bool = Field(False, description="Indica si el pago fue realizado (Mongo: pago)")
    estado: EstadoReserva = Field("pendiente", description="Estado de la reserva (Mongo: estado)")
    monto: condecimal(ge=0, max_digits=10, decimal_places=2) = Field(
        ..., description="Monto de la reserva/pago (Mongo: monto)"
    )


class ReservaCreate(ReservaBase):
    # En tu doc de Mongo, `fecha` es la fecha/hora de la reserva (ej: inicio del horario)
    fecha: datetime = Field(..., description="Fecha/hora de la reserva (Mongo: fecha)")


class ReservaUpdate(BaseModel):
    pago: Optional[bool] = None
    estado: Optional[EstadoReserva] = None
    monto: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None

class ReservaOut(ReservaBase):
    id: str
    fecha: datetime
    fechaCreacion: Optional[datetime] = None  # Mongo: fechaCreacion
    actualizado: Optional[datetime] = None    # opcional para tracking de cambios

    model_config = {"from_attributes": True}
