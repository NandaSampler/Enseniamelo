# domain/settings.py
import os
import re 
from urllib.parse import urlparse

import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

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
    Llama al Config Server y devuelve todas las propiedades ya mergeadas.
    Emula lo que hace Spring Cloud Config (mezclar propertySources en orden).
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
    for src in data.get("propertySources", []):
        source = src.get("source", {})
        props.update(source)
    return props


def bootstrap_from_config_server() -> None:
    """
    1) Lee application.yml global desde el Config Server
    2) Lee payments-service.yml
    3) Mapea a variables de entorno que usa el FastAPI
    """
    profile = os.getenv("SPRING_PROFILES_ACTIVE", "default")
    app_name_for_config = os.getenv("APP_NAME", "payments-service")

    try:
        # 1) Configuración global (application.yml)
        global_props = _fetch_config("application", profile)

        # ---- Mongo DB global ----
        mongo_uri = (
            global_props.get("eureka.data.mongodb.uri")
            or global_props.get("data.mongodb.uri")
        )
        mongo_db = global_props.get("eureka.data.mongodb.database") or global_props.get(
            "data.mongodb.database"
        )

        if mongo_uri:
            os.environ.setdefault("MONGO_URI", str(mongo_uri))
        if mongo_db:
            os.environ.setdefault("MONGO_DB", str(mongo_db))

        # ---- Eureka ----
        raw_default_zone = global_props.get("eureka.client.serviceUrl.defaultZone")

        if isinstance(raw_default_zone, str):
            # 1) Resolver placeholders ${...} usando las propiedades globales
            resolved_default_zone = resolve_placeholders(raw_default_zone, global_props)
            # 2) Parsear la URL resultante
            parsed = urlparse(resolved_default_zone)

            host = parsed.hostname or "eureka-server"
            port = parsed.port or 8761

            os.environ.setdefault("EUREKA_HOST", host)
            os.environ.setdefault("EUREKA_PORT", str(port))


        # 2) Config específica de payments-service.yml
        app_props = _fetch_config(app_name_for_config, profile)

        # Mapeamos de claves
        keys_to_copy = [
            "APP_NAME",
            "APP_PORT",
            "EUREKA_APP_NAME",
            "EUREKA_INSTANCE_HOST",
            "EUREKA_INSTANCE_PORT",
            "EUREKA_SECURE",
            "EUREKA_HEARTBEAT",
            "EUREKA_REFRESH",
            "MONGO_URI",
            "MONGO_DB",
            "secret.mongo-password"
        ]

        for key in keys_to_copy:
            if key in app_props and app_props[key] is not None:
                os.environ[key] = str(app_props[key])

    except Exception as exc:
        print(f"[ConfigServer] No se pudo cargar configuración :: {exc}")


bootstrap_from_config_server()


class Settings(BaseSettings):
    # App
    app_name: str = Field(default="payments-service", alias="APP_NAME")
    app_port: int = Field(default=8002, alias="APP_PORT")

    # Mongo Atlas 
    mongo_uri: str = Field(..., alias="MONGO_URI")
    mongo_db: str = Field(..., alias="MONGO_DB")

    # Colecciones fijas
    coll_plan: str = "plan"
    coll_suscripcion: str = "suscripcion"
    coll_pago: str = "pago"

    # Eureka 
    eureka_host: str = Field(default="eureka-server", alias="EUREKA_HOST")
    eureka_port: int = Field(default=8761, alias="EUREKA_PORT")
    eureka_app_name: str = Field(
        default="PAYMENTS-SERVICE", alias="EUREKA_APP_NAME"
    )
    eureka_instance_host: str = Field(
        default="payments-service", alias="EUREKA_INSTANCE_HOST"
    )
    eureka_instance_port: int = Field(default=8002, alias="EUREKA_INSTANCE_PORT")
    eureka_secure: bool = Field(default=False, alias="EUREKA_SECURE")
    eureka_heartbeat: int = Field(default=30, alias="EUREKA_HEARTBEAT")
    eureka_refresh: int = Field(default=30, alias="EUREKA_REFRESH")
    
    secret_mongo_password: str = Field(
        default="", 
        alias="SECRET_MONGO_PASSWORD"
    )

    model_config = SettingsConfigDict(
        env_file=".env",  
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
