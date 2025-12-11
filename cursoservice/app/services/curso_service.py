from __future__ import annotations
from typing import List, Optional

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut

from app.repositories.curso_repository import CursoRepository, get_curso_repo
from app.repositories.horario_repository import HorarioRepository, get_horario_repo
from app.repositories.reserva_repository import ReservaRepository, get_reserva_repo
from app.repositories.curso_categoria_repository import (
    CursoCategoriaRepository, get_curso_categoria_repo
)


class CursoService:
    """Reglas de negocio para Curso (Mongo)."""

    def __init__(self,
                 repo: Optional[CursoRepository] = None,
                 horario_repo: Optional[HorarioRepository] = None,
                 reserva_repo: Optional[ReservaRepository] = None,
                 curso_categoria_repo: Optional[CursoCategoriaRepository] = None) -> None:
        self.repo = repo or get_curso_repo()
        self.horario_repo = horario_repo or get_horario_repo()
        self.reserva_repo = reserva_repo or get_reserva_repo()
        self.curso_categoria_repo = curso_categoria_repo or get_curso_categoria_repo()

    # Query
    def list(self, q: Optional[str] = None, id_tutor: Optional[str] = None) -> List[CursoOut]:
        return self.repo.list(q=q, id_tutor=id_tutor)

    def get(self, curso_id: str) -> CursoOut:
        try:
            return self.repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

    # Commands
    def create(self, payload: CursoCreate) -> CursoOut:
        return self.repo.create(payload)

    def update(self, curso_id: str, payload: CursoUpdate) -> CursoOut:
        try:
            return self.repo.update(curso_id, payload)
        except KeyError:
            raise KeyError("curso no encontrado")
        except ValueError as e:
            raise ValueError(str(e))

    def delete(self, curso_id: str) -> None:
        # Reglas: no permitir borrar si hay dependencias
        if self.horario_repo.list(id_curso=curso_id):
            raise ValueError("no se puede eliminar: curso tiene horarios")
        if self.reserva_repo.list(id_curso=curso_id):
            raise ValueError("no se puede eliminar: curso tiene reservas")
        if self.curso_categoria_repo.list_category_ids_of_course(curso_id):
            raise ValueError("no se puede eliminar: curso tiene categorías vinculadas")

        try:
            self.repo.delete(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")
