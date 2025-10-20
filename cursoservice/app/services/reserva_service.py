# cursoservice/app/services/reserva_service.py
from __future__ import annotations
from typing import List, Optional

from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut, EstadoReserva
from app.repositories.reserva_repository import reserva_repo
from app.repositories.horario_repository import horario_repo
from app.repositories.curso_repository import curso_repo


class ReservaService:
    """Reglas de negocio para Reserva (Mongo).
    - Verifica curso y horario.
    - Asegura que el horario pertenezca al curso.
    - Controla cupos del curso (incrementa/decrementa según estado).
    """

    def list(self, curso_id: Optional[str] = None, horario_id: Optional[str] = None) -> List[ReservaOut]:
        return reserva_repo.list(curso_id=curso_id, horario_id=horario_id)

    def get(self, reserva_id: str) -> ReservaOut:
        try:
            return reserva_repo.get(reserva_id)
        except KeyError:
            raise KeyError("reserva no encontrada")

    def _assert_integridad(self, curso_id: str, horario_id: str) -> None:
        # curso y horario deben existir y estar vinculados
        try:
            curso = curso_repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

        try:
            horario = horario_repo.get(horario_id)
        except KeyError:
            raise KeyError("horario no encontrado")

        if horario.curso_id != curso.id:
            raise ValueError("el horario indicado no pertenece al curso")

    def create(self, payload: ReservaCreate) -> ReservaOut:
        # integridad
        self._assert_integridad(payload.curso_id, payload.horario_id)

        # Control de cupos: solo consumen cupo reservas no canceladas
        if payload.estado != "cancelada":
            try:
                curso_repo.increment_cupo(payload.curso_id, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))

        return reserva_repo.create(payload)

    def update(self, reserva_id: str, payload: ReservaUpdate) -> ReservaOut:
        # Tomar estado anterior para aplicar reglas de cupo
        current = self.get(reserva_id)
        new_estado: EstadoReserva = payload.estado if payload.estado is not None else current.estado

        # Transiciones de cupo:
        # - NO cancelada -> cancelada: liberar cupo
        # - cancelada -> NO cancelada: consumir cupo
        if current.estado != "cancelada" and new_estado == "cancelada":
            try:
                curso_repo.decrement_cupo(current.curso_id, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))
        elif current.estado == "cancelada" and new_estado != "cancelada":
            try:
                curso_repo.increment_cupo(current.curso_id, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))

        try:
            return reserva_repo.update(reserva_id, payload)
        except KeyError:
            raise KeyError("reserva no encontrada")

    def delete(self, reserva_id: str) -> None:
        # Si estaba activa (no cancelada), liberar cupo al borrar
        try:
            current = reserva_repo.get(reserva_id)
        except KeyError:
            raise KeyError("reserva no encontrada")

        if current.estado != "cancelada":
            try:
                curso_repo.decrement_cupo(current.curso_id, amount=1)
            except (KeyError, ValueError) as e:
                raise ValueError(str(e))

        try:
            reserva_repo.delete(reserva_id)
        except KeyError:
            raise KeyError("reserva no encontrada")
