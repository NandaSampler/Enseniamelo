from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field

EstadoReserva = Literal["pendiente", "confirmada", "cancelada"]

class ReservaBase(BaseModel):
    curso_id: str = Field(..., description="FK a curso.id (ObjectId)")
    horario_id: str = Field(..., description="FK a horario.id (ObjectId)")
    pagado: bool = Field(False, description="Indica si el pago fue realizado")
    estado: EstadoReserva = Field("pendiente", description="Estado de la reserva")

class ReservaCreate(ReservaBase):
    pass

class ReservaUpdate(BaseModel):
    pagado: Optional[bool] = None
    estado: Optional[EstadoReserva] = None

class ReservaOut(ReservaBase):
    id: str
    fecha: Optional[datetime] = None  # timestamp de creación
    actualizado: Optional[datetime] = None

    model_config = {"from_attributes": True}
