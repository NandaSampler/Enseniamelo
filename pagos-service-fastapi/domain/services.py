import uuid
from datetime import datetime, timedelta
from payments_errors.errors import NotFoundError, ConflictError
from infra.repo_mock import PLANS, SUBS, PAGOS, next_plan_id, next_sub_id, next_pago_id


IDEMP_CACHE: dict[str, dict] = {}


class PaymentsService:
    # PLANES
    def list_plans(self):
        return list(PLANS.values())

    def create_plan(self, data: dict):
        pid = str(len(PLANS) + 1)
        if pid in PLANS:
            raise ConflictError("Plan ya existe")
        data = {**data, "id": pid}
        PLANS[pid] = data
        return data

    # SUSCRIPCIONES
    def create_sub(self, user_id: str, plan_id: str, inicio_iso: str):
        if plan_id not in PLANS:
            raise NotFoundError("Plan no encontrado")
        sid = next_sub_id() 
        inicio = datetime.fromisoformat(inicio_iso)
        fin = inicio + timedelta(days=int(PLANS[plan_id]["duracion"]))
        SUBS[sid] = {
            "id": sid, "user_id": user_id, "plan_id": plan_id,
            "inicio_iso": inicio.isoformat(), "fin_iso": fin.isoformat(),
            "estado": "pendiente",
        }
        return SUBS[sid]

    def get_sub(self, sid: str):
        if sid not in SUBS:
            raise NotFoundError("Suscripción no encontrada")
        return SUBS[sid]

    # PAGOS
    def _idem_get(self, key: str | None):
        if key and key in IDEMP_CACHE:
            return IDEMP_CACHE[key]
        return None

    def _idem_set(self, key: str | None, value: dict):
        if key:
            IDEMP_CACHE[key] = value

    def create_pago(self, suscripcion_id: str, monto: float, metodo: str, idem_key: str | None = None):
        cached = self._idem_get(idem_key)
        if cached:
            return cached

        if suscripcion_id not in SUBS:
            raise NotFoundError("Suscripción no encontrada")

        pid = next_pago_id()
        pago = {
            "id": pid, "suscripcion_id": suscripcion_id, "monto": monto,
            "metodo": metodo, "estado": "creado", "provider_ref": None,
        }
        PAGOS[pid] = pago
        self._idem_set(idem_key, pago)
        return pago

    def get_pago(self, pid: str):
        if pid not in PAGOS:
            raise NotFoundError("Pago no encontrado")
        return PAGOS[pid]

# PLANES 
    def update_plan(self, pid: str, data: dict):
        if pid not in PLANS:
            raise NotFoundError("Plan no encontrado")
        plan = PLANS[pid]
        for k in ("nombre", "precio", "duracion", "estado"):
            if k in data and data[k] is not None:
                plan[k] = data[k]
        PLANS[pid] = plan
        return plan

    def delete_plan(self, pid: str):
        if pid not in PLANS:
            raise NotFoundError("Plan no encontrado")
        # no permitir borrar si hay suscripciones que referencian el plan
        for s in SUBS.values():
            if s["plan_id"] == pid:
                raise ConflictError("Plan en uso por suscripciones")
        del PLANS[pid]
        return True

#SUSCRIPCIONES
    def update_sub(self, sid: str, data: dict):
        if sid not in SUBS:
            raise NotFoundError("Suscripción no encontrada")
        sub = SUBS[sid]

        # cambio de plan (debe existir)
        if "plan_id" in data and data["plan_id"]:
            new_plan = data["plan_id"]
            if new_plan not in PLANS:
                raise NotFoundError("Plan no encontrado")
            sub["plan_id"] = new_plan

        # cambio de inicio 
        if "inicio_iso" in data and data["inicio_iso"]:
            inicio = datetime.fromisoformat(data["inicio_iso"])
            sub["inicio_iso"] = inicio.isoformat()

        if ("inicio_iso" in data and data["inicio_iso"]) or ("plan_id" in data and data["plan_id"]):
            dur = int(PLANS[sub["plan_id"]]["duracion"])
            fin = datetime.fromisoformat(sub["inicio_iso"]) + timedelta(days=dur)
            sub["fin_iso"] = fin.isoformat()

        # cambio de estado: solo permitimos 'cancelada' en este mock
        if "estado" in data and data["estado"]:
            if data["estado"] != "cancelada":
                raise ConflictError("Solo se permite cambiar estado a 'cancelada'")
            sub["estado"] = "cancelada"

        SUBS[sid] = sub
        return sub

    def delete_sub(self, sid: str):
        if sid not in SUBS:
            raise NotFoundError("Suscripción no encontrada")
        # no permitir borrar si tiene pagos
        for p in PAGOS.values():
            if p["suscripcion_id"] == sid:
                raise ConflictError("No se puede borrar: la suscripción tiene pagos")
        del SUBS[sid]
        return True

    # PAGOS -
    def update_pago(self, pid: str, data: dict):
        if pid not in PAGOS:
            raise NotFoundError("Pago no encontrado")
        pago = PAGOS[pid]

        if "provider_ref" in data and data["provider_ref"] is not None:
            pago["provider_ref"] = data["provider_ref"]
        if "estado" in data and data["estado"]:
            new_state = data["estado"]
            pago["estado"] = new_state
            # si exitoso => activar suscripción
            if new_state == "exitoso":
                sid = pago["suscripcion_id"]
                if sid in SUBS:
                    SUBS[sid]["estado"] = "activa"

        PAGOS[pid] = pago
        return pago

    def delete_pago(self, pid: str):
        if pid not in PAGOS:
            raise NotFoundError("Pago no encontrado")
        if PAGOS[pid]["estado"] == "exitoso":
            raise ConflictError("No se puede eliminar un pago exitoso")
        del PAGOS[pid]
        return True
    

    def list_subs(self, user_id: str | None = None, plan_id: str | None = None, estado: str | None = None):
        """Lista suscripciones con filtros opcionales por user_id, plan_id y estado."""
        records = list(SUBS.values())
        if user_id:
            records = [s for s in records if s["user_id"] == user_id]
        if plan_id:
            records = [s for s in records if s["plan_id"] == plan_id]
        if estado:
            records = [s for s in records if s["estado"] == estado]
        return records

    def list_pagos(self, suscripcion_id: str | None = None, estado: str | None = None, metodo: str | None = None):
        """Lista pagos con filtros opcionales por suscripcion_id, estado y metodo."""
        records = list(PAGOS.values())
        if suscripcion_id:
            records = [p for p in records if p["suscripcion_id"] == suscripcion_id]
        if estado:
            records = [p for p in records if p["estado"] == estado]
        if metodo:
            records = [p for p in records if p["metodo"] == metodo]
        return records
    
    def list_subs(self, user_id: str | None = None, plan_id: str | None = None, estado: str | None = None):
        """Lista suscripciones con filtros opcionales por user_id, plan_id y estado."""
        records = list(SUBS.values())
        if user_id:
            records = [s for s in records if s["user_id"] == user_id]
        if plan_id:
            records = [s for s in records if s["plan_id"] == plan_id]
        if estado:
            records = [s for s in records if s["estado"] == estado]
        return records



