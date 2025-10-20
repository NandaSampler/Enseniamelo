from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class HorarioBase(BaseModel):
    curso_id: str = Field(..., description="FK a curso.id (ObjectId)")
    inicio: datetime = Field(..., description="Fecha y hora de inicio")
    fin: datetime = Field(..., description="Fecha y hora de fin")

    @field_validator("fin")
    @classmethod
    def validate_fin(cls, fin: datetime, info):
        inicio = info.data.get("inicio")
        if inicio and fin <= inicio:
            raise ValueError("fin debe ser mayor que inicio")
        return fin

class HorarioCreate(HorarioBase):
    pass

class HorarioUpdate(BaseModel):
    curso_id: Optional[str] = None
    inicio: Optional[datetime] = None
    fin: Optional[datetime] = None

    @field_validator("fin")
    @classmethod
    def validate_fin_update(cls, fin: Optional[datetime], info):
        if fin is None:
            return fin
        inicio = info.data.get("inicio")
        if inicio and fin <= inicio:
            raise ValueError("fin debe ser mayor que inicio")
        return fin

class HorarioOut(HorarioBase):
    id: str
    creado: Optional[datetime] = None
    actualizado: Optional[datetime] = None

    model_config = {"from_attributes": True}
