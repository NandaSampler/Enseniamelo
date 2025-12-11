from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional, List

from pydantic import BaseModel, Field, conint, condecimal, constr, field_validator

Modalidad = Literal["online", "presencial", "mixto"]
EstadoCurso = Literal["activo", "inactivo", "cancelado"]
EstadoVerificacion = Literal["pendiente", "aceptado", "rechazado"]
class CursoBase(BaseModel):
    # FK obligatoria (Mongo: id_tutor)
    id_tutor: str = Field(..., description="FK a tutor._id (ObjectId)")

    # Básicos
    nombre: constr(min_length=1, max_length=50) = Field(..., description="Nombre del curso")
    descripcion: Optional[constr(max_length=250)] = Field(None, description="Descripción breve")
    modalidad: Modalidad = Field(..., description="Cómo se imparte el curso")

    # Imágenes (Mongo: portada_url, galeria_urls, fotos)
    portada_url: Optional[str] = Field(None, description="URL de portada del curso")
    galeria_urls: Optional[List[str]] = Field(default=None, description="URLs de la galería")
    fotos: Optional[List[str]] = Field(default=None, description="URLs de imágenes del curso")
    # Reserva
    necesita_reserva: bool = Field(False, description="Si requiere pagar reserva")
    precio_reserva: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = Field(
        None, description="Precio de la reserva si aplica"
    )
    # Cupos (de tu diseño anterior; si no los usas, luego los podemos quitar)
    tiene_cupo: bool = Field(True, description="Controla si se limita con cupo")
    cupo: Optional[conint(ge=0)] = Field(None, description="Capacidad total si tiene_cupo=True")
    cupo_ocupado: conint(ge=0) = Field(0, description="Cupos ya reservados")

    # Estado del curso
    estado: EstadoCurso = Field("activo", description="Estado lógico del curso (negocio)")
    activo: bool = Field(True, description="Indicador de activación visible (Mongo: activo)")

    # Clasificación y verificación
    categorias: List[str] = Field(default_factory=list, description="Lista de ids de categorías (ObjectId)")
    tags: List[str] = Field(default_factory=list, description="Lista de tags")
    verificacion_estado: EstadoVerificacion = Field(
        "pendiente", description="Estado de verificación (Mongo: verificacion_estado)"
    )

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
    id_tutor: Optional[str] = None
    nombre: Optional[constr(min_length=1, max_length=50)] = None
    descripcion: Optional[constr(max_length=250)] = None
    modalidad: Optional[Modalidad] = None

    portada_url: Optional[str] = None
    galeria_urls: Optional[List[str]] = None
    fotos: Optional[List[str]] = None

    necesita_reserva: Optional[bool] = None
    precio_reserva: Optional[condecimal(ge=0, max_digits=10, decimal_places=2)] = None

    tiene_cupo: Optional[bool] = None
    cupo: Optional[conint(ge=0)] = None
    cupo_ocupado: Optional[conint(ge=0)] = None

    estado: Optional[EstadoCurso] = None
    activo: Optional[bool] = None

    categorias: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    verificacion_estado: Optional[EstadoVerificacion] = None

    @field_validator("precio_reserva")
    @classmethod
    def valida_precio_reserva_update(cls, v: Optional[Decimal], info):
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
        if (tiene_cupo in (None, True)) and cupo is not None and v > cupo:
            raise ValueError("cupo_ocupado no puede ser mayor que cupo")
        return v

class CursoOut(CursoBase):
    id: str = Field(..., description="Id del curso (ObjectId)")
    creado: Optional[datetime] = None
    actualizado: Optional[datetime] = None   # igual que en Mongo

    model_config = {"from_attributes": True}
