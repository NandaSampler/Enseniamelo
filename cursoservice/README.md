Aquí tienes el **README.md** listo para pegar en la raíz del proyecto `cursoservice/`:

---

# CursoService (FastAPI)

Microservicio para gestionar **Cursos**, **Categorías**, **Horarios** y **Reservas**.
Diseñado siguiendo los principios de Spring Boot (controllers/services/repositories/DTOs) pero implementado en **Python + FastAPI**.

## ✨ Características

* **Routers (Controllers)** por recurso.
* **Services** con reglas de negocio (cupos, solapes de horarios, vínculos curso–categoría).
* **DTOs/Validaciones** con Pydantic (errores 422 automáticos).
* **Manejo global de excepciones** (404/400/422) con un **formato de error uniforme**.
* **Documentación OpenAPI** lista: `/docs`, `/redoc`, `/openapi.json`.
* **Tests** (unitarios de negocio y de API con `pytest`).
* **Colección Postman** para ejecutar el flujo completo.

---

## 🧱 Estructura

```
cursoservice/
├─ app/
│  ├─ main.py
│  ├─ api/
│  │  └─ v1/
│  │     └─ routers/
│  │        ├─ curso_router.py
│  │        ├─ categoria_router.py
│  │        ├─ curso_categoria_router.py
│  │        ├─ horario_router.py
│  │        └─ reserva_router.py
│  ├─ schemas/                   # DTOs Pydantic
│  ├─ services/                  # Reglas de negocio
│  ├─ repositories/              # Persistencia in-memory (thread-safe)
│  ├─ exceptions/                # Tipos de error + handlers globales
│  └─ core/                      # Config/Logging
├─ tests/                        # Pytest (servicios y API)
├─ requirements.txt
└─ .env.example
```

---

## 🚀 Levantar el proyecto

### 1) Crear/activar entorno y dependencias

