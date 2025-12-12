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
            self.col.create_index("id_curso")
        except PyMongoError:
            pass
        try:
            self.col.create_index([("inicio", 1), ("fin", 1)])
        except PyMongoError:
            pass

    def list(self, id_curso: Optional[str] = None) -> List[HorarioOut]:
        filtro: Dict[str, Any] = {}
        if id_curso is not None:
            filtro["id_curso"] = ObjectId(id_curso)
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
        if "id_curso" in data and data["id_curso"] is not None:
            data["id_curso"] = ObjectId(data["id_curso"])
        data.update({"fechaCreacion": now})
        res = self.col.insert_one(data)
        data["_id"] = res.inserted_id
        return HorarioOut(**self._normalize(data))

    def update(self, horario_id: str, payload: HorarioUpdate) -> HorarioOut:
        update_data = payload.model_dump(exclude_unset=True)
        if "id_curso" in update_data and update_data["id_curso"] is not None:
            update_data["id_curso"] = ObjectId(update_data["id_curso"])
        # si quisieras, aquí podrías añadir un campo "actualizado"
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
        if "id_curso" in d and isinstance(d["id_curso"], ObjectId):
            d["id_curso"] = str(d["id_curso"])
        return d


# --- Singleton perezoso ---
_repo: Optional[HorarioRepository] = None

def get_horario_repo() -> HorarioRepository:
    global _repo
    if _repo is None:
        _repo = HorarioRepository()
    return _repo
