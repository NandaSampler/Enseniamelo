# cursoservice/app/schemas/curso_categoria.py
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, conint


class CursoCategoriaLink(BaseModel):
    curso_id: conint(ge=1) = Field(..., description="FK a curso.id")
    categoria_id: conint(ge=1) = Field(..., description="FK a categoria.id")


class CursoCategoriaOut(CursoCategoriaLink):
    id: int = Field(..., description="Identificador del vínculo curso-categoría")
    creado: Optional[datetime] = None

    model_config = {"from_attributes": True}
