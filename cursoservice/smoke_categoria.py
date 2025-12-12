#!/usr/bin/env python3
"""
Smoke test: crea una categoría y la lista para verificar
- que el servicio está arriba
- que la conexión a MongoDB funciona
"""

import os
import sys
import time
import json
import requests

BASE_URL = os.getenv("CURSOSERVICE_URL", "http://localhost:8000")
CATS_URL = f"{BASE_URL}/api/v1/categorias"

def pretty(obj):
    print(json.dumps(obj, indent=2, ensure_ascii=False))

def fail(msg, resp=None):
    print(f"❌ {msg}")
    if resp is not None:
        print(f"status={resp.status_code}")
        try:
            pretty(resp.json())
        except Exception:
            print(resp.text[:500])
    sys.exit(1)

def main():
    print(f"⏳ Probando servicio en: {BASE_URL}")

    # 1) Ping sencillo a la raíz o docs (si no tienes health)
    try:
        docs = requests.get(f"{BASE_URL}/docs", timeout=5)
        if docs.status_code not in (200, 307, 308):
            print("⚠️  No hay /docs accesible, seguimos de todos modos…")
    except Exception as e:
        print(f"⚠️  No se pudo abrir /docs: {e}")

    # 2) Crear categoría
    nombre = f"prueba-mongo-{int(time.time())}"
    payload = {"nombre": nombre}
    print(f"➡️  POST {CATS_URL}  payload={payload}")
    try:
        r = requests.post(CATS_URL, json=payload, timeout=10)
    except Exception as e:
        fail(f"No se pudo contactar al servicio (¿corre en {BASE_URL}?): {e}")

    if r.status_code not in (200, 201):
        fail("Fallo al crear categoría", r)

    created = r.json()
    print("✅ Categoría creada:")
    pretty(created)

    # 3) Listar categorías y verificar que esté la recién creada
    print(f"➡️  GET  {CATS_URL}")
    r2 = requests.get(CATS_URL, timeout=10)
    if r2.status_code != 200:
        fail("Fallo al listar categorías", r2)

    cats = r2.json()
    found = any(c.get("id") == created.get("id") or c.get("nombre") == nombre for c in cats)
    if not found:
        fail("La categoría creada no aparece al listar (revisa logs)")

    print("✅ Listado OK. Conexión a Mongo y repos/routers operativos.")
    print("👀 Últimas categorías:")
    pretty(cats[-5:])

if __name__ == "__main__":
    main()
