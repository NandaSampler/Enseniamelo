# cursoservice/app/api/v1/routers/horario_router.py
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioOut
from app.services.horario_service import HorarioService

router = APIRouter(prefix="/api/v1/horarios", tags=["Horarios"])

def get_service() -> HorarioService:
    return HorarioService()

@router.get("/", response_model=List[HorarioOut])
def list_horarios(
    curso_id: Optional[int] = Query(None, description="Filtrar por id de curso"),
    service: HorarioService = Depends(get_service),
):
    return service.list(curso_id=curso_id)

@router.get("/{horario_id}", response_model=HorarioOut)
def get_horario(horario_id: int, service: HorarioService = Depends(get_service)):
    return service.get(horario_id)

@router.post("/", response_model=HorarioOut, status_code=status.HTTP_201_CREATED)
def create_horario(payload: HorarioCreate, service: HorarioService = Depends(get_service)):
    return service.create(payload)

@router.put("/{horario_id}", response_model=HorarioOut)
def update_horario(
    horario_id: int, payload: HorarioUpdate, service: HorarioService = Depends(get_service)
):
    return service.update(horario_id, payload)

@router.delete("/{horario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_horario(horario_id: int, service: HorarioService = Depends(get_service)):
    service.delete(horario_id)
    return None
