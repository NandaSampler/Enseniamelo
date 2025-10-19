# cursoservice/app/api/v1/routers/curso_categoria_router.py
from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.curso_categoria import CursoCategoriaLink, CursoCategoriaOut
from app.services.curso_categoria_service import CursoCategoriaService

router = APIRouter(prefix="/api/v1/curso-categoria", tags=["Curso-Categoria"])

def get_service() -> CursoCategoriaService:
    return CursoCategoriaService()

@router.get("/", response_model=List[CursoCategoriaOut])
def list_links(service: CursoCategoriaService = Depends(get_service)):
    return service.list()

@router.post("/", response_model=CursoCategoriaOut, status_code=status.HTTP_201_CREATED)
def add_link(link: CursoCategoriaLink, service: CursoCategoriaService = Depends(get_service)):
    return service.add(link)

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def remove_link(link: CursoCategoriaLink, service: CursoCategoriaService = Depends(get_service)):
    service.remove(curso_id=link.curso_id, categoria_id=link.categoria_id)
    return None
