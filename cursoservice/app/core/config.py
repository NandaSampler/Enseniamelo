# cursoservice/app/core/config.py
from __future__ import annotations
import os
from functools import lru_cache
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()  # carga variables desde .env si existe

@dataclass
class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "CursoService")
    APP_ENV: str = os.getenv("APP_ENV", "dev")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("1", "true", "yes", "on")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")

    # Si luego agregas BD u otros servicios, añade aquí
    # DATABASE_URL: str = os.getenv("DATABASE_URL", "")

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
