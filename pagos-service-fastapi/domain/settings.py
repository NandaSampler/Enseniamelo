# domain/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Solo lo que usamos ahora para Mongo y la app
    app_name: str = "payments-service"
    app_port: int = 8002

    mongo_uri: str
    mongo_db: str

    # colecciones fijas de tu cluster
    coll_plan: str = "plan"
    coll_suscripcion: str = "suscripcion"
    coll_pago: str = "pago"

    # >>> clave: ignorar extras del .env (eureka, keycloak, etc.)
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",   # <--- esto evita el ValidationError por variables extra
    )

settings = Settings()
