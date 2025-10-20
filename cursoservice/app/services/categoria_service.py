# cursoservice/app/services/categoria_service.py
from __future__ import annotations
from typing import List

from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaOut
from app.repositories.categoria_repository import categoria_repo
from app.repositories.curso_categoria_repository import curso_categoria_repo


class CategoriaService:
    """Reglas de negocio para Categoria (Mongo)."""

    def list(self) -> List[CategoriaOut]:
        return categoria_repo.list()

    def get(self, categoria_id: str) -> CategoriaOut:
        try:
            return categoria_repo.get(categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")

    def create(self, payload: CategoriaCreate) -> CategoriaOut:
        # Si no tienes índice único por nombre en Mongo, mantenemos este chequeo.
        existentes = [c for c in categoria_repo.list() if c.nombre.lower() == payload.nombre.lower()]
        if existentes:
            raise ValueError("ya existe una categoría con ese nombre")
        return categoria_repo.create(payload)

    def update(self, categoria_id: str, payload: CategoriaUpdate) -> CategoriaOut:
        try:
            if payload.nombre is not None:
                for c in categoria_repo.list():
                    if c.id != categoria_id and c.nombre.lower() == payload.nombre.lower():
                        raise ValueError("ya existe una categoría con ese nombre")
            return categoria_repo.update(categoria_id, payload)
        except KeyError:
            raise KeyError("categoria no encontrada")

    def delete(self, categoria_id: str) -> None:
        # No permitir borrar si hay cursos vinculados
        if curso_categoria_repo.list_course_ids_of_category(categoria_id):
            raise ValueError("no se puede eliminar: categoría está vinculada a cursos")
        try:
            categoria_repo.delete(categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")
