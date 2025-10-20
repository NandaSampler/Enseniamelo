# cursoservice/app/repositories/reserva_repository.py
from __future__ import annotations
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from pymongo import ReturnDocument

from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut
from app.core.db import get_collection


class ReservaRepository:
    """Repositorio Mongo para Reserva."""
    def __init__(self) -> None:
        self.col = get_collection("reservas")
        # Índices útiles para listados
        self.col.create_index("curso_id")
        self.col.create_index("horario_id")

    def list(
        self,
        curso_id: Optional[str] = None,
        horario_id: Optional[str] = None,
    ) -> List[ReservaOut]:
        filtro = {}
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
        # normalizar referencias si existen
        if "curso_id" in data and data["curso_id"] is not None:
            data["curso_id"] = ObjectId(data["curso_id"])
        if "horario_id" in data and data["horario_id"] is not None:
            data["horario_id"] = ObjectId(data["horario_id"])
        # en tu in-memory usabas "fecha" como timestamp de creación
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
        doc = dict(doc)
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        if "curso_id" in doc and isinstance(doc["curso_id"], ObjectId):
            doc["curso_id"] = str(doc["curso_id"])
        if "horario_id" in doc and isinstance(doc["horario_id"], ObjectId):
            doc["horario_id"] = str(doc["horario_id"])
        return doc

reserva_repo = ReservaRepository()