# cursoservice/app/repositories/curso_categoria_repository.py
from __future__ import annotations
from datetime import datetime
from itertools import count
from threading import RLock
from typing import Dict, List, Tuple

from app.schemas.curso_categoria import CursoCategoriaLink, CursoCategoriaOut


class CursoCategoriaRepository:
    """
    Repositorio in-memory del vínculo curso-categoría.
    No resuelve objetos completos; solo mantiene los pares y su id.
    """
    def __init__(self) -> None:
        self._data: Dict[int, dict] = {}            # id -> record
        self._index: Dict[Tuple[int, int], int] = {}  # (curso_id,categoria_id) -> id
        self._id = count(start=1)
        self._lock = RLock()

    def list(self) -> List[CursoCategoriaOut]:
        with self._lock:
            return [CursoCategoriaOut(**r) for r in self._data.values()]

    def add(self, link: CursoCategoriaLink) -> CursoCategoriaOut:
        key = (link.curso_id, link.categoria_id)
        with self._lock:
            if key in self._index:
                # ya existe, retornamos el existente
                rid = self._index[key]
                return CursoCategoriaOut(**self._data[rid])

            rid = next(self._id)
            record = link.model_dump()
            record.update({"id": rid, "creado": datetime.utcnow()})
            self._data[rid] = record
            self._index[key] = rid
            return CursoCategoriaOut(**record)

    def remove(self, curso_id: int, categoria_id: int) -> None:
        key = (curso_id, categoria_id)
        with self._lock:
            rid = self._index.get(key)
            if rid is None:
                # si no existe, consideramos idempotente
                return
            del self._index[key]
            del self._data[rid]

    # Query helpers (ids; el join lo hará el Service)
    def list_category_ids_of_course(self, curso_id: int) -> List[int]:
        with self._lock:
            return [cat for (cur, cat), _id in self._index.items() if cur == curso_id]

    def list_course_ids_of_category(self, categoria_id: int) -> List[int]:
        with self._lock:
            return [cur for (cur, cat), _id in self._index.items() if cat == categoria_id]

    def clear(self) -> None:
        with self._lock:
            self._data.clear()
            self._index.clear()


curso_categoria_repo = CursoCategoriaRepository()
