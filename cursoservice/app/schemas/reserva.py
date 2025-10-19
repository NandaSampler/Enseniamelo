# cursoservice/app/schemas/reserva.py
from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, conint


EstadoReserva = Literal["pendiente", "confirmada", "cancelada"]


class ReservaBase(BaseModel):
    curso_id: conint(ge=1) = Field(..., description="FK a curso.id")
    horario_id: conint(ge=1) = Field(..., description="FK a horario.id")
    pagado: bool = Field(False, description="Indica si el pago fue realizado")
    estado: EstadoReserva = Field("pendiente", description="Estado de la reserva")


class ReservaCreate(ReservaBase):
    pass


class ReservaUpdate(BaseModel):
    pagado: Optional[bool] = None
    estado: Optional[EstadoReserva] = None


class ReservaOut(ReservaBase):
    id: int
    fecha: Optional[datetime] = None  # timestamp de creación
    actualizado: Optional[datetime] = None

    model_config = {"from_attributes": True}
