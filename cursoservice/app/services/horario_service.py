from __future__ import annotations
from typing import List, Optional

from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioOut
from app.repositories.horario_repository import HorarioRepository, get_horario_repo
from app.repositories.curso_repository import CursoRepository, get_curso_repo
from app.repositories.reserva_repository import get_reserva_repo


def _overlaps(a_start, a_end, b_start, b_end) -> bool:
    return a_start < b_end and a_end > b_start


class HorarioService:
    """Reglas de negocio para Horario (Mongo)."""

    def __init__(
        self,
        repo: HorarioRepository | None = None,
        curso_repo: CursoRepository | None = None,
        allow_overlaps: bool = True,  # ✅ permitir solapes por defecto
    ) -> None:
        self.repo = repo or get_horario_repo()
        self.curso_repo = curso_repo or get_curso_repo()
        self.allow_overlaps = allow_overlaps

    def list(self, id_curso: Optional[str] = None) -> List[HorarioOut]:
        return self.repo.list(id_curso=id_curso)

    def get(self, horario_id: str) -> HorarioOut:
        try:
            return self.repo.get(horario_id)
        except KeyError:
            raise KeyError("horario no encontrado")

    def create(self, payload: HorarioCreate) -> HorarioOut:
        # curso debe existir
        try:
            self.curso_repo.get(payload.id_curso)
        except KeyError:
            raise KeyError("curso no encontrado")

        # ✅ ANTES bloqueabas solapes. Ahora: solo se valida si allow_overlaps=False
        if not self.allow_overlaps:
            for h in self.repo.list(id_curso=payload.id_curso):
                if _overlaps(payload.inicio, payload.fin, h.inicio, h.fin):
                    raise ValueError("el horario se solapa con otro existente para el mismo curso")

        return self.repo.create(payload)

    def update(self, horario_id: str, payload: HorarioUpdate) -> HorarioOut:
        current = self.get(horario_id)

        new_id_curso = payload.id_curso if payload.id_curso is not None else current.id_curso
        new_inicio = payload.inicio if payload.inicio is not None else current.inicio
        new_fin = payload.fin if payload.fin is not None else current.fin

        try:
            self.curso_repo.get(new_id_curso)
        except KeyError:
            raise KeyError("curso no encontrado")

        # ✅ Permitir solapes por defecto
        if not self.allow_overlaps:
            for h in self.repo.list(id_curso=new_id_curso):
                if h.id == horario_id:
                    continue
                if _overlaps(new_inicio, new_fin, h.inicio, h.fin):
                    raise ValueError("el horario se solapa con otro existente para el mismo curso")

        try:
            return self.repo.update(horario_id, payload)
        except KeyError:
            raise KeyError("horario no encontrado")

    def delete(self, horario_id: str) -> None:
        # Impedir borrar si hay reservas para ese horario
        reserva_repo = get_reserva_repo()
        if reserva_repo.list(id_horario=horario_id):
            raise ValueError("no se puede eliminar: existen reservas para este horario")
        try:
            self.repo.delete(horario_id)
        except KeyError:
            raise KeyError("horario no encontrado")
