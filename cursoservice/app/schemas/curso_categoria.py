from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class CursoCategoriaLink(BaseModel):
    curso_id: str = Field(..., description="FK a curso.id (ObjectId)")
    categoria_id: str = Field(..., description="FK a categoria.id (ObjectId)")

class CursoCategoriaOut(CursoCategoriaLink):
    id: str = Field(..., description="Id del vínculo curso-categoría (ObjectId)")
    creado: Optional[datetime] = None

    model_config = {"from_attributes": True}
