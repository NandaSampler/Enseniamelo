# cursoservice/app/schemas/curso.py
from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field, conint, condecimal, constr, field_validator


Modalidad = Literal["online", "presencial", "mixto"]
EstadoCurso = Literal["activo", "inactivo", "cancelado"]


class CursoBase(BaseModel):
    nombre: constr(min_length=1, max_length=50) = Field(..., description="Nombre del curso")
    descripcion: Optional[constr(max_length=250)] = Field(None, description="Descripción breve")
    modalidad: Modalidad = Field(..., description="Cómo se imparte el curso")
    duracion_semanas: Optional[conint(ge=1, le=104)] = Field(
        None, description="Duración estimada en semanas"
    )
    costo_inscripcion: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None
    costo_curso: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None
    cupo_maximo: conint(ge=1, le=10000) = Field(..., description="Capacidad máxima")
    cupo_ocupado: conint(ge=0) = Field(0, description="Cupos ya reservados")
    estado: EstadoCurso = Field("activo", description="Estado del curso")

    @field_validator("cupo_ocupado")
    @classmethod
    def validate_cupos(cls, v: int, info):
        cupo_maximo = info.data.get("cupo_maximo")
        if cupo_maximo is not None and v > cupo_maximo:
            raise ValueError("cupo_ocupado no puede ser mayor que cupo_maximo")
        return v


class CursoCreate(CursoBase):
    pass


class CursoUpdate(BaseModel):
    nombre: Optional[constr(min_length=1, max_length=50)] = None
    descripcion: Optional[constr(max_length=250)] = None
    modalidad: Optional[Modalidad] = None
    duracion_semanas: Optional[conint(ge=1, le=104)] = None
    costo_inscripcion: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None
    costo_curso: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None
    cupo_maximo: Optional[conint(ge=1, le=10000)] = None
    cupo_ocupado: Optional[conint(ge=0)] = None
    estado: Optional[EstadoCurso] = None

    @field_validator("cupo_ocupado")
    @classmethod
    def validate_cupos_update(cls, v: Optional[int], info):
        if v is None:
            return v
        cupo_maximo = info.data.get("cupo_maximo")
        # Si no vino en el update, el service deberá comparar con el valor actual.
        if cupo_maximo is not None and v > cupo_maximo:
            raise ValueError("cupo_ocupado no puede ser mayor que cupo_maximo")
        return v


class CursoOut(CursoBase):
    id: int = Field(..., description="Identificador del curso")
    creado: Optional[datetime] = None
    actualizado: Optional[datetime] = None

    model_config = {"from_attributes": True}
