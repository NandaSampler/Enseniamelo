# cursoservice/app/services/curso_categoria_service.py
from __future__ import annotations
from typing import List

from app.schemas.curso_categoria import CursoCategoriaLink, CursoCategoriaOut
from app.schemas.curso import CursoOut
from app.schemas.categoria import CategoriaOut

from app.repositories.curso_categoria_repository import curso_categoria_repo
from app.repositories.curso_repository import curso_repo
from app.repositories.categoria_repository import categoria_repo


class CursoCategoriaService:
    """Reglas de negocio para el vínculo Curso-Categoria (Mongo)."""

    def list(self) -> List[CursoCategoriaOut]:
        return curso_categoria_repo.list()

    def add(self, link: CursoCategoriaLink) -> CursoCategoriaOut:
        # Integridad referencial básica
        try:
            curso_repo.get(link.curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")
        try:
            categoria_repo.get(link.categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")

        return curso_categoria_repo.add(link)

    def remove(self, curso_id: str, categoria_id: str) -> None:
        # idempotente si no existe
        curso_categoria_repo.remove(curso_id, categoria_id)

    def list_categories_of_course(self, curso_id: str) -> List[CategoriaOut]:
        # valida curso
        try:
            curso_repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

        cat_ids = curso_categoria_repo.list_category_ids_of_course(curso_id)
        out: List[CategoriaOut] = []
        for cid in cat_ids:
            try:
                out.append(categoria_repo.get(cid))
            except KeyError:
                # si se borró la categoría pero quedó el vínculo, lo ignoramos
                continue
        return out

    def list_courses_of_category(self, categoria_id: str) -> List[CursoOut]:
        # valida categoría
        try:
            categoria_repo.get(categoria_id)
        except KeyError:
            raise KeyError("categoria no encontrada")

        course_ids = curso_categoria_repo.list_course_ids_of_category(categoria_id)
        out: List[CursoOut] = []
        for cur_id in course_ids:
            try:
                out.append(curso_repo.get(cur_id))
            except KeyError:
                continue
        return out
