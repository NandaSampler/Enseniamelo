from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut
from app.core.db import get_collection


class ReservaRepository:
    """Repositorio Mongo para Reserva."""
    def __init__(self) -> None:
        # NO crear índices aquí
        self.col = get_collection("reservas")

    def ensure_indexes(self) -> None:
        try:
            self.col.create_index("curso_id")
        except PyMongoError:
            pass
        try:
            self.col.create_index("horario_id")
        except PyMongoError:
            pass

    def list(self,
             curso_id: Optional[str] = None,
             horario_id: Optional[str] = None) -> List[ReservaOut]:
        filtro: Dict[str, Any] = {}
        if curso_id is not None:
            filtro["curso_id"] = ObjectId(curso_id)
        if horario_id is not None:
            filtro["horario_id"] = ObjectId(horario_id)
        docs = list(self.col.find(filtro))
        return [ReservaOut(**self._normalize(d)) for d in docs]

    def get(self, reserva_id: str) -> ReservaOut:
        doc = self.col.find_one({"_id": ObjectId(reserva_id)})
        if not doc:
            raise KeyError("reserva no encontrada")
        return ReservaOut(**self._normalize(doc))

    def create(self, payload: ReservaCreate) -> ReservaOut:
        now = datetime.utcnow()
        data = payload.model_dump()
        if "curso_id" in data and data["curso_id"] is not None:
            data["curso_id"] = ObjectId(data["curso_id"])
        if "horario_id" in data and data["horario_id"] is not None:
            data["horario_id"] = ObjectId(data["horario_id"])
        data.update({"fecha": now, "actualizado": now})
        res = self.col.insert_one(data)
        data["_id"] = res.inserted_id
        return ReservaOut(**self._normalize(data))

    def update(self, reserva_id: str, payload: ReservaUpdate) -> ReservaOut:
        update_data = payload.model_dump(exclude_unset=True)
        if "curso_id" in update_data and update_data["curso_id"] is not None:
            update_data["curso_id"] = ObjectId(update_data["curso_id"])
        if "horario_id" in update_data and update_data["horario_id"] is not None:
            update_data["horario_id"] = ObjectId(update_data["horario_id"])
        update_data["actualizado"] = datetime.utcnow()
        doc = self.col.find_one_and_update(
            {"_id": ObjectId(reserva_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        if not doc:
            raise KeyError("reserva no encontrada")
        return ReservaOut(**self._normalize(doc))

    def delete(self, reserva_id: str) -> None:
        res = self.col.delete_one({"_id": ObjectId(reserva_id)})
        if res.deleted_count == 0:
            raise KeyError("reserva no encontrada")

    def clear(self) -> None:
        self.col.delete_many({})

    # helpers
    def _normalize(self, doc: dict) -> dict:
        d = dict(doc)
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        if "curso_id" in d and isinstance(d["curso_id"], ObjectId):
            d["curso_id"] = str(d["curso_id"])
        if "horario_id" in d and isinstance(d["horario_id"], ObjectId):
            d["horario_id"] = str(d["horario_id"])
        return d


# --- Singleton perezoso ---
_repo: Optional[ReservaRepository] = None

def get_reserva_repo() -> ReservaRepository:
    global _repo
    if _repo is None:
        _repo = ReservaRepository()
    return _repo
