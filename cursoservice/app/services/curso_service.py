# cursoservice/app/services/curso_service.py
from __future__ import annotations
from typing import List, Optional

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut
from app.repositories.curso_repository import curso_repo
from app.repositories.horario_repository import horario_repo
from app.repositories.reserva_repository import reserva_repo
from app.repositories.curso_categoria_repository import curso_categoria_repo


class CursoService:
    """Reglas de negocio para Curso (Mongo)."""

    # Query
    def list(self, q: Optional[str] = None) -> List[CursoOut]:
        return curso_repo.list(q=q)

    def get(self, curso_id: str) -> CursoOut:
        try:
            return curso_repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

    # Commands
    def create(self, payload: CursoCreate) -> CursoOut:
        # Reglas: si necesita_reserva => precio_reserva requerido (ya valida el schema),
        # si tiene_cupo => cupo requerido lo valida el repo/service (ver repo).
        return curso_repo.create(payload)

    def update(self, curso_id: str, payload: CursoUpdate) -> CursoOut:
        try:
            return curso_repo.update(curso_id, payload)
        except KeyError:
            raise KeyError("curso no encontrado")
        except ValueError as e:
            raise ValueError(str(e))

    def delete(self, curso_id: str) -> None:
        # Reglas: no permitir borrar si hay dependencias
        if horario_repo.list(curso_id=curso_id):
            raise ValueError("no se puede eliminar: curso tiene horarios")
        if reserva_repo.list(curso_id=curso_id):
            raise ValueError("no se puede eliminar: curso tiene reservas")
        if curso_categoria_repo.list_category_ids_of_course(curso_id):
            raise ValueError("no se puede eliminar: curso tiene categorías vinculadas")

        try:
            curso_repo.delete(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")
