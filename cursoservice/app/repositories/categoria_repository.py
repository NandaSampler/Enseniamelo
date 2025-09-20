# cursoservice/app/repositories/categoria_repository.py
from __future__ import annotations
from datetime import datetime
from itertools import count
from threading import RLock
from typing import Dict, List

from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaOut


class CategoriaRepository:
    """Repositorio in-memory para Categoria."""
    def __init__(self) -> None:
        self._data: Dict[int, dict] = {}
        self._id = count(start=1)
        self._lock = RLock()

    def list(self) -> List[CategoriaOut]:
        with self._lock:
            return [CategoriaOut(**r) for r in self._data.values()]

    def get(self, categoria_id: int) -> CategoriaOut:
        with self._lock:
            r = self._data.get(categoria_id)
        if not r:
            raise KeyError("categoria no encontrada")
        return CategoriaOut(**r)

    def create(self, payload: CategoriaCreate) -> CategoriaOut:
        now = datetime.utcnow()
        new_id = next(self._id)
        record = payload.model_dump()
        record.update({"id": new_id, "creado": now, "actualizado": now})
        with self._lock:
            self._data[new_id] = record
        return CategoriaOut(**record)

    def update(self, categoria_id: int, payload: CategoriaUpdate) -> CategoriaOut:
        with self._lock:
            if categoria_id not in self._data:
                raise KeyError("categoria no encontrada")
            current = self._data[categoria_id].copy()
            current.update(payload.model_dump(exclude_unset=True))
            current["actualizado"] = datetime.utcnow()
            self._data[categoria_id] = current
            return CategoriaOut(**current)

    def delete(self, categoria_id: int) -> None:
        with self._lock:
            if categoria_id not in self._data:
                raise KeyError("categoria no encontrada")
            del self._data[categoria_id]

    def clear(self) -> None:
        with self._lock:
            self._data.clear()


categoria_repo = CategoriaRepository()
