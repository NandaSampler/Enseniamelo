from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.schemas.reserva import (
    ReservaCreate,
    ReservaListResponse,
    ReservaOut,
    ReservaResponse,
    DisponibilidadResponse,
)
from app.services.reserva_service import ReservaService

router = APIRouter(prefix="/api/v1/reservas", tags=["Reservas"])


def get_service() -> ReservaService:
    return ReservaService()


# --------- payloads extra (para tu frontend) ----------
class AceptarReservaPayload(BaseModel):
    cursoId: str = Field(...)
    estudianteId: str = Field(...)
    inicio: datetime = Field(...)
    duracion_min: Optional[int] = Field(60, description="Duración en minutos (default 60)")


class RechazarReservaPayload(BaseModel):
    cursoId: str
    estudianteId: str


class CompletarReservaPayload(BaseModel):
    cursoId: str
    estudianteId: str


# ---------------- CRUD + list envelope ----------------
@router.get("/", response_model=ReservaListResponse)
def list_reservas(
    id_usuario: Optional[str] = Query(None),
    id_curso: Optional[str] = Query(None),
    id_horario: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    service: ReservaService = Depends(get_service),
):
    reservas = service.list(
        id_usuario=id_usuario,
        id_curso=id_curso,
        id_horario=id_horario,
        estado=estado,
    )
    return {"success": True, "reservas": reservas}


@router.get("/{reserva_id}", response_model=ReservaResponse)
def get_reserva(reserva_id: str, service: ReservaService = Depends(get_service)):
    try:
        r = service.get(reserva_id)
        return {"success": True, "reserva": r}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
def create_reserva(payload: ReservaCreate, service: ReservaService = Depends(get_service)):
    try:
        r = service.create(payload)
        return {"success": True, "reserva": r}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------- extras que tu frontend usa ----------------
@router.get("/disponibilidad/{curso_id}", response_model=DisponibilidadResponse)
def disponibilidad(
    curso_id: str,
    id_usuario: Optional[str] = Query(None),
    service: ReservaService = Depends(get_service),
):
    try:
        data = service.disponibilidad(curso_id, id_usuario)
        return {"success": True, **data}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/estado", response_model=dict)
def estado_reserva_chat(
    cursoId: str = Query(...),
    estudianteId: str = Query(...),
    service: ReservaService = Depends(get_service),
):
    try:
        r = service.get_reserva_chat(cursoId, estudianteId)
        return {"success": True, "reserva": r}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/aceptar", response_model=ReservaResponse)
def aceptar_reserva(payload: AceptarReservaPayload, service: ReservaService = Depends(get_service)):
    try:
        r = service.aceptar_reserva(
            curso_id=payload.cursoId,
            estudiante_id=payload.estudianteId,
            inicio=payload.inicio,
            duracion_min=payload.duracion_min or 60,
        )
        return {"success": True, "reserva": r}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/rechazar", response_model=ReservaResponse)
def rechazar_reserva(payload: RechazarReservaPayload, service: ReservaService = Depends(get_service)):
    try:
        r = service.rechazar_reserva(payload.cursoId, payload.estudianteId)
        return {"success": True, "reserva": r}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/completar", response_model=ReservaResponse)
def completar_reserva(payload: CompletarReservaPayload, service: ReservaService = Depends(get_service)):
    try:
        r = service.completar_reserva(payload.cursoId, payload.estudianteId)
        return {"success": True, "reserva": r}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
