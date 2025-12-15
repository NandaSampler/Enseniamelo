from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, condecimal

# ✅ tu frontend usa "completada"
EstadoReserva = Literal["pendiente", "confirmada", "cancelada", "completada"]


class ReservaBase(BaseModel):
    id_usuario: str = Field(..., description="FK a usuario._id (ObjectId)")
    id_curso: str = Field(..., description="FK a curso._id (ObjectId)")

    # ✅ se asigna después cuando el tutor acepta
    id_horario: Optional[str] = Field(None, description="FK a horario._id (ObjectId)")

    pago: bool = Field(False, description="Indica si el pago fue realizado")
    estado: EstadoReserva = Field("pendiente", description="Estado de la reserva")

    # ✅ opcional: si no llega, se calcula con precio_reserva del curso o 0
    monto: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = Field(
        None, description="Monto de la reserva"
    )


class ReservaCreate(ReservaBase):
    # ✅ opcional: se puede setear cuando se crea el horario, o usar now()
    fecha: Optional[datetime] = Field(None, description="Fecha/hora de la reserva")


class ReservaUpdate(BaseModel):
    pago: Optional[bool] = None
    estado: Optional[EstadoReserva] = None
    monto: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None

    # ✅ permitir asignar horario/fecha después
    id_horario: Optional[str] = None
    fecha: Optional[datetime] = None


class ReservaOut(ReservaBase):
    id: str
    fecha: Optional[datetime] = None
    fechaCreacion: Optional[datetime] = None
    actualizado: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---------- Responses (para tu frontend: data.success, data.reservas, etc.) ----------
class ReservaResponse(BaseModel):
    success: bool = True
    reserva: ReservaOut


class ReservaListResponse(BaseModel):
    success: bool = True
    reservas: list[ReservaOut]


class DisponibilidadResponse(BaseModel):
    success: bool = True
    tiene_cupo_limitado: bool
    cupos_disponibles: Optional[int] = None
    tiene_disponibilidad: bool
    usuario_tiene_reserva: bool
