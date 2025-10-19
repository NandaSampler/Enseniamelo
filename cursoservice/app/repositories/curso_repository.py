# cursoservice/app/repositories/curso_repository.py
from __future__ import annotations
from datetime import datetime
from itertools import count
from threading import RLock
from typing import Dict, List, Optional

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut


class CursoRepository:
    """Repositorio in-memory para Curso."""

    def __init__(self) -> None:
        self._data: Dict[int, dict] = {}
        self._id = count(start=1)
        self._lock = RLock()

    # CRUD
    def list(self, q: Optional[str] = None) -> List[CursoOut]:
        with self._lock:
            items = list(self._data.values())
        if q:
            ql = q.lower()
            items = [
                r for r in items
                if ql in r["nombre"].lower() or (r.get("descripcion") and ql in r["descripcion"].lower())
            ]
        return [CursoOut(**r) for r in items]

    def get(self, curso_id: int) -> CursoOut:
        with self._lock:
            r = self._data.get(curso_id)
        if not r:
            raise KeyError("curso no encontrado")
        return CursoOut(**r)

    def create(self, payload: CursoCreate) -> CursoOut:
        now = datetime.utcnow()
        new_id = next(self._id)
        record = payload.model_dump()
        record.update({"id": new_id, "creado": now, "actualizado": now})
        with self._lock:
            self._data[new_id] = record
        return CursoOut(**record)

    def update(self, curso_id: int, payload: CursoUpdate) -> CursoOut:
        with self._lock:
            if curso_id not in self._data:
                raise KeyError("curso no encontrado")
            current = self._data[curso_id].copy()
            current.update(payload.model_dump(exclude_unset=True))
            # Regla mínima de integridad local (el resto va en Service)
            if current.get("cupo_maximo") is not None and current.get("cupo_ocupado", 0) > current["cupo_maximo"]:
                raise ValueError("cupo_ocupado no puede ser mayor que cupo_maximo")
            current["actualizado"] = datetime.utcnow()
            self._data[curso_id] = current
            return CursoOut(**current)

    def delete(self, curso_id: int) -> None:
        with self._lock:
            if curso_id not in self._data:
                raise KeyError("curso no encontrado")
            del self._data[curso_id]

    # Utilidades para cupos (usadas por Service de reservas)
    def increment_cupo(self, curso_id: int, amount: int = 1) -> CursoOut:
        with self._lock:
            if curso_id not in self._data:
                raise KeyError("curso no encontrado")
            rec = self._data[curso_id]
            rec["cupo_ocupado"] = rec.get("cupo_ocupado", 0) + amount
            if rec["cupo_ocupado"] > rec["cupo_maximo"]:
                raise ValueError("No hay cupos disponibles")
            rec["actualizado"] = datetime.utcnow()
            self._data[curso_id] = rec
            return CursoOut(**rec)

    def decrement_cupo(self, curso_id: int, amount: int = 1) -> CursoOut:
        with self._lock:
            if curso_id not in self._data:
                raise KeyError("curso no encontrado")
            rec = self._data[curso_id]
            rec["cupo_ocupado"] = max(0, rec.get("cupo_ocupado", 0) - amount)
            rec["actualizado"] = datetime.utcnow()
            self._data[curso_id] = rec
            return CursoOut(**rec)

    # Para tests
    def clear(self) -> None:
        with self._lock:
            self._data.clear()


# Singleton del repositorio
curso_repo = CursoRepository()
