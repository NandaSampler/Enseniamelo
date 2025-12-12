from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, constr


class CategoriaBase(BaseModel):
    nombre: constr(min_length=1, max_length=50) = Field(..., description="Nombre de la categoría")
    descripcion: Optional[constr(max_length=250)] = Field(None, description="Descripción de la categoría")
    activa: bool = Field(True, description="Si la categoría está activa")


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[constr(min_length=1, max_length=50)] = None
    descripcion: Optional[constr(max_length=250)] = None
    activa: Optional[bool] = None


class CategoriaOut(CategoriaBase):
    id: str  # ObjectId como str
    fechaCreacion: Optional[datetime] = None   # mismo nombre que en Mongo

    model_config = {"from_attributes": True}
