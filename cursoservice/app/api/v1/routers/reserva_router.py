# cursoservice/app/api/v1/routers/reserva_router.py
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut
from app.services.reserva_service import ReservaService

router = APIRouter(prefix="/api/v1/reservas", tags=["Reservas"])

def get_service() -> ReservaService:
    return ReservaService()

@router.get("/", response_model=List[ReservaOut])
def list_reservas(
    curso_id: Optional[int] = Query(None),
    horario_id: Optional[int] = Query(None),
    service: ReservaService = Depends(get_service),
):
    return service.list(curso_id=curso_id, horario_id=horario_id)

@router.get("/{reserva_id}", response_model=ReservaOut)
def get_reserva(reserva_id: int, service: ReservaService = Depends(get_service)):
    return service.get(reserva_id)

@router.post("/", response_model=ReservaOut, status_code=status.HTTP_201_CREATED)
def create_reserva(payload: ReservaCreate, service: ReservaService = Depends(get_service)):
    return service.create(payload)

@router.put("/{reserva_id}", response_model=ReservaOut)
def update_reserva(
    reserva_id: int, payload: ReservaUpdate, service: ReservaService = Depends(get_service)
):
    return service.update(reserva_id, payload)

@router.delete("/{reserva_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reserva(reserva_id: int, service: ReservaService = Depends(get_service)):
    service.delete(reserva_id)
    return None
