from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional, List

from pydantic import BaseModel, Field, conint, condecimal, constr, field_validator

Modalidad = Literal["online", "presencial", "mixto"]
EstadoCurso = Literal["activo", "inactivo", "cancelado"]

class CursoBase(BaseModel):
    # FK obligatoria
    tutor_id: str = Field(..., description="FK a tutor.id (ObjectId)")

    # Básicos
    nombre: constr(min_length=1, max_length=50) = Field(..., description="Nombre del curso")
    descripcion: Optional[constr(max_length=250)] = Field(None, description="Descripción breve")
    modalidad: Modalidad = Field(..., description="Cómo se imparte el curso")

    # Extras del ERD
    fotos: Optional[List[str]] = Field(default=None, description="URLs de imágenes del curso")
    necesita_reserva: bool = Field(False, description="Si requiere pagar reserva")
    precio_reserva: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = Field(
        None, description="Precio de la reserva si aplica"
    )
    tiene_cupo: bool = Field(True, description="Controla si se limita con cupo")
    cupo: Optional[conint(ge=0)] = Field(None, description="Capacidad total si tiene_cupo=True")

    # Compatibilidad con tu lógica anterior (si la usabas)
    cupo_ocupado: conint(ge=0) = Field(0, description="Cupos ya reservados")

    # Opcionales
    qr: Optional[constr(max_length=60)] = Field(None, description="Código/URL QR asociado")
    estado: EstadoCurso = Field("activo", description="Estado del curso")

    @field_validator("precio_reserva")
    @classmethod
    def valida_precio_reserva_si_necesita(cls, v: Optional[Decimal], info):
        if info.data.get("necesita_reserva") and (v is None or v < 0):
            raise ValueError("precio_reserva es requerido y >= 0 cuando necesita_reserva=True")
        return v

    @field_validator("cupo_ocupado")
    @classmethod
    def valida_cupos(cls, v: int, info):
        cupo = info.data.get("cupo")
        tiene_cupo = info.data.get("tiene_cupo", True)
        if tiene_cupo and cupo is not None and v > cupo:
            raise ValueError("cupo_ocupado no puede ser mayor que cupo")
        return v

class CursoCreate(CursoBase):
    pass

class CursoUpdate(BaseModel):
    tutor_id: Optional[str] = None
    nombre: Optional[constr(min_length=1, max_length=50)] = None
    descripcion: Optional[constr(max_length=250)] = None
    modalidad: Optional[Modalidad] = None
    fotos: Optional[List[str]] = None
    necesita_reserva: Optional[bool] = None
    precio_reserva: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None
    tiene_cupo: Optional[bool] = None
    cupo: Optional[conint(ge=0)] = None
    cupo_ocupado: Optional[conint(ge=0)] = None
    qr: Optional[constr(max_length=60)] = None
    estado: Optional[EstadoCurso] = None

    @field_validator("precio_reserva")
    @classmethod
    def valida_precio_reserva_update(cls, v: Optional[Decimal], info):
        # Si viene necesita_reserva=True en el mismo update, exige precio
        if info.data.get("necesita_reserva") is True and (v is None or v < 0):
            raise ValueError("precio_reserva es requerido y >= 0 cuando necesita_reserva=True")
        return v

    @field_validator("cupo_ocupado")
    @classmethod
    def valida_cupos_update(cls, v: Optional[int], info):
        if v is None:
            return v
        cupo = info.data.get("cupo")
        tiene_cupo = info.data.get("tiene_cupo")
        # Si no vino cupo/tiene_cupo en el update, el service debe validar con el valor actual.
        if (tiene_cupo in (None, True)) and cupo is not None and v > cupo:
            raise ValueError("cupo_ocupado no puede ser mayor que cupo")
        return v

class CursoOut(CursoBase):
    id: str = Field(..., description="Id del curso (ObjectId)")
    creado: Optional[datetime] = None
    actualizado: Optional[datetime] = None

    model_config = {"from_attributes": True}
