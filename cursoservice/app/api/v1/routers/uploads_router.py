from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/uploads", tags=["Uploads"])

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
MAX_MB = int(os.getenv("UPLOAD_MAX_MB", "10"))
ALLOWED = {"image/jpeg", "image/png", "image/webp"}

def _ensure_dir():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo no permitido: {image.content_type}. Usa JPG/PNG/WEBP.",
        )

    _ensure_dir()

    content = await image.read()
    max_bytes = MAX_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Archivo muy grande (máx {MAX_MB} MB).")

    ext = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }[image.content_type]

    filename = f"{uuid.uuid4().hex}{ext}"
    path = UPLOAD_DIR / filename

    with open(path, "wb") as f:
        f.write(content)

    # ✅ IMPORTANTE: devolver URL RELATIVA al gateway (NO host interno)
    # el gateway expone /curso/uploads/** y lo enruta al cursoservice /uploads/**
    return {
        "filename": filename,
        "url": f"/curso/uploads/{filename}",
    }
