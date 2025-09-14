from datetime import datetime, timedelta
import pytest

from domain.services import PaymentsService
from infra.repo_mock import SUBS, PAGOS

@pytest.fixture(autouse=True)
def clear_state():
    # solo quedan los planes semilla
    SUBS.clear()
    PAGOS.clear()

def test_create_sub_calcula_fin_y_estado_pendiente():
    svc = PaymentsService()
    # Se usa el plan id 1
    inicio = "2025-01-01T00:00:00"
    sub = svc.create_sub(user_id="user-xyz", plan_id="1", inicio_iso=inicio)

    assert sub["estado"] == "pendiente"
    assert sub["plan_id"] == "1"
    assert sub["inicio_iso"] == inicio

    fin = datetime.fromisoformat(sub["fin_iso"])
    esperado = datetime(2025, 1, 1) + timedelta(days=30)  # 30 días por plan "1"
    assert fin == esperado

def test_update_pago_a_exitoso_activa_suscripcion():
    svc = PaymentsService()

    # 1) crear suscripción sobre plan "1"
    sub = svc.create_sub(user_id="user-abc", plan_id="1", inicio_iso="2025-01-01T00:00:00")
    sid = sub["id"]
    assert SUBS[sid]["estado"] == "pendiente"

    # 2) crear pago
    pago = svc.create_pago(suscripcion_id=sid, monto=9.99, metodo="stripe_simulado")
    pid = pago["id"]
    assert PAGOS[pid]["estado"] == "creado"

    # 3) actualizar pago a exitoso y pasa a ser una suscripción activa
    updated = svc.update_pago(pid, {"estado": "exitoso", "provider_ref": "sim_123"})
    assert updated["estado"] == "exitoso"
    assert SUBS[sid]["estado"] == "activa"
