# cursoservice/app/core/logging.py
from __future__ import annotations
import logging
from logging.config import dictConfig
from app.core.config import settings

def setup_logging() -> None:
    level = settings.LOG_LEVEL.upper()
    dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {"format": "%(asctime)s %(levelname)s [%(name)s] %(message)s"},
            "uvicorn": {"format": "%(asctime)s %(levelname)s [%(name)s] %(message)s"},
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": level,
            }
        },
        "loggers": {
            "": {"handlers": ["console"], "level": level},
            "uvicorn": {"handlers": ["console"], "level": level, "propagate": False},
            "uvicorn.error": {"level": level},
            "uvicorn.access": {"handlers": ["console"], "level": level, "propagate": False},
        },
    })

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
