"""
Router para operaciones del tutor autenticado (mis cursos).
Basado en patrón payments-service:
- Resolver tutor desde JWT con /v1/auth/me -> /v1/tutores/usuario/{mongo_user_id}
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from app.core.course_quota_guard import enforce_course_quota

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut
from app.services.curso_service import CursoService
from app.external.ms_usuarios_integration import get_usuarios_integration
from app.core.auth_helper import extract_token_from_header
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1/tutor", tags=["Tutor - Mis Cursos"])


class CursoCreateSimple(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    modalidad: str
    portada_url: Optional[str] = None
    galeria_urls: Optional[List[str]] = None
    fotos: Optional[List[str]] = None
    necesita_reserva: bool = False
    precio_reserva: Optional[float] = None
    tiene_cupo: bool = True
    cupo: Optional[int] = None
    cupo_ocupado: int = 0
    estado: str = "activo"
    activo: bool = True
    categorias: List[str] = []
    tags: List[str] = []
    verificacion_estado: str = "pendiente"


def get_curso_service() -> CursoService:
    return CursoService()


async def get_current_tutor_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")

    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    usuarios = get_usuarios_integration()
    try:
        tutor_id = await usuarios.resolve_tutor_id_from_token(token)
        return tutor_id
    except ValueError as e:
        # negocio: no tiene perfil tutor / respuesta inválida
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        logger.exception("Error resolviendo tutor desde JWT: %s", str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error validando tutor")


@router.get("/mis-cursos", response_model=List[CursoOut])
async def get_my_courses(
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service),
):
    return service.list(id_tutor=tutor_id)


@router.post("/mis-cursos", response_model=CursoOut, status_code=status.HTTP_201_CREATED)
async def create_my_course(
    payload: CursoCreateSimple,
    _quota: None = Depends(enforce_course_quota),
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service),
    authorization: Optional[str] = Header(None),
):
    token = extract_token_from_header(authorization)
    curso_data = CursoCreate(id_tutor=tutor_id, **payload.model_dump())
    return await service.create(curso_data, token)


@router.get("/mis-cursos/{curso_id}", response_model=CursoOut)
async def get_my_course(
    curso_id: str,
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service),
):
    curso = service.get(curso_id)
    if curso.id_tutor != tutor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para este curso")
    return curso


@router.put("/mis-cursos/{curso_id}", response_model=CursoOut)
async def update_my_course(
    curso_id: str,
    payload: CursoUpdate,
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service),
    authorization: Optional[str] = Header(None),
):
    curso = service.get(curso_id)
    if curso.id_tutor != tutor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para modificar este curso")

    if payload.id_tutor is not None and payload.id_tutor != tutor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes cambiar el tutor del curso")

    token = extract_token_from_header(authorization)
    return await service.update(curso_id, payload, token)


@router.delete("/mis-cursos/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_course(
    curso_id: str,
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service),
):
    curso = service.get(curso_id)
    if curso.id_tutor != tutor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para eliminar este curso")

    service.delete(curso_id)
    return None


@router.get("/perfil")
async def get_my_profile(
    tutor_id: str = Depends(get_current_tutor_id),
    authorization: Optional[str] = Header(None),
):
    token = extract_token_from_header(authorization)
    usuarios = get_usuarios_integration()
    try:
        return await usuarios.get_perfil_tutor_by_id(tutor_id, token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error obteniendo perfil de tutor")
