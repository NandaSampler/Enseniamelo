# cursoservice/app/repositories/reserva_repository.py
from __future__ import annotations
from datetime import datetime
from itertools import count
from threading import RLock
from typing import Dict, List, Optional

from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut


class ReservaRepository:
    """Repositorio in-memory para Reserva."""
    def __init__(self) -> None:
        self._data: Dict[int, dict] = {}
        self._id = count(start=1)
        self._lock = RLock()

    def list(self, curso_id: Optional[int] = None, horario_id: Optional[int] = None) -> List[ReservaOut]:
        with self._lock:
            items = list(self._data.values())
        if curso_id is not None:
            items = [r for r in items if r["curso_id"] == curso_id]
        if horario_id is not None:
            items = [r for r in items if r["horario_id"] == horario_id]
        return [ReservaOut(**r) for r in items]

    def get(self, reserva_id: int) -> ReservaOut:
        with self._lock:
            r = self._data.get(reserva_id)
        if not r:
            raise KeyError("reserva no encontrada")
        return ReservaOut(**r)

    def create(self, payload: ReservaCreate) -> ReservaOut:
        now = datetime.utcnow()
        rid = next(self._id)
        record = payload.model_dump()
        record.update({"id": rid, "fecha": now, "actualizado": now})
        with self._lock:
            self._data[rid] = record
        return ReservaOut(**record)

    def update(self, reserva_id: int, payload: ReservaUpdate) -> ReservaOut:
        with self._lock:
            if reserva_id not in self._data:
                raise KeyError("reserva no encontrada")
            current = self._data[reserva_id].copy()
            current.update(payload.model_dump(exclude_unset=True))
            current["actualizado"] = datetime.utcnow()
            self._data[reserva_id] = current
            return ReservaOut(**current)

    def delete(self, reserva_id: int) -> None:
        with self._lock:
            if reserva_id not in self._data:
                raise KeyError("reserva no encontrada")
            del self._data[reserva_id]

    def clear(self) -> None:
        with self._lock:
            self._data.clear()


reserva_repo = ReservaRepository()
