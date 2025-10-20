# cursoservice/app/services/horario_service.py
from __future__ import annotations
from typing import List, Optional

from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioOut
from app.repositories.horario_repository import horario_repo
from app.repositories.curso_repository import curso_repo


def _overlaps(a_start, a_end, b_start, b_end) -> bool:
    # solapa si el inicio es antes del fin del otro y el fin es después del inicio del otro
    return a_start < b_end and a_end > b_start


class HorarioService:
    """Reglas de negocio para Horario (Mongo)."""

    def list(self, curso_id: Optional[str] = None) -> List[HorarioOut]:
        return horario_repo.list(curso_id=curso_id)

    def get(self, horario_id: str) -> HorarioOut:
        try:
            return horario_repo.get(horario_id)
        except KeyError:
            raise KeyError("horario no encontrado")

    def create(self, payload: HorarioCreate) -> HorarioOut:
        # curso debe existir
        try:
            curso_repo.get(payload.curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

        # Evitar solapes de horarios del mismo curso
        for h in horario_repo.list(curso_id=payload.curso_id):
            if _overlaps(payload.inicio, payload.fin, h.inicio, h.fin):
                raise ValueError("el horario se solapa con otro existente para el mismo curso")

        return horario_repo.create(payload)

    def update(self, horario_id: str, payload: HorarioUpdate) -> HorarioOut:
        current = self.get(horario_id)

        new_curso_id = payload.curso_id if payload.curso_id is not None else current.curso_id
        new_inicio = payload.inicio if payload.inicio is not None else current.inicio
        new_fin = payload.fin if payload.fin is not None else current.fin

        try:
            curso_repo.get(new_curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

        for h in horario_repo.list(curso_id=new_curso_id):
            if h.id == horario_id:
                continue
            if _overlaps(new_inicio, new_fin, h.inicio, h.fin):
                raise ValueError("el horario se solapa con otro existente para el mismo curso")

        try:
            return horario_repo.update(horario_id, payload)
        except KeyError:
            raise KeyError("horario no encontrado")

    def delete(self, horario_id: str) -> None:
        # Impedir borrar si hay reservas para ese horario
        from app.repositories.reserva_repository import reserva_repo  # evitar ciclos
        if reserva_repo.list(horario_id=horario_id):
            raise ValueError("no se puede eliminar: existen reservas para este horario")
        try:
            horario_repo.delete(horario_id)
        except KeyError:
            raise KeyError("horario no encontrado")
