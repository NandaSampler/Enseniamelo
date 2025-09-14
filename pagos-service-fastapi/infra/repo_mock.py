from typing import Dict, List


PLANS: Dict[str, dict] = {}
SUBS: Dict[str, dict] = {}
PAGOS: Dict[str, dict] = {}


PLANS["1"] = {"id": "1", "nombre": "Basic",   "precio": 9.99, "duracion": 30, "estado": "activo"}
PLANS["2"] = {"id": "2", "nombre": "Premium", "precio": 19.99, "duracion": 30, "estado": "activo"}

def _next_id(store: dict[str, dict]) -> str:
    if not store:
        return "1"
    nums = [int(k) for k in store.keys() if str(k).isdigit()]
    return str((max(nums) if nums else 0) + 1)

def next_plan_id() -> str:
    return _next_id(PLANS)

def next_sub_id() -> str:
    return _next_id(SUBS)

def next_pago_id() -> str:
    return _next_id(PAGOS)