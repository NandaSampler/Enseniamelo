from __future__ import annotations
from typing import List

from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaOut
from app.repositories.categoria_repository import CategoriaRepository, get_categoria_repo
from app.repositories.curso_categoria_repository import get_curso_categoria_repo


class CategoriaService:
    """Reglas de negocio para Categoria (Mongo)."""

    def __init__(self, repo: CategoriaRepository | None = None) -> None:
        self.repo = repo or get_categoria_repo()
        self.curso_cat_repo = get_curso_categoria_repo()

    def list(self) -> List[CategoriaOut]:
        return self.repo.list()

    def get(self, categoria_id: str) -> CategoriaOut:
        try:
            return self.repo.get(categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")

    def create(self, payload: CategoriaCreate) -> CategoriaOut:
        # Si no tienes índice único por nombre en Mongo, mantenemos este chequeo.
        existentes = [c for c in self.repo.list() if c.nombre.lower() == payload.nombre.lower()]
        if existentes:
            raise ValueError("ya existe una categoría con ese nombre")
        return self.repo.create(payload)

    def update(self, categoria_id: str, payload: CategoriaUpdate) -> CategoriaOut:
        try:
            if payload.nombre is not None:
                for c in self.repo.list():
                    if c.id != categoria_id and c.nombre.lower() == payload.nombre.lower():
                        raise ValueError("ya existe una categoría con ese nombre")
            return self.repo.update(categoria_id, payload)
        except KeyError:
            raise KeyError("categoria no encontrada")

    def delete(self, categoria_id: str) -> None:
        # No permitir borrar si hay cursos vinculados
        if self.curso_cat_repo.list_course_ids_of_category(categoria_id):
            raise ValueError("no se puede eliminar: categoría está vinculada a cursos")
        try:
            self.repo.delete(categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")
