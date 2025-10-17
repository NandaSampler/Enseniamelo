# domain/services.py
from __future__ import annotations
from datetime import datetime, timedelta
from typing import Any, Iterable

from bson import ObjectId
from fastapi import HTTPException

from infra.mongo import db
from payments_errors.errors import NotFoundError, ConflictError

# Idempotencia simple en memoria (puedes moverlo a Redis luego)
IDEMP_CACHE: dict[str, dict] = {}

# ---------- helpers ----------

def _to_str_id(doc: dict | None) -> dict | None:
    """Convierte _id -> id (str) para respuesta API."""
    if not doc:
        return None
    d = dict(doc)
    _id = d.pop("_id", None)
    if isinstance(_id, ObjectId):
        d["id"] = str(_id)
    elif _id is not None:
        d["id"] = str(_id)
    return d

def _many_to_str_id(cursor_docs: Iterable[dict]) -> list[dict]:
    return [_to_str_id(d) for d in cursor_docs]

def _oid(s: str) -> ObjectId:
    """Convierte un string a ObjectId o lanza NotFound/400 si es inválido."""
    try:
        return ObjectId(s)
    except Exception:
        # id mal formado -> lo tratamos como no encontrado / inválido
        raise NotFoundError("ID inválido o no encontrado", extra={"id": s})

# ---------- servicio ----------

