# cursoservice/app/repositories/curso_repository.py
from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut
from app.core.db import get_collection


class CursoRepository:
    """
    Repositorio Mongo para Curso.
    Ver notas de compatibilidad en cupos en el docstring original.
    """
    def __init__(self) -> None:
        # NO crear índices aquí (esto fuerza conexión al importar).
        self.col = get_collection("cursos")

    # Crear índices cuando la app ya está arriba.
    def ensure_indexes(self) -> None:
        try:
            self.col.create_index("tutor_id")
        except PyMongoError:
            # si no se puede, que no tumbe la app; se puede reintentar luego
            pass
        try:
            self.col.create_index([("nombre", "text"), ("descripcion", "text")])
        except PyMongoError:
            pass

    # ---------- Helpers internos ----------
    def _max_cupo_from_doc(self, doc: Dict[str, Any]) -> Optional[int]:
        if doc.get("tiene_cupo") is True and isinstance(doc.get("cupo"), int):
            return doc["cupo"]
        if isinstance(doc.get("cupo_maximo"), int):
            return doc["cupo_maximo"]
        return None

    def _normalize(self, doc: dict) -> dict:
        d = dict(doc)
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        if "tutor_id" in d and isinstance(d["tutor_id"], ObjectId):
            d["tutor_id"] = str(d["tutor_id"])
        return d

    def _ensure_ref_types(self, data: Dict[str, Any]) -> Dict[str, Any]:
        out = dict(data)
        if "tutor_id" in out and out["tutor_id"] is not None and not isinstance(out["tutor_id"], ObjectId):
            out["tutor_id"] = ObjectId(out["tutor_id"])
        return out

    # ---------- CRUD ----------
    def list(self, q: Optional[str] = None, tutor_id: Optional[str] = None) -> List[CursoOut]:
        filtro: Dict[str, Any] = {}
        if tutor_id:
            filtro["tutor_id"] = ObjectId(tutor_id)
        if q:
            filtro["$or"] = [
                {"nombre": {"$regex": q, "$options": "i"}},
                {"descripcion": {"$regex": q, "$options": "i"}},
            ]
        docs = list(self.col.find(filtro))
        return [CursoOut(**self._normalize(d)) for d in docs]

    def get(self, curso_id: str) -> CursoOut:
        doc = self.col.find_one({"_id": ObjectId(curso_id)})
        if not doc:
            raise KeyError("curso no encontrado")
        return CursoOut(**self._normalize(doc))

    def create(self, payload: CursoCreate) -> CursoOut:
        now = datetime.utcnow()
        data = self._ensure_ref_types(payload.model_dump())
        if "cupo_ocupado" not in data:
            data["cupo_ocupado"] = 0
        max_cupo = self._max_cupo_from_doc(data)
        if max_cupo is not None and data.get("cupo_ocupado", 0) > max_cupo:
            raise ValueError("cupo_ocupado no puede ser mayor que el máximo permitido")
        data.update({"creado": now, "actualizado": now})
        res = self.col.insert_one(data)
        data["_id"] = res.inserted_id
        return CursoOut(**self._normalize(data))

    def update(self, curso_id: str, payload: CursoUpdate) -> CursoOut:
        update_data = self._ensure_ref_types(payload.model_dump(exclude_unset=True))
        update_data["actualizado"] = datetime.utcnow()
        current = self.col.find_one({"_id": ObjectId(curso_id)})
        if not current:
            raise KeyError("curso no encontrado")
        candidate = {**current, **update_data}
        max_cupo = self._max_cupo_from_doc(candidate)
        if max_cupo is not None and candidate.get("cupo_ocupado", 0) > max_cupo:
            raise ValueError("cupo_ocupado no puede ser mayor que el máximo permitido")
        doc = self.col.find_one_and_update(
            {"_id": ObjectId(curso_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        if not doc:
            raise KeyError("curso no encontrado")
        return CursoOut(**self._normalize(doc))

    def delete(self, curso_id: str) -> None:
        res = self.col.delete_one({"_id": ObjectId(curso_id)})
        if res.deleted_count == 0:
            raise KeyError("curso no encontrado")

    def increment_cupo(self, curso_id: str, amount: int = 1) -> CursoOut:
        cur = self.col.find_one({"_id": ObjectId(curso_id)})
        if not cur:
            raise KeyError("curso no encontrado")
        max_cupo = self._max_cupo_from_doc(cur)
        if max_cupo is None:
            max_cupo = float("inf")
        nuevo = (cur.get("cupo_ocupado", 0) or 0) + amount
        if nuevo > max_cupo:
            raise ValueError("No hay cupos disponibles")
        doc = self.col.find_one_and_update(
            {"_id": ObjectId(curso_id)},
            {"$inc": {"cupo_ocupado": amount}, "$set": {"actualizado": datetime.utcnow()}},
            return_document=ReturnDocument.AFTER,
        )
        return CursoOut(**self._normalize(doc))

    def decrement_cupo(self, curso_id: str, amount: int = 1) -> CursoOut:
        cur = self.col.find_one({"_id": ObjectId(curso_id)})
        if not cur:
            raise KeyError("curso no encontrado")
        nuevo = max(0, (cur.get("cupo_ocupado", 0) or 0) - amount)
        doc = self.col.find_one_and_update(
            {"_id": ObjectId(curso_id)},
            {"$set": {"cupo_ocupado": nuevo, "actualizado": datetime.utcnow()}},
            return_document=ReturnDocument.AFTER,
        )
        return CursoOut(**self._normalize(doc))

    def clear(self) -> None:
        self.col.delete_many({})


# --- Singleton perezoso (sin conectar en import) ---
_repo: Optional[CursoRepository] = None

def get_curso_repo() -> CursoRepository:
    global _repo
    if _repo is None:
        _repo = CursoRepository()
    return _repo
