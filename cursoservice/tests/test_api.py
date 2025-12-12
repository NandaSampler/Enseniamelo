from __future__ import annotations
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from app.main import app

# Para aislar el estado in-memory entre tests
from app.repositories.curso_repository import curso_repo
from app.repositories.categoria_repository import categoria_repo
from app.repositories.curso_categoria_repository import curso_categoria_repo
from app.repositories.horario_repository import horario_repo
from app.repositories.reserva_repository import reserva_repo

@pytest.fixture(autouse=True)
def reset_state():
    curso_repo.clear()
    categoria_repo.clear()
    curso_categoria_repo.clear()
    horario_repo.clear()
    reserva_repo.clear()
    yield

client = TestClient(app)

def test_openapi_and_health():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    paths = r.json()["paths"].keys()
    assert any(p.rstrip("/") == "/api/v1/cursos" for p in paths)  # <- FIX
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["docs"] == "/docs"


def test_full_flow_api():
    # 1) crear curso
    payload_curso = {
        "nombre": "Python Básico",
        "descripcion": "Intro a Python",
        "modalidad": "online",
        "duracion_semanas": 4,
        "costo_inscripcion": 0,
        "costo_curso": 100,
        "cupo_maximo": 2,
        "cupo_ocupado": 0,
        "estado": "activo",
    }
    r = client.post("/api/v1/cursos", json=payload_curso)
    assert r.status_code == 201
    curso = r.json()
    # 2) crear horario
    inicio = (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z"
    fin = (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat() + "Z"
    r = client.post("/api/v1/horarios", json={"curso_id": curso["id"], "inicio": inicio, "fin": fin})
    assert r.status_code == 201
    horario = r.json()
    # 3) crear reserva (consume cupo)
    r = client.post("/api/v1/reservas", json={"curso_id": curso["id"], "horario_id": horario["id"], "pagado": False, "estado": "pendiente"})
    assert r.status_code == 201
    reserva = r.json()
    # 4) el cupo debe haber subido
    r = client.get(f"/api/v1/cursos/{curso['id']}")
    assert r.status_code == 200 and r.json()["cupo_ocupado"] == 1
    # 5) cancelar reserva -> libera cupo
    r = client.put(f"/api/v1/reservas/{reserva['id']}", json={"estado": "cancelada"})
    assert r.status_code == 200 and r.json()["estado"] == "cancelada"
    r = client.get(f"/api/v1/cursos/{curso['id']}")
    assert r.json()["cupo_ocupado"] == 0

def test_validation_422_and_not_found_404():
    # payload inválido: cupo_maximo < 1 y nombre vacío -> 422 por validación (DTOs)
    bad = {"nombre": "", "modalidad": "online", "cupo_maximo": 0, "cupo_ocupado": 0, "estado": "activo"}
    r = client.post("/api/v1/cursos", json=bad)
    assert r.status_code == 422  # validación de esquemas
    # 404 con formato uniforme de error
    r = client.get("/api/v1/cursos/9999")
    assert r.status_code == 404
    body = r.json()
    assert "error" in body and body["error"]["type"] == "not_found"
