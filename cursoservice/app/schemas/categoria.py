from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, constr

class CategoriaBase(BaseModel):
    nombre: constr(min_length=1, max_length=50) = Field(..., description="Nombre de la categoría")

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nombre: Optional[constr(min_length=1, max_length=50)] = None

class CategoriaOut(CategoriaBase):
    id: str                                 # ObjectId como str
    creado: Optional[datetime] = None
    actualizado: Optional[datetime] = None

    model_config = {"from_attributes": True}