```bash
# Windows PowerShell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Linux/macOS
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 2) Variables de entorno

Crea un `.env` (puedes copiar de `.env.example`):

```
APP_NAME=CursoService
APP_ENV=dev
LOG_LEVEL=INFO
API_PREFIX=/api/v1
```

### 3) Ejecutar

```bash
uvicorn app.main:app --reload --port 8000
```

* Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Redoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* OpenAPI JSON: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)
* Health: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

> Nota: Las rutas de **lista/creación** están definidas con **barra final** (ej. `/api/v1/cursos/`).

---

## 📘 Documentación (OpenAPI)

FastAPI genera OpenAPI automáticamente a partir de:

* Decoradores en routers (`@router.get/post/...`) ⇒ *paths/métodos/códigos*
* `response_model` y **Pydantic Schemas** ⇒ *components/schemas*
* Metadata en `FastAPI(title, description, version, ...)`

**Cómo mostrarlo**: abre `/docs`, expande un tag (p. ej. *Cursos*), haz **Try it out**, envía el body y revisa la respuesta y el “Schema”.

---

## 🔌 Endpoints (resumen)

### Cursos `/api/v1/cursos`

* `GET /` lista (filtro `?q=` opcional)
* `GET /{id}`
* `POST /` *(crear)*
* `PUT /{id}`
* `DELETE /{id}`
* **Relación categorías**:

  * `POST /{curso_id}/categorias` (body: `{curso_id, categoria_id}`)
  * `GET /{curso_id}/categorias`
  * `DELETE /{curso_id}/categorias/{categoria_id}`

**Ejemplo creación de curso**

```json
{
  "nombre": "Python Básico",
  "descripcion": "Intro a Python",
  "modalidad": "online",
  "duracion_semanas": 4,
  "costo_inscripcion": 0,
  "costo_curso": 100,
  "cupo_maximo": 2,
  "cupo_ocupado": 0,
  "estado": "activo"
}
```

### Categorías `/api/v1/categorias`

* `GET /`
* `GET /{id}`
* `POST /`
* `PUT /{id}`
* `DELETE /{id}`
* `GET /{categoria_id}/cursos`

### Horarios `/api/v1/horarios`

* `GET /?curso_id=...`
* `GET /{id}`
* `POST /` (valida que `fin > inicio` y que el curso exista; evita **solapes**)
* `PUT /{id}`
* `DELETE /{id}` (no permite si hay reservas)

### Reservas `/api/v1/reservas`

* `GET /?curso_id=...&horario_id=...`
* `GET /{id}`
* `POST /` (consume **cupo** si estado ≠ `cancelada`)
* `PUT /{id}` (transiciones liberan/consumen cupo)
* `DELETE /{id}` (libera cupo si estaba activa)

---

## ✅ Validaciones y reglas clave

* **Schemas (Pydantic)**

  * `curso.py`: `cupo_ocupado ≤ cupo_maximo`, enums de `modalidad` y `estado`.
  * `horario.py`: `fin > inicio`.
  * `reserva.py`: `estado` ∈ {pendiente, confirmada, cancelada}.

* **Services**

  * `reserva_service.py`: control de **cupos** (incrementa/decrementa).
  * `horario_service.py`: evita **solapes** de horarios para el mismo curso.
  * `curso_service.py` / `categoria_service.py`: restricciones de borrado por dependencias.

---

## 🧯 Manejo de errores (formato uniforme)

Handlers globales en `app/exceptions/handlers.py`:

* `KeyError` → **404 Not Found**
* `ValueError` → **400 Bad Request**
* `RequestValidationError` → **422 Unprocessable Entity**

**Ejemplo de respuesta de error**

```json
{
  "error": {
    "type": "bad_request",
    "message": "el horario se solapa con otro existente para el mismo curso",
    "status": 400
  }
}
```

---

## 🧪 Tests

### Correr pruebas

```bash
# Asegúrate de estar en la raíz del proyecto
pytest -q
# ó
python -m pytest -q
```

* Éxito = “`... passed`” y código de salida **0** (`$LASTEXITCODE` en PowerShell).
* Para cobertura:

  ```bash
  python -m pip install pytest-cov
  pytest --cov=app -q
  ```

### Qué prueban

* `tests/test_cursos.py`: **unitario de servicios** (reglas de cupos al crear/cancelar).
* `tests/test_api.py`: **API** con `TestClient` (flujo feliz, `/openapi.json`, 422/404).

> Si `pytest` no encuentra el paquete `app`, el proyecto incluye `pytest.ini` con `pythonpath = .`.

---

## 🧭 Postman

Incluye colección **“CursoService (FastAPI)”** con flujo completo.
**Cómo usarla**:

1. Levanta el server: `uvicorn app.main:app --reload --port 8000`.
2. Importa el JSON en Postman (**Import → File**).
3. Verifica la variable `base_url` (por defecto `http://127.0.0.1:8000`).
4. Ejecuta en orden: **Health → OpenAPI → Cursos: Crear → Categorías: Crear → Vincular → Horarios: Crear → Reservas: Crear → Verificar cupo → Cancelar → Verificar cupo**.
   Cada request guarda IDs en variables y tiene tests básicos.

---

## 🧠 Diseño por capas (paridad con Spring)

| Capa               | ¿Qué hace?                     | Dónde                     |
| ------------------ | ------------------------------ | ------------------------- |
| **Controller**     | Capa HTTP/JSON                 | `app/api/v1/routers/*.py` |
| **Service**        | Reglas de negocio              | `app/services/*.py`       |
| **Repository**     | Persistencia (aquí: in-memory) | `app/repositories/*.py`   |
| **DTO/Validación** | Contratos y validaciones       | `app/schemas/*.py`        |
| **Excepciones**    | Formato de error y handlers    | `app/exceptions/*`        |
| **Core**           | Config/Logging                 | `app/core/*`              |

---

## 🔄 Persistencia

Actualmente los repos son **in-memory** (sin BD), suficiente para demos y tests.
Para persistencia real, reemplaza `repositories/` por SQLAlchemy/SQLModel (sin tocar routers ni services).

---

## 🛠 Requisitos

* Python 3.11+ (recomendado 3.12)
* `pip`, `venv`
* Postman (opcional para pruebas manuales)

---

