# cursoservice/app/repositories/curso_categoria_repository.py
from __future__ import annotations
from datetime import datetime
from typing import List

from bson import ObjectId
from app.core.db import get_collection

from app.schemas.curso_categoria import CursoCategoriaLink, CursoCategoriaOut


class CursoCategoriaRepository:
    """
    Repositorio Mongo para el vínculo curso-categoría.
    Guarda pares (curso_id, categoria_id) y expone queries de ids.
    """
    def __init__(self) -> None:
        self.col = get_collection("curso_categorias")
        # Índice único para evitar duplicados del mismo par
        self.col.create_index(
            [("curso_id", 1), ("categoria_id", 1)],
            unique=True,
            name="uix_curso_categoria",
        )

    def list(self) -> List[CursoCategoriaOut]:
        docs = list(self.col.find({}))
        return [CursoCategoriaOut(**self._normalize(d)) for d in docs]

    def add(self, link: CursoCategoriaLink) -> CursoCategoriaOut:
        filtro = {
            "curso_id": ObjectId(link.curso_id),
            "categoria_id": ObjectId(link.categoria_id),
        }
        # Si ya existe, devolverlo; si no, insertarlo
        existing = self.col.find_one(filtro)
        if existing:
            return CursoCategoriaOut(**self._normalize(existing))

        data = {
            **filtro,
            "creado": datetime.utcnow(),
        }
        res = self.col.insert_one(data)
        data["_id"] = res.inserted_id
        return CursoCategoriaOut(**self._normalize(data))

    def remove(self, curso_id: str, categoria_id: str) -> None:
        self.col.delete_one(
            {"curso_id": ObjectId(curso_id), "categoria_id": ObjectId(categoria_id)}
        )
        # idempotente: no lanza error si no existe

    # Query helpers (ids; el "join" lo hará el Service)
    def list_category_ids_of_course(self, curso_id: str) -> List[str]:
        cur = self.col.find({"curso_id": ObjectId(curso_id)}, {"categoria_id": 1})
        return [str(doc["categoria_id"]) for doc in cur]

    def list_course_ids_of_category(self, categoria_id: str) -> List[str]:
        cur = self.col.find({"categoria_id": ObjectId(categoria_id)}, {"curso_id": 1})
        return [str(doc["curso_id"]) for doc in cur]

    def clear(self) -> None:
        self.col.delete_many({})

    # helpers
    def _normalize(self, doc: dict) -> dict:
        doc = dict(doc)
        doc["id"] = str(doc["_id"])
        doc["curso_id"] = str(doc["curso_id"])
        doc["categoria_id"] = str(doc["categoria_id"])
        doc.pop("_id", None)
        return doc

curso_categoria_repo = CursoCategoriaRepository()