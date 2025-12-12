from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut
from app.core.db import get_collection
from decimal import Decimal


class ReservaRepository:
    """Repositorio Mongo para Reserva."""
    def __init__(self) -> None:
        self.col = get_collection("reservas")

    def ensure_indexes(self) -> None:
        try:
            self.col.create_index("id_curso")
        except PyMongoError:
            pass
        try:
            self.col.create_index("id_horario")
        except PyMongoError:
            pass
        try:
            self.col.create_index("id_usuario")
        except PyMongoError:
            pass

    def list(
        self,
        id_usuario: Optional[str] = None,
        id_curso: Optional[str] = None,
        id_horario: Optional[str] = None,
    ) -> List[ReservaOut]:
        filtro: Dict[str, Any] = {}
        if id_usuario is not None:
            filtro["id_usuario"] = ObjectId(id_usuario)
        if id_curso is not None:
            filtro["id_curso"] = ObjectId(id_curso)
        if id_horario is not None:
            filtro["id_horario"] = ObjectId(id_horario)

        docs = list(self.col.find(filtro))
        return [ReservaOut(**self._normalize(d)) for d in docs]

    def get(self, reserva_id: str) -> ReservaOut:
        doc = self.col.find_one({"_id": ObjectId(reserva_id)})
        if not doc:
            raise KeyError("reserva no encontrada")
        return ReservaOut(**self._normalize(doc))

    def _clean_decimal_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        out = dict(data)
        if isinstance(out.get("monto"), Decimal):
            out["monto"] = float(out["monto"])
        return out

    def create(self, payload: ReservaCreate) -> ReservaOut:
        now = datetime.utcnow()
        data = payload.model_dump()
        data = self._clean_decimal_fields(data)  # 👈 limpiar Decimals

        if "id_curso" in data and data["id_curso"] is not None:
            data["id_curso"] = ObjectId(data["id_curso"])
        if "id_horario" in data and data["id_horario"] is not None:
            data["id_horario"] = ObjectId(data["id_horario"])
        if "id_usuario" in data and data["id_usuario"] is not None:
            data["id_usuario"] = ObjectId(data["id_usuario"])

        data.update({"fechaCreacion": now, "actualizado": now})
        res = self.col.insert_one(data)
        data["_id"] = res.inserted_id
        return ReservaOut(**self._normalize(data))

    def update(self, reserva_id: str, payload: ReservaUpdate) -> ReservaOut:
        update_data = payload.model_dump(exclude_unset=True)
        update_data = self._clean_decimal_fields(update_data)  # 👈 limpiar Decimals

        # si algún día permites actualizar FKs, convertir aquí a ObjectId
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

        for field in ("id_usuario", "id_curso", "id_horario"):
            if field in d and isinstance(d[field], ObjectId):
                d[field] = str(d[field])

        return d


# --- Singleton perezoso ---
_repo: Optional[ReservaRepository] = None

def get_reserva_repo() -> ReservaRepository:
    global _repo
    if _repo is None:
        _repo = ReservaRepository()
    return _repo
