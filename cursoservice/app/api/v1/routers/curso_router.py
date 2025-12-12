from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut
from app.schemas.categoria import CategoriaOut
from app.schemas.curso_categoria import CursoCategoriaLink
from app.services.curso_service import CursoService
from app.services.curso_categoria_service import CursoCategoriaService

router = APIRouter(prefix="/api/v1/cursos", tags=["Cursos"])

def get_curso_service() -> CursoService:
    return CursoService()

def get_curso_categoria_service() -> CursoCategoriaService:
    return CursoCategoriaService()

@router.get("/", response_model=List[CursoOut])
def list_cursos(
    q: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    id_tutor: Optional[str] = Query(None, description="Filtrar por tutor"),  # 👈 nombre alineado
    service: CursoService = Depends(get_curso_service),
):
    return service.list(q=q, id_tutor=id_tutor)
@router.get("/{curso_id}", response_model=CursoOut)
def get_curso(curso_id: str, service: CursoService = Depends(get_curso_service)):
    return service.get(curso_id)

@router.post("/", response_model=CursoOut, status_code=status.HTTP_201_CREATED)
def create_curso(payload: CursoCreate, service: CursoService = Depends(get_curso_service)):
    return service.create(payload)

@router.put("/{curso_id}", response_model=CursoOut)
def update_curso(
    curso_id: str,
    payload: CursoUpdate,
    service: CursoService = Depends(get_curso_service),
):
    return service.update(curso_id, payload)

@router.delete("/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_curso(curso_id: str, service: CursoService = Depends(get_curso_service)):
    service.delete(curso_id)
    return None

# ---- Relaciones curso-categoria ----

@router.post("/{curso_id}/categorias", response_model=CursoOut, status_code=status.HTTP_201_CREATED)
def add_categoria_to_curso(
    curso_id: str,
    link: CursoCategoriaLink,
    cc_service: CursoCategoriaService = Depends(get_curso_categoria_service),
    curso_service: CursoService = Depends(get_curso_service),
):
    cc_service.add(link)
    return curso_service.get(curso_id)

@router.get("/{curso_id}/categorias", response_model=List[CategoriaOut])
def list_categorias_de_curso(
    curso_id: str,
    cc_service: CursoCategoriaService = Depends(get_curso_categoria_service),
):
    return cc_service.list_categories_of_course(curso_id)

@router.delete("/{curso_id}/categorias/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_categoria_from_curso(
    curso_id: str,
    categoria_id: str,
    cc_service: CursoCategoriaService = Depends(get_curso_categoria_service),
):
    cc_service.remove(curso_id=curso_id, categoria_id=categoria_id)
    return None
