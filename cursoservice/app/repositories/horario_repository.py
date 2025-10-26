from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioOut
from app.core.db import get_collection


class HorarioRepository:
    """Repositorio Mongo para Horario."""
    def __init__(self) -> None:
        # NO crear índices aquí
        self.col = get_collection("horarios")

    def ensure_indexes(self) -> None:
        try:
            self.col.create_index("curso_id")
        except PyMongoError:
            pass
        try:
            self.col.create_index([("inicio", 1), ("fin", 1)])
        except PyMongoError:
            pass

    def list(self, curso_id: Optional[str] = None) -> List[HorarioOut]:
        filtro: Dict[str, Any] = {}
        if curso_id is not None:
            filtro["curso_id"] = ObjectId(curso_id)
        docs = list(self.col.find(filtro))
        return [HorarioOut(**self._normalize(d)) for d in docs]

    def get(self, horario_id: str) -> HorarioOut:
        doc = self.col.find_one({"_id": ObjectId(horario_id)})
        if not doc:
            raise KeyError("horario no encontrado")
        return HorarioOut(**self._normalize(doc))

    def create(self, payload: HorarioCreate) -> HorarioOut:
        now = datetime.utcnow()
        data = payload.model_dump()
        if "curso_id" in data and data["curso_id"] is not None:
            data["curso_id"] = ObjectId(data["curso_id"])
        data.update({"creado": now, "actualizado": now})
        res = self.col.insert_one(data)
        data["_id"] = res.inserted_id
        return HorarioOut(**self._normalize(data))

    def update(self, horario_id: str, payload: HorarioUpdate) -> HorarioOut:
        update_data = payload.model_dump(exclude_unset=True)
        if "curso_id" in update_data and update_data["curso_id"] is not None:
            update_data["curso_id"] = ObjectId(update_data["curso_id"])
        update_data["actualizado"] = datetime.utcnow()
        doc = self.col.find_one_and_update(
            {"_id": ObjectId(horario_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        if not doc:
            raise KeyError("horario no encontrado")
        return HorarioOut(**self._normalize(doc))

    def delete(self, horario_id: str) -> None:
        res = self.col.delete_one({"_id": ObjectId(horario_id)})
        if res.deleted_count == 0:
            raise KeyError("horario no encontrado")

    def clear(self) -> None:
        self.col.delete_many({})

    # helpers
    def _normalize(self, doc: dict) -> dict:
        d = dict(doc)
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        if "curso_id" in d and isinstance(d["curso_id"], ObjectId):
            d["curso_id"] = str(d["curso_id"])
        return d


# --- Singleton perezoso ---
_repo: Optional[HorarioRepository] = None

def get_horario_repo() -> HorarioRepository:
    global _repo
    if _repo is None:
        _repo = HorarioRepository()
    return _repo
