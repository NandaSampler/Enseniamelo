# hp.py
from __future__ import annotations
import os, sys, time, json
from datetime import datetime, timedelta
import requests
from bson import ObjectId  # pip install bson

GW = os.getenv("GW", "http://localhost:8080/curso")  # Gateway con prefijo /curso
BASE = f"{GW}/api/v1"

def pretty(obj): 
    return json.dumps(obj, ensure_ascii=False, indent=2, default=str)

def _check(r: requests.Response):
    try:
        r.raise_for_status()
    except requests.HTTPError as e:
        body = None
        try:
            body = r.json()
        except Exception:
            body = r.text
        print(f"\n❌ {r.request.method} {r.request.url} → {r.status_code}\n{pretty(body)}")
        raise
    return r

def get(path, **kw):    return _check(requests.get   (BASE + path, **kw)).json()
def post(path, json=None, **kw): return _check(requests.post  (BASE + path, json=json, **kw)).json()
def put(path, json=None, **kw):  return _check(requests.put   (BASE + path, json=json, **kw)).json()
def delete(path, **kw):          return _check(requests.delete(BASE + path, **kw))

def gen_oid() -> str:
    return str(ObjectId())  # Solo necesita ser un ObjectId válido; no hay FK real para tutor

def main():
    print(f"Usando Gateway: {GW}")

    # 0) Health del cursoservice a través del gateway
    r = requests.get(f"{GW}/health")
    _check(r)
    print("✓ cursoservice health OK vía gateway")

    # 1) Crear CATEGORÍA (esquema: solo 'nombre' requerido)
    #    Para evitar colisión por nombre duplicado en tu service, agrego sufijo de tiempo.
    sufijo = datetime.now().strftime("%Y%m%d%H%M%S")
    categoria = post("/categorias/", {
        "nombre": f"Programación-{sufijo}"
    })
    print("✓ Categoría creada:\n", pretty(categoria))

    # 2) Crear CURSO (campos obligatorios: tutor_id, nombre, modalidad)
    #    El resto opcionales; uso un cupo para validar la lógica de reserva.
    curso = post("/cursos/", {
        "tutor_id": gen_oid(),
        "nombre": f"Python Básico {sufijo}",
        "descripcion": "Curso introductorio de Python",
        "modalidad": "online",
        "fotos": [],
        "necesita_reserva": False,
        "tiene_cupo": True,
        "cupo": 2,
        "cupo_ocupado": 0,
        "estado": "activo"
    })
    print("✓ Curso creado:\n", pretty(curso))

    # 3) Crear HORARIO (inicio < fin)
    inicio = (datetime.utcnow() + timedelta(hours=1)).replace(microsecond=0).isoformat() + "Z"
    fin    = (datetime.utcnow() + timedelta(hours=2)).replace(microsecond=0).isoformat() + "Z"
    horario = post("/horarios/", {
        "curso_id": curso["id"],
        "inicio": inicio,
        "fin": fin
    })
    print("✓ Horario creado:\n", pretty(horario))

    # 4) Vincular CURSO ↔ CATEGORÍA
    vinculo = post("/cursos/{}/categorias".format(curso["id"]), {
        "curso_id": curso["id"],
        "categoria_id": categoria["id"]
    })
    print("✓ Curso vinculado a categoría (curso actualizado):\n", pretty(vinculo))

    # 5) Crear RESERVA (consumirá 1 cupo si estado != 'cancelada')
    reserva = post("/reservas/", {
        "curso_id": curso["id"],
        "horario_id": horario["id"],
        "pagado": False,
        "estado": "pendiente"
    })
    print("✓ Reserva creada:\n", pretty(reserva))

    # 6) Listados para verificar
    cat_list = get("/categorias/")
    print(f"✓ Listado de categorías (total: {len(cat_list)}): muestra 1\n", pretty(cat_list[:1]))

    curso_list = get("/cursos/")
    print(f"✓ Listado de cursos (total: {len(curso_list)}): muestra 1\n", pretty(curso_list[:1]))

    horarios_list = get("/horarios/", params={"curso_id": curso["id"]})
    print(f"✓ Listado de horarios del curso (total: {len(horarios_list)}):\n", pretty(horarios_list))

    reservas_list = get("/reservas/", params={"curso_id": curso["id"]})
    print(f"✓ Listado de reservas del curso (total: {len(reservas_list)}): muestra 1\n", pretty(reservas_list[:1]))

    # 7) Transición de reserva: pendiente -> confirmada (no cambia cupo respecto a pendiente)
    reserva = put(f"/reservas/{reserva['id']}", {"estado": "confirmada"})
    print("✓ Reserva actualizada a CONFIRMADA:\n", pretty(reserva))

    # 8) Transición a cancelada (debería liberar cupo)
    reserva = put(f"/reservas/{reserva['id']}", {"estado": "cancelada"})
    print("✓ Reserva actualizada a CANCELADA:\n", pretty(reserva))

    # 9) Leer nuevamente el curso para ver cupo_ocupado (debería volver a 0 si era 1)
    curso_refrescado = get(f"/cursos/{curso['id']}")
    print("✓ Curso tras cambios de la reserva:\n", pretty(curso_refrescado))

    print("\n🎉 Happy path COMPLETADO con éxito.\n")
    print("Endpoints probados vía gateway:")
    print(f"- GET {GW}/health")
    print(f"- POST {BASE}/categorias/")
    print(f"- POST {BASE}/cursos/")
    print(f"- POST {BASE}/horarios/")
    print(f"- POST {BASE}/cursos/{{id}}/categorias")
    print(f"- POST {BASE}/reservas/")
    print(f"- GET  {BASE}/categorias/")
    print(f"- GET  {BASE}/cursos/")
    print(f"- GET  {BASE}/horarios/?curso_id=...")
    print(f"- GET  {BASE}/reservas/?curso_id=...")
    print(f"- PUT  {BASE}/reservas/{{id}}  (confirmada → cancelada)")
    print(f"- GET  {BASE}/cursos/{{id}}")
    print("\nSi quieres limpiar manualmente, usa los DELETE en el orden inverso.\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("\n💥 Falló el happy path:", e)
        sys.exit(1)
