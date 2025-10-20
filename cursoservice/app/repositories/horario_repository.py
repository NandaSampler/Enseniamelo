# cursoservice/app/repositories/horario_repository.py
from __future__ import annotations
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from pymongo import ReturnDocument

from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioOut
from app.core.db import get_collection


class HorarioRepository:
    """Repositorio Mongo para Horario."""
    def __init__(self) -> None:
        self.col = get_collection("horarios")
        # Búsquedas frecuentes por curso
        self.col.create_index("curso_id")

    def list(self, curso_id: Optional[str] = None) -> List[HorarioOut]:
        filtro = {}
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
        # normalizar referencias si existen
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
        doc = dict(doc)
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        # devolver refs como str
        if "curso_id" in doc and isinstance(doc["curso_id"], ObjectId):
            doc["curso_id"] = str(doc["curso_id"])
        return doc

horario_repo = HorarioRepository()