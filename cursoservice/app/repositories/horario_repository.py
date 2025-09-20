# cursoservice/app/repositories/horario_repository.py
from __future__ import annotations
from datetime import datetime
from itertools import count
from threading import RLock
from typing import Dict, List, Optional

from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioOut


class HorarioRepository:
    """Repositorio in-memory para Horario."""
    def __init__(self) -> None:
        self._data: Dict[int, dict] = {}
        self._id = count(start=1)
        self._lock = RLock()

    def list(self, curso_id: Optional[int] = None) -> List[HorarioOut]:
        with self._lock:
            items = list(self._data.values())
        if curso_id is not None:
            items = [r for r in items if r["curso_id"] == curso_id]
        return [HorarioOut(**r) for r in items]

    def get(self, horario_id: int) -> HorarioOut:
        with self._lock:
            r = self._data.get(horario_id)
        if not r:
            raise KeyError("horario no encontrado")
        return HorarioOut(**r)

    def create(self, payload: HorarioCreate) -> HorarioOut:
        now = datetime.utcnow()
        rid = next(self._id)
        record = payload.model_dump()
        record.update({"id": rid, "creado": now, "actualizado": now})
        with self._lock:
            self._data[rid] = record
        return HorarioOut(**record)

    def update(self, horario_id: int, payload: HorarioUpdate) -> HorarioOut:
        with self._lock:
            if horario_id not in self._data:
                raise KeyError("horario no encontrado")
            current = self._data[horario_id].copy()
            current.update(payload.model_dump(exclude_unset=True))
            current["actualizado"] = datetime.utcnow()
            self._data[horario_id] = current
            return HorarioOut(**current)

    def delete(self, horario_id: int) -> None:
        with self._lock:
            if horario_id not in self._data:
                raise KeyError("horario no encontrado")
            del self._data[horario_id]

    def clear(self) -> None:
        with self._lock:
            self._data.clear()


horario_repo = HorarioRepository()
