from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaOut
from app.services.reserva_service import ReservaService

router = APIRouter(prefix="/api/v1/reservas", tags=["Reservas"])

def get_service() -> ReservaService:
    return ReservaService()

@router.get("/", response_model=List[ReservaOut])
def list_reservas(
    id_usuario: Optional[str] = Query(None),
    id_curso: Optional[str] = Query(None),
    id_horario: Optional[str] = Query(None),
    service: ReservaService = Depends(get_service),
):
    return service.list(
        id_usuario=id_usuario,
        id_curso=id_curso,
        id_horario=id_horario,
    )

@router.get("/{reserva_id}", response_model=ReservaOut)
def get_reserva(reserva_id: str, service: ReservaService = Depends(get_service)):
    return service.get(reserva_id)

@router.post("/", response_model=ReservaOut, status_code=status.HTTP_201_CREATED)
def create_reserva(payload: ReservaCreate, service: ReservaService = Depends(get_service)):
    return service.create(payload)

@router.put("/{reserva_id}", response_model=ReservaOut)
def update_reserva(
    reserva_id: str, payload: ReservaUpdate, service: ReservaService = Depends(get_service)
):
    return service.update(reserva_id, payload)

@router.delete("/{reserva_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reserva(reserva_id: str, service: ReservaService = Depends(get_service)):
    service.delete(reserva_id)
    return None
