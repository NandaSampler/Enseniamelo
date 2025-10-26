# domain/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # App
    app_name: str = Field(default="payments-service", alias="APP_NAME")
    app_port: int = Field(default=8002, alias="APP_PORT")

    # Mongo Atlas
    mongo_uri: str = Field(..., alias="MONGO_URI")
    mongo_db: str  = Field(..., alias="MONGO_DB")

    # Colecciones fijas
    coll_plan: str = "plan"
    coll_suscripcion: str = "suscripcion"
    coll_pago: str = "pago"

    # ------ Eureka (Discovery) ------
    # OJO: usa el nombre del servicio en docker-compose (eureka-server)
    eureka_host: str = Field(default="eureka-server", alias="EUREKA_HOST")
    eureka_port: int = Field(default=8761, alias="EUREKA_PORT")
    # ServiceId que verás en el dashboard (conviene MAYÚSCULAS)
    eureka_app_name: str = Field(default="PAYMENTS-SERVICE", alias="EUREKA_APP_NAME")
    # Host y puerto con los que el propio servicio se anuncia en la red de Docker
    eureka_instance_host: str = Field(default="payments-service", alias="EUREKA_INSTANCE_HOST")
    eureka_instance_port: int = Field(default=8002, alias="EUREKA_INSTANCE_PORT")
    eureka_secure: bool = Field(default=False, alias="EUREKA_SECURE")
    eureka_heartbeat: int = Field(default=30, alias="EUREKA_HEARTBEAT")
    eureka_refresh: int = Field(default=30, alias="EUREKA_REFRESH")

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

settings = Settings()
