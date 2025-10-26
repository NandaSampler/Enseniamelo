from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaOut
from app.core.db import get_collection


class CategoriaRepository:
    def __init__(self) -> None:
        # NO crear índices aquí
        self.col = get_collection("categorias")

    def ensure_indexes(self) -> None:
        try:
            # Útil si quieres evitar duplicados por nombre (opcional)
            # self.col.create_index("nombre", unique=True)
            pass
        except PyMongoError:
            pass

    def list(self, q: Optional[str] = None) -> List[CategoriaOut]:
        filtro: Dict[str, Any] = {}
        if q:
            filtro = {
                "$or": [
                    {"nombre": {"$regex": q, "$options": "i"}},
                    {"descripcion": {"$regex": q, "$options": "i"}},
                ]
            }
        docs = list(self.col.find(filtro))
        return [CategoriaOut(**self._normalize(d)) for d in docs]

    def get(self, categoria_id: str) -> CategoriaOut:
        doc = self.col.find_one({"_id": ObjectId(categoria_id)})
        if not doc:
            raise KeyError("categoria no encontrada")
        return CategoriaOut(**self._normalize(doc))

    def create(self, payload: CategoriaCreate) -> CategoriaOut:
        now = datetime.utcnow()
        data = payload.model_dump()
        data.update({"creado": now, "actualizado": now})
        res = self.col.insert_one(data)
        data["_id"] = res.inserted_id
        return CategoriaOut(**self._normalize(data))

    def update(self, categoria_id: str, payload: CategoriaUpdate) -> CategoriaOut:
        update_data = payload.model_dump(exclude_unset=True)
        update_data["actualizado"] = datetime.utcnow()
        doc = self.col.find_one_and_update(
            {"_id": ObjectId(categoria_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        if not doc:
            raise KeyError("categoria no encontrada")
        return CategoriaOut(**self._normalize(doc))

    def delete(self, categoria_id: str) -> None:
        res = self.col.delete_one({"_id": ObjectId(categoria_id)})
        if res.deleted_count == 0:
            raise KeyError("categoria no encontrada")

    # helpers
    def _normalize(self, doc: dict) -> dict:
        d = dict(doc)
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        return d


# --- Singleton perezoso ---
_repo: Optional[CategoriaRepository] = None

def get_categoria_repo() -> CategoriaRepository:
    global _repo
    if _repo is None:
        _repo = CategoriaRepository()
    return _repo
