from __future__ import annotations
from typing import List, Optional

from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut, EstadoReserva
from app.repositories.reserva_repository import ReservaRepository, get_reserva_repo
from app.repositories.horario_repository import get_horario_repo
from app.repositories.curso_repository import CursoRepository, get_curso_repo


class ReservaService:
    """Reglas de negocio para Reserva (Mongo).
    - Verifica curso y horario.
    - Asegura que el horario pertenezca al curso.
    - Controla cupos del curso (incrementa/decrementa según estado).
    """

    def __init__(self,
                 repo: ReservaRepository | None = None,
                 curso_repo: CursoRepository | None = None) -> None:
        self.repo = repo or get_reserva_repo()
        self.curso_repo = curso_repo or get_curso_repo()
        self.horario_repo = get_horario_repo()

    def list(
        self,
        id_usuario: Optional[str] = None,
        id_curso: Optional[str] = None,
        id_horario: Optional[str] = None,
    ) -> List[ReservaOut]:
        return self.repo.list(
            id_usuario=id_usuario,
            id_curso=id_curso,
            id_horario=id_horario,
        )

    def get(self, reserva_id: str) -> ReservaOut:
        try:
            return self.repo.get(reserva_id)
        except KeyError:
            raise KeyError("reserva no encontrada")

    def _assert_integridad(self, id_curso: str, id_horario: str) -> None:
        # curso y horario deben existir y estar vinculados
        try:
            curso = self.curso_repo.get(id_curso)
        except KeyError:
            raise KeyError("curso no encontrado")

        try:
            horario = self.horario_repo.get(id_horario)
        except KeyError:
            raise KeyError("horario no encontrado")

        if horario.id_curso != curso.id:
            raise ValueError("el horario indicado no pertenece al curso")

    def create(self, payload: ReservaCreate) -> ReservaOut:
        # integridad
        self._assert_integridad(payload.id_curso, payload.id_horario)

        # Control de cupos: solo consumen cupo reservas no canceladas
        if payload.estado != "cancelada":
            try:
                self.curso_repo.increment_cupo(payload.id_curso, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))

        return self.repo.create(payload)

    def update(self, reserva_id: str, payload: ReservaUpdate) -> ReservaOut:
        # Tomar estado anterior para aplicar reglas de cupo
        current = self.get(reserva_id)
        new_estado: EstadoReserva = payload.estado if payload.estado is not None else current.estado

        # Transiciones de cupo:
        # - NO cancelada -> cancelada: liberar cupo
        # - cancelada -> NO cancelada: consumir cupo
        if current.estado != "cancelada" and new_estado == "cancelada":
            try:
                self.curso_repo.decrement_cupo(current.id_curso, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))
        elif current.estado == "cancelada" and new_estado != "cancelada":
            try:
                self.curso_repo.increment_cupo(current.id_curso, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))

        try:
            return self.repo.update(reserva_id, payload)
        except KeyError:
            raise KeyError("reserva no encontrada")

    def delete(self, reserva_id: str) -> None:
        # Si estaba activa (no cancelada), liberar cupo al borrar
        try:
            current = self.repo.get(reserva_id)
        except KeyError:
            raise KeyError("reserva no encontrada")

        if current.estado != "cancelada":
            try:
                self.curso_repo.decrement_cupo(current.id_curso, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))

        try:
            self.repo.delete(reserva_id)
        except KeyError:
            raise KeyError("reserva no encontrada")
