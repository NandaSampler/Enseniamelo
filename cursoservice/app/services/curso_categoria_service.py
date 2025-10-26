from __future__ import annotations
from typing import List

from app.schemas.curso_categoria import CursoCategoriaLink, CursoCategoriaOut
from app.schemas.curso import CursoOut
from app.schemas.categoria import CategoriaOut

from app.repositories.curso_categoria_repository import (
    CursoCategoriaRepository, get_curso_categoria_repo
)
from app.repositories.curso_repository import CursoRepository, get_curso_repo
from app.repositories.categoria_repository import CategoriaRepository, get_categoria_repo


class CursoCategoriaService:
    """Reglas de negocio para el vínculo Curso-Categoria (Mongo)."""

    def __init__(self,
                 repo: CursoCategoriaRepository | None = None,
                 curso_repo: CursoRepository | None = None,
                 categoria_repo: CategoriaRepository | None = None) -> None:
        self.repo = repo or get_curso_categoria_repo()
        self.curso_repo = curso_repo or get_curso_repo()
        self.categoria_repo = categoria_repo or get_categoria_repo()

    def list(self) -> List[CursoCategoriaOut]:
        return self.repo.list()

    def add(self, link: CursoCategoriaLink) -> CursoCategoriaOut:
        # Integridad referencial básica
        try:
            self.curso_repo.get(link.curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")
        try:
            self.categoria_repo.get(link.categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")

        return self.repo.add(link)

    def remove(self, curso_id: str, categoria_id: str) -> None:
        # idempotente si no existe
        self.repo.remove(curso_id, categoria_id)

    def list_categories_of_course(self, curso_id: str) -> List[CategoriaOut]:
        # valida curso
        try:
            self.curso_repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

        cat_ids = self.repo.list_category_ids_of_course(curso_id)
        out: List[CategoriaOut] = []
        for cid in cat_ids:
            try:
                out.append(self.categoria_repo.get(cid))
            except KeyError:
                # si se borró la categoría pero quedó el vínculo, lo ignoramos
                continue
        return out

    def list_courses_of_category(self, categoria_id: str) -> List[CursoOut]:
        # valida categoría
        try:
            self.categoria_repo.get(categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")

        course_ids = self.repo.list_course_ids_of_category(categoria_id)
        out: List[CursoOut] = []
        for cur_id in course_ids:
            try:
                out.append(self.curso_repo.get(cur_id))
            except KeyError:
                continue
        return out