class PaymentsService:
    # ------------- PLANES -------------
    async def list_plans(self) -> list[dict]:
        cur = db().plan.find({})
        return [_to_str_id(d) async for d in cur]

    async def create_plan(self, data: dict) -> dict:
        # Espera: nombre, precio, duracion, estado
        doc = {
            "nombre": data["nombre"],
            "precio": data["precio"],
            "duracion": data["duracion"],
            "estado": data["estado"],
        }
        res = await db().plan.insert_one(doc)
        created = await db().plan.find_one({"_id": res.inserted_id})
        return _to_str_id(created)

    async def get_plan(self, pid: str) -> dict:
        plan = await db().plan.find_one({"_id": _oid(pid)})
        if not plan:
            raise NotFoundError("Plan no encontrado", extra={"id": pid})
        return _to_str_id(plan)

    async def update_plan(self, pid: str, data: dict) -> dict:
        patch = {}
        for k in ("nombre", "precio", "duracion", "estado"):
            if k in data and data[k] is not None:
                patch[k] = data[k]
        res = await db().plan.update_one({"_id": _oid(pid)}, {"$set": patch})
        if res.matched_count == 0:
            raise NotFoundError("Plan no encontrado", extra={"id": pid})
        updated = await db().plan.find_one({"_id": _oid(pid)})
        return _to_str_id(updated)

    async def delete_plan(self, pid: str) -> bool:
        # proteger referencial: no borrar si hay suscripciones que lo usan
        in_use = await db().suscripcion.count_documents({"plan_id": _oid(pid)})
        if in_use > 0:
            raise ConflictError("Plan en uso por suscripciones", extra={"id": pid})
        res = await db().plan.delete_one({"_id": _oid(pid)})
        if res.deleted_count == 0:
            raise NotFoundError("Plan no encontrado", extra={"id": pid})
        return True

    # ------------- SUSCRIPCIONES -------------
    async def create_sub(self, user_id: str, plan_id: str, inicio_iso: str) -> dict:
        # validar plan
        plan = await db().plan.find_one({"_id": _oid(plan_id)})
        if not plan:
            raise NotFoundError("Plan no encontrado", extra={"id": plan_id})

        inicio = datetime.fromisoformat(inicio_iso)
        fin = inicio + timedelta(days=int(plan["duracion"]))

        doc = {
            "user_id": user_id,
            "plan_id": _oid(plan_id),
            "inicio_iso": inicio.isoformat(),
            "fin_iso": fin.isoformat(),
            "estado": "pendiente",
        }
        res = await db().suscripcion.insert_one(doc)
        created = await db().suscripcion.find_one({"_id": res.inserted_id})
        # para consistencia externa, exponer plan_id como string
        out = _to_str_id(created)
        out["plan_id"] = str(created["plan_id"])
        return out

    async def get_sub(self, sid: str) -> dict:
        sub = await db().suscripcion.find_one({"_id": _oid(sid)})
        if not sub:
            raise NotFoundError("Suscripción no encontrada", extra={"id": sid})
        out = _to_str_id(sub)
        out["plan_id"] = str(sub["plan_id"])
        return out

    async def list_subs(
        self,
        user_id: str | None = None,
        plan_id: str | None = None,
        estado: str | None = None,
    ) -> list[dict]:
        q: dict[str, Any] = {}
        if user_id:
            q["user_id"] = user_id
        if plan_id:
            q["plan_id"] = _oid(plan_id)
        if estado:
            q["estado"] = estado
        cur = db().suscripcion.find(q)
        result = []
        async for d in cur:
            item = _to_str_id(d)
            item["plan_id"] = str(d["plan_id"])
            result.append(item)
        return result

    async def update_sub(self, sid: str, data: dict) -> dict:
        sub = await db().suscripcion.find_one({"_id": _oid(sid)})
        if not sub:
            raise NotFoundError("Suscripción no encontrada", extra={"id": sid})

        patch: dict[str, Any] = {}

        # cambio de plan (validar que exista)
        if "plan_id" in data and data["plan_id"]:
            new_pid = data["plan_id"]
            plan = await db().plan.find_one({"_id": _oid(new_pid)})
            if not plan:
                raise NotFoundError("Plan no encontrado", extra={"id": new_pid})
            patch["plan_id"] = _oid(new_pid)

        # cambio de inicio
        if "inicio_iso" in data and data["inicio_iso"]:
            inicio = datetime.fromisoformat(data["inicio_iso"])
            patch["inicio_iso"] = inicio.isoformat()

        # recalcular fin si cambió inicio o plan
        if "inicio_iso" in patch or "plan_id" in patch:
            plan_for_calc = await db().plan.find_one(
                {"_id": patch.get("plan_id", sub["plan_id"])}
            )
            inicio_for_calc = datetime.fromisoformat(
                patch.get("inicio_iso", sub["inicio_iso"])
            )
            fin = inicio_for_calc + timedelta(days=int(plan_for_calc["duracion"]))
            patch["fin_iso"] = fin.isoformat()

        # cambio de estado (solo permitir 'cancelada' aquí como en tu mock)
        if "estado" in data and data["estado"]:
            if data["estado"] != "cancelada":
                raise ConflictError("Solo se permite cambiar estado a 'cancelada'")
            patch["estado"] = "cancelada"

        await db().suscripcion.update_one({"_id": _oid(sid)}, {"$set": patch})
        # ojo: typo intencional? corregimos a "_id":
        await db().suscripcion.update_one({"_id": _oid(sid)}, {"$set": patch})

        updated = await db().suscripcion.find_one({"_id": _oid(sid)})
        out = _to_str_id(updated)
        out["plan_id"] = str(updated["plan_id"])
        return out

    async def delete_sub(self, sid: str) -> bool:
        # no permitir borrar si tiene pagos
        has_payments = await db().pago.count_documents({"suscripcion_id": _oid(sid)})
        if has_payments > 0:
            raise ConflictError("No se puede borrar: la suscripción tiene pagos", extra={"id": sid})
        res = await db().suscripcion.delete_one({"_id": _oid(sid)})
        if res.deleted_count == 0:
            raise NotFoundError("Suscripción no encontrada", extra={"id": sid})
        return True

    # ------------- IDEMPOTENCIA (privado) -------------
    def _idem_get(self, key: str | None):
        return IDEMP_CACHE.get(key) if key else None

    def _idem_set(self, key: str | None, value: dict):
        if key:
            IDEMP_CACHE[key] = value

    # ------------- PAGOS -------------
    async def create_pago(self, suscripcion_id: str, monto: float, metodo: str, idem_key: str | None = None) -> dict:
        cached = self._idem_get(idem_key)
        if cached:
            return cached

        sub = await db().suscripcion.find_one({"_id": _oid(suscripcion_id)})
        if not sub:
            raise NotFoundError("Suscripción no encontrada", extra={"id": suscripcion_id})

        doc = {
            "suscripcion_id": _oid(suscripcion_id),
            "monto": float(monto),
            "metodo": metodo,
            "estado": "creado",
            "provider_ref": None,
        }
        res = await db().pago.insert_one(doc)
        created = await db().pago.find_one({"_id": res.inserted_id})

        out = _to_str_id(created)
        out["suscripcion_id"] = str(created["suscripcion_id"])

        self._idem_set(idem_key, out)
        return out

    async def get_pago(self, pid: str) -> dict:
        pago = await db().pago.find_one({"_id": _oid(pid)})
        if not pago:
            raise NotFoundError("Pago no encontrado", extra={"id": pid})
        out = _to_str_id(pago)
        out["suscripcion_id"] = str(pago["suscripcion_id"])
        return out

    async def list_pagos(
        self,
        suscripcion_id: str | None = None,
        estado: str | None = None,
        metodo: str | None = None,
    ) -> list[dict]:
        q: dict[str, Any] = {}
        if suscripcion_id:
            q["suscripcion_id"] = _oid(suscripcion_id)
        if estado:
            q["estado"] = estado
        if metodo:
            q["metodo"] = metodo

        cur = db().pago.find(q)
        result = []
        async for d in cur:
            item = _to_str_id(d)
            item["suscripcion_id"] = str(d["suscripcion_id"])
            result.append(item)
        return result

    async def update_pago(self, pid: str, data: dict) -> dict:
        pago = await db().pago.find_one({"_id": _oid(pid)})
        if not pago:
            raise NotFoundError("Pago no encontrado", extra={"id": pid})

        patch: dict[str, Any] = {}
        if "provider_ref" in data and data["provider_ref"] is not None:
            patch["provider_ref"] = data["provider_ref"]
        if "estado" in data and data["estado"]:
            new_state = data["estado"]
            patch["estado"] = new_state

        if patch:
            await db().pago.update_one({"_id": _oid(pid)}, {"$set": patch})
            pago = await db().pago.find_one({"_id": _oid(pid)})

        # si exitoso => activar suscripción
        if pago["estado"] == "exitoso":
            sid = pago["suscripcion_id"]
            await db().suscripcion.update_one({"_id": sid}, {"$set": {"estado": "activa"}})

        out = _to_str_id(pago)
        out["suscripcion_id"] = str(pago["suscripcion_id"])
        return out

    async def delete_pago(self, pid: str) -> bool:
        pago = await db().pago.find_one({"_id": _oid(pid)})
        if not pago:
            raise NotFoundError("Pago no encontrado", extra={"id": pid})
        if pago["estado"] == "exitoso":
            raise ConflictError("No se puede eliminar un pago exitoso", extra={"id": pid})
        res = await db().pago.delete_one({"_id": _oid(pid)})
        return res.deleted_count == 1
