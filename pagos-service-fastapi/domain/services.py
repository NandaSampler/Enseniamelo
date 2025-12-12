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
    """Convierte _id -> id (str) y ObjectId/datetime a string para respuesta API."""
    if not doc:
        return None
    d = dict(doc)
    _id = d.pop("_id", None)
    if isinstance(_id, ObjectId):
        d["id"] = str(_id)
    elif _id is not None:
        d["id"] = str(_id)

    # ObjectIds de referencias
    for key in ("id_usuario", "id_plan", "id_suscripcion"):
        if key in d and isinstance(d[key], ObjectId):
            d[key] = str(d[key])

    # Fechas a ISO
    for k, v in list(d.items()):
        if isinstance(v, datetime):
            d[k] = v.isoformat()

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
        # Espera: nombre, descripcion, precio, duracionDias, cantidadCursos, estado
        now = datetime.utcnow()
        doc = {
            "nombre": data["nombre"],
            "descripcion": data["descripcion"],
            "precio": data["precio"],
            "duracionDias": data["duracionDias"],
            "cantidadCursos": data["cantidadCursos"],
            "estado": data["estado"],
            "createdAt": now,
            "updatedAt": now,
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
        patch: dict[str, Any] = {}
        for k in ("nombre", "descripcion", "precio", "duracionDias", "cantidadCursos", "estado"):
            if k in data and data[k] is not None:
                patch[k] = data[k]

        if patch:
            patch["updatedAt"] = datetime.utcnow()

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
    async def create_sub(self, id_usuario: str, id_plan: str, inicio: str) -> dict:
        # validar plan
        plan = await db().plan.find_one({"_id": _oid(id_plan)})
        if not plan:
            raise NotFoundError("Plan no encontrado", extra={"id": id_plan})

        inicio_dt = datetime.fromisoformat(inicio)
        fin_dt = inicio_dt + timedelta(days=int(plan["duracionDias"]))
        now = datetime.utcnow()

        doc = {
            "id_usuario": _oid(id_usuario),
            "id_plan": _oid(id_plan),
            "inicio": inicio_dt,
            "fin": fin_dt,
            "estado": "pendiente",
            "createdAt": now,
            "updatedAt": now,
            "fechaCancelacion": None,
        }
        res = await db().suscripcion.insert_one(doc)
        created = await db().suscripcion.find_one({"_id": res.inserted_id})
        return _to_str_id(created)

    async def get_sub(self, sid: str) -> dict:
        sub = await db().suscripcion.find_one({"_id": _oid(sid)})
        if not sub:
            raise NotFoundError("Suscripción no encontrada", extra={"id": sid})
        return _to_str_id(sub)

    async def list_subs(
        self,
        id_usuario: str | None = None,
        id_plan: str | None = None,
        estado: str | None = None,
    ) -> list[dict]:
        q: dict[str, Any] = {}
        if id_usuario:
            q["id_usuario"] = _oid(id_usuario)
        if id_plan:
            q["id_plan"] = _oid(id_plan)
        if estado:
            q["estado"] = estado

        cur = db().suscripcion.find(q)
        return [_to_str_id(d) async for d in cur]

    async def update_sub(self, sid: str, data: dict) -> dict:
        sub = await db().suscripcion.find_one({"_id": _oid(sid)})
        if not sub:
            raise NotFoundError("Suscripción no encontrada", extra={"id": sid})

        patch: dict[str, Any] = {}

        # cambio de plan
        if "id_plan" in data and data["id_plan"]:
            new_pid = data["id_plan"]
            plan = await db().plan.find_one({"_id": _oid(new_pid)})
            if not plan:
                raise NotFoundError("Plan no encontrado", extra={"id": new_pid})
            patch["id_plan"] = _oid(new_pid)

        # cambio de inicio
        if "inicio" in data and data["inicio"]:
            inicio_dt = datetime.fromisoformat(data["inicio"])
            patch["inicio"] = inicio_dt

        # recalcular fin si cambió inicio o plan
        if "inicio" in patch or "id_plan" in patch:
            plan_for_calc = await db().plan.find_one(
                {"_id": patch.get("id_plan", sub["id_plan"])}
            )
            inicio_for_calc = patch.get("inicio", sub["inicio"])
            if isinstance(inicio_for_calc, str):
                inicio_for_calc = datetime.fromisoformat(inicio_for_calc)
            fin = inicio_for_calc + timedelta(days=int(plan_for_calc["duracionDias"]))
            patch["fin"] = fin

        # cambio de estado (solo permitimos cancelada desde aquí)
        if "estado" in data and data["estado"]:
            if data["estado"] != "cancelada":
                raise ConflictError("Solo se permite cambiar estado a 'cancelada'")
            patch["estado"] = "cancelada"
            patch["fechaCancelacion"] = datetime.utcnow()

        if patch:
            patch["updatedAt"] = datetime.utcnow()
            await db().suscripcion.update_one({"_id": _oid(sid)}, {"$set": patch})

        updated = await db().suscripcion.find_one({"_id": _oid(sid)})
        return _to_str_id(updated)

    async def delete_sub(self, sid: str) -> bool:
        # no permitir borrar si tiene pagos
        has_payments = await db().pago.count_documents({"id_suscripcion": _oid(sid)})
        if has_payments > 0:
            raise ConflictError(
                "No se puede borrar: la suscripción tiene pagos",
                extra={"id": sid},
            )
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
    async def create_pago(
        self,
        id_suscripcion: str,
        monto: float,
        metodo: str,
        idem_key: str | None = None,
    ) -> dict:
        cached = self._idem_get(idem_key)
        if cached:
            return cached

        sub = await db().suscripcion.find_one({"_id": _oid(id_suscripcion)})
        if not sub:
            raise NotFoundError("Suscripción no encontrada", extra={"id": id_suscripcion})

        now = datetime.utcnow()
        doc = {
            "id_suscripcion": _oid(id_suscripcion),
            "monto": float(monto),
            "metodo": metodo,
            "estado": "creado",
            "stripeSessionId": None,
            "createdAt": now,
            "updatedAt": now,
        }
        res = await db().pago.insert_one(doc)
        created = await db().pago.find_one({"_id": res.inserted_id})

        out = _to_str_id(created)
        self._idem_set(idem_key, out)
        return out

    async def get_pago(self, pid: str) -> dict:
        pago = await db().pago.find_one({"_id": _oid(pid)})
        if not pago:
            raise NotFoundError("Pago no encontrado", extra={"id": pid})
        return _to_str_id(pago)

    async def list_pagos(
        self,
        id_suscripcion: str | None = None,
        estado: str | None = None,
        metodo: str | None = None,
    ) -> list[dict]:
        q: dict[str, Any] = {}
        if id_suscripcion:
            q["id_suscripcion"] = _oid(id_suscripcion)
        if estado:
            q["estado"] = estado
        if metodo:
            q["metodo"] = metodo

        cur = db().pago.find(q)
        return [_to_str_id(d) async for d in cur]

    async def update_pago(self, pid: str, data: dict) -> dict:
        pago = await db().pago.find_one({"_id": _oid(pid)})
        if not pago:
            raise NotFoundError("Pago no encontrado", extra={"id": pid})

        patch: dict[str, Any] = {}
        if "stripeSessionId" in data and data["stripeSessionId"] is not None:
            patch["stripeSessionId"] = data["stripeSessionId"]
        if "estado" in data and data["estado"]:
            patch["estado"] = data["estado"]

        if patch:
            patch["updatedAt"] = datetime.utcnow()
            await db().pago.update_one({"_id": _oid(pid)}, {"$set": patch})
            pago = await db().pago.find_one({"_id": _oid(pid)})

        # si exitoso => activar suscripción
        if pago["estado"] == "exitoso":
            sid = pago["id_suscripcion"]
            await db().suscripcion.update_one(
                {"_id": sid},
                {"$set": {"estado": "activa", "updatedAt": datetime.utcnow()}},
            )

        return _to_str_id(pago)

    async def delete_pago(self, pid: str) -> bool:
        pago = await db().pago.find_one({"_id": _oid(pid)})
        if not pago:
            raise NotFoundError("Pago no encontrado", extra={"id": pid})
        if pago["estado"] == "exitoso":
            raise ConflictError("No se puede eliminar un pago exitoso", extra={"id": pid})
        res = await db().pago.delete_one({"_id": _oid(pid)})
        return res.deleted_count == 1
