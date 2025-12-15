# cursoservice/app/api/v1/routers/curso_router.py
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status, Header, HTTPException
from pydantic import BaseModel

from app.schemas.curso import CursoCreate, CursoCreateIn, CursoUpdate, CursoOut
from app.schemas.categoria import CategoriaOut
from app.schemas.curso_categoria import CursoCategoriaLink
from app.services.curso_service import CursoService
from app.services.curso_categoria_service import CursoCategoriaService
from app.core.auth_helper import extract_token_from_header
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/cursos", tags=["Cursos"])


def get_curso_service() -> CursoService:
    return CursoService()


def get_curso_categoria_service() -> CursoCategoriaService:
    return CursoCategoriaService()


@router.get("/", response_model=List[CursoOut])
def list_cursos(
    q: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    tutor_id: Optional[str] = Query(None, description="Filtrar por tutor"),
    service: CursoService = Depends(get_curso_service),
):
    return service.list(q=q, id_tutor=tutor_id)


@router.get("/{curso_id}", response_model=CursoOut)
def get_curso(curso_id: str, service: CursoService = Depends(get_curso_service)):
    """
    Obtiene un curso por su ID.
    Este endpoint es usado por usuarios-service para obtener información del curso.
    """
    try:
        return service.get(curso_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="curso no encontrado")


@router.post("/", response_model=CursoOut, status_code=status.HTTP_201_CREATED)
async def create_curso(
    payload: CursoCreateIn,
    service: CursoService = Depends(get_curso_service),
    authorization: Optional[str] = Header(None),
):
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization Bearer token")

    try:
        # front -> schema interno
        payload_full = CursoCreate(**payload.model_dump())
        return await service.create(payload_full, token)

    except ValueError as e:
        # ✅ aquí devolvemos el mensaje REAL (status/url/body)
        logger.warning("create_curso ValueError: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.exception("create_curso unexpected error: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/{curso_id}", response_model=CursoOut)
async def update_curso(
    curso_id: str,
    payload: CursoUpdate,
    service: CursoService = Depends(get_curso_service),
    authorization: Optional[str] = Header(None),
):
    token = extract_token_from_header(authorization)
    try:
        return await service.update(curso_id, payload, token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError:
        raise HTTPException(status_code=404, detail="curso no encontrado")
    except Exception as e:
        logger.exception("update_curso unexpected error: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")


class CursoVerificacionUpdate(BaseModel):
    estadoVerificacion: str 


@router.put("/{curso_id}/verificacion", status_code=status.HTTP_204_NO_CONTENT)
async def update_verificacion_estado(
    curso_id: str,
    payload: CursoVerificacionUpdate,
    service: CursoService = Depends(get_curso_service),
):

    try:
        estado_map = {
            "APROBADO": "aceptado",
            "RECHAZADO": "rechazado",
            "aceptado": "aceptado",
            "rechazado": "rechazado",
        }
        
        nuevo_estado = estado_map.get(payload.estadoVerificacion)
        if not nuevo_estado:
            raise HTTPException(
                status_code=400, 
                detail=f"Estado de verificación inválido: {payload.estadoVerificacion}"
            )
        
        update_payload = CursoUpdate(verificacion_estado=nuevo_estado)
        await service.update(curso_id, update_payload, token=None)
        
        logger.info(
            "Estado de verificación actualizado para curso %s: %s", 
            curso_id, 
            nuevo_estado
        )
        return None
        
    except KeyError:
        raise HTTPException(status_code=404, detail="curso no encontrado")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error actualizando verificación del curso %s: %s", curso_id, str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.delete("/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_curso(curso_id: str, service: CursoService = Depends(get_curso_service)):
    try:
        service.delete(curso_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError:
        raise HTTPException(status_code=404, detail="curso no encontrado")


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