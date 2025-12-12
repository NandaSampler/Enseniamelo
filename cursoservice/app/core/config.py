# cursoservice/app/core/config.py
from __future__ import annotations

import os
import re
from functools import lru_cache
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv

# Opcional: si dejas un .env local para desarrollo, pero ya no es necesario en docker
load_dotenv()

# ==========================
# Helpers para Config Server
# ==========================

PLACEHOLDER_PATTERN = re.compile(r"\$\{([^}]+)\}")


def resolve_placeholders(value: str, props: dict) -> str:
    """
    Reemplaza placeholders estilo Spring (${clave}) usando el dict de propiedades
    que devuelve el Config Server.
    Ej:
      value = "http://${app.eureka-server}:8761/eureka/"
      props["app.eureka-server"] = "eureka"
      -> "http://eureka:8761/eureka/"
    """

    def _replacer(match: re.Match) -> str:
        key = match.group(1)
        if key in props and props[key] is not None:
            return str(props[key])
        return match.group(0)

    return PLACEHOLDER_PATTERN.sub(_replacer, value)


def _fetch_config(app_name: str, profile: str) -> dict:
    """
    Llama al Config Server y devuelve todas las propiedades ya mergeadas
    para ese app_name y profile.
    """
    base_uri = os.getenv("SPRING_CLOUD_CONFIG_URI", "http://localhost:8888").rstrip("/")
    user = os.getenv("CONFIG_SERVER_USR")
    pwd = os.getenv("CONFIG_SERVER_PWD")

    url = f"{base_uri}/{app_name}/{profile}"
    auth = (user, pwd) if user and pwd else None

    resp = httpx.get(url, auth=auth, timeout=5.0)
    resp.raise_for_status()
    data = resp.json()

    props: dict = {}
    # Recorremos en orden para que el último sobrescriba
    for src in reversed(data.get("propertySources", [])):
        source = src.get("source", {})
        props.update(source)

    return props


def bootstrap_from_config_server() -> None:
    """
    1) Lee application.yml global desde el Config Server
    2) Lee cursoservice.yml
    3) Mapea a variables de entorno que usa el FastAPI de curso
    """
    profile = os.getenv("SPRING_PROFILES_ACTIVE", "default")

    # Nombre fijo del archivo en el config-server para ESTE microservicio:
    # src/main/resources/config/cursoservice.yml, por ejemplo
    app_name_for_config = "cursoservice"

    try:
        # 1) Configuración global (application.yml)
        global_props = _fetch_config("application", profile)

        # ---- Eureka ----
        raw_default_zone = global_props.get("eureka.client.serviceUrl.defaultZone")
        if isinstance(raw_default_zone, str):
            resolved_default_zone = resolve_placeholders(raw_default_zone, global_props)
            parsed = urlparse(resolved_default_zone)

            host = parsed.hostname or "eureka-server"
            port = parsed.port or 8761
            scheme = parsed.scheme or "http"
            path = parsed.path or "/eureka/"
            if not path.endswith("/"):
                path += "/"

            if host in ("localhost", "127.0.0.1", "eureka"):
                host = "eureka-server"

            eureka_url = f"{scheme}://{host}:{port}{path}"
            os.environ["EUREKA_SERVER"] = eureka_url
            print(f"[ConfigServer - curso] Eureka URL resuelta: {eureka_url}")

        # 2) Config específica de cursoservice.yml
        app_props = _fetch_config(app_name_for_config, profile)

        # Claves que queremos copiar desde cursoservice.yml
        keys_to_copy = [
            "APP_NAME",
            "APP_ENV",
            "DEBUG",
            "LOG_LEVEL",
            "API_PREFIX",
            "PORT",
            "MONGODB_URI",
            "MONGODB_DB",
        ]

        for key in keys_to_copy:
            if key in app_props and app_props[key] is not None:
                os.environ[key] = str(app_props[key])

    except Exception as exc:
        print(f"[ConfigServer - curso] No se pudo cargar configuración :: {exc}")


# Ejecutamos el bootstrap ANTES de construir Settings
bootstrap_from_config_server()

# ==========================
# Settings del curso
# ==========================

@dataclass
class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "CursoService")
    APP_ENV: str = os.getenv("APP_ENV", "dev")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("1", "true", "yes", "on")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")

    # URL completa de Eureka resuelta desde config-server
    EUREKA_SERVER: str = os.getenv(
        "EUREKA_SERVER",
        "http://eureka-server:8761/eureka/",
    )

    # Si luego usas Mongo desde aquí, ya tienes las env puestas
    # MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    # MONGODB_DB: str = os.getenv("MONGODB_DB", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
