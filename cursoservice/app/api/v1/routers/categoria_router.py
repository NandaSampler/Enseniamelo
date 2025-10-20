from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaOut
from app.schemas.curso import CursoOut
from app.services.categoria_service import CategoriaService
from app.services.curso_categoria_service import CursoCategoriaService

router = APIRouter(prefix="/api/v1/categorias", tags=["Categorias"])

def get_categoria_service() -> CategoriaService:
    return CategoriaService()

def get_cc_service() -> CursoCategoriaService:
    return CursoCategoriaService()

@router.get("/", response_model=List[CategoriaOut])
def list_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.list()

@router.get("/{categoria_id}", response_model=CategoriaOut)
def get_categoria(categoria_id: str, service: CategoriaService = Depends(get_categoria_service)):
    return service.get(categoria_id)

@router.post("/", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def create_categoria(
    payload: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)
):
    return service.create(payload)

@router.put("/{categoria_id}", response_model=CategoriaOut)
def update_categoria(
    categoria_id: str,
    payload: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
):
    return service.update(categoria_id, payload)

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(categoria_id: str, service: CategoriaService = Depends(get_categoria_service)):
    service.delete(categoria_id)
    return None

@router.get("/{categoria_id}/cursos", response_model=List[CursoOut])
def list_cursos_por_categoria(
    categoria_id: str, cc_service: CursoCategoriaService = Depends(get_cc_service)
):
    return cc_service.list_courses_of_category(categoria_id)
