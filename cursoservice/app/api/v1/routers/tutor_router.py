# cursoservice/app/api/v1/routers/tutor_router.py
"""
Router específico para operaciones de tutores con sus cursos.
Permite que un tutor autenticado gestione sus propios cursos.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut
from app.services.curso_service import CursoService
from app.external.MsUsuariosIntegration import get_usuarios_integration
from app.core.auth_helper import extract_token_from_header, extract_user_id_from_token
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1/tutor", tags=["Tutor - Mis Cursos"])


class CursoCreateSimple(BaseModel):
    """Schema simplificado para crear curso (sin necesidad de especificar id_tutor)"""
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
    """
    Dependency que extrae el ID del tutor desde el token JWT.
    
    Raises:
        HTTPException: Si no hay token o el usuario no es tutor
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido"
        )
    
    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    # Extraer user_id del token (sub de Keycloak)
    user_id = extract_user_id_from_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo extraer ID de usuario del token"
        )
    
    # Obtener información del usuario desde el servicio de usuarios
    try:
        usuarios_integration = get_usuarios_integration()
        
        logger.info(f"Buscando perfil de tutor para usuario con sub: {user_id}")
        
        # MÉTODO 1: Usar el endpoint /auth/me que lee directamente del JWT
        try:
            usuario = await usuarios_integration.get_usuario_from_jwt(token)
            
            if usuario:
                mongo_user_id = usuario.get("id")
                logger.info(f"Usuario encontrado en MongoDB: {mongo_user_id}")
                
                # Buscar el perfil de tutor con el ID de MongoDB
                perfil_tutor = await usuarios_integration.get_perfil_tutor_by_usuario(mongo_user_id, token)
                
                if perfil_tutor:
                    tutor_id = perfil_tutor.get("id")
                    logger.info(f"Perfil de tutor encontrado: {tutor_id}")
                    return tutor_id
                else:
                    logger.warning(f"Usuario {mongo_user_id} no tiene perfil de tutor")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="El usuario no tiene perfil de tutor. Debe solicitar verificación como tutor."
                    )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error usando /auth/me: {str(e)}")
        
        # MÉTODO 2: Fallback - Buscar directamente con el sub de Keycloak
        try:
            perfil_tutor = await usuarios_integration.get_perfil_tutor_by_usuario(user_id, token)
            
            if perfil_tutor:
                tutor_id = perfil_tutor.get("id")
                logger.info(f"Perfil de tutor encontrado (fallback): {tutor_id}")
                return tutor_id
        except Exception as e:
            logger.warning(f"Error en fallback: {str(e)}")
        
        # Si llegamos aquí, el usuario no tiene perfil de tutor
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no tiene perfil de tutor. Debe solicitar verificación como tutor."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo perfil de tutor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validando perfil de tutor: {str(e)}"
        )


@router.get("/mis-cursos", response_model=List[CursoOut])
async def get_my_courses(
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service)
):
    """
    Obtiene todos los cursos del tutor autenticado.
    """
    logger.info(f"Obteniendo cursos del tutor: {tutor_id}")
    return service.list(id_tutor=tutor_id)


@router.post("/mis-cursos", response_model=CursoOut, status_code=status.HTTP_201_CREATED)
async def create_my_course(
    payload: CursoCreateSimple,
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service),
    authorization: Optional[str] = Header(None)
):
    """
    Crea un nuevo curso para el tutor autenticado.
    No es necesario especificar id_tutor, se toma del token JWT.
    """
    logger.info(f"Tutor {tutor_id} creando nuevo curso: {payload.nombre}")
    
    # Construir el payload completo con el id_tutor del usuario autenticado
    curso_data = CursoCreate(
        id_tutor=tutor_id,
        **payload.model_dump()
    )
    
    token = extract_token_from_header(authorization)
    return await service.create(curso_data, token)


@router.get("/mis-cursos/{curso_id}", response_model=CursoOut)
async def get_my_course(
    curso_id: str,
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service)
):
    """
    Obtiene un curso específico del tutor autenticado.
    Solo permite acceder a cursos propios.
    """
    curso = service.get(curso_id)
    
    # Verificar que el curso pertenece al tutor autenticado
    if curso.id_tutor != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este curso"
        )
    
    return curso


@router.put("/mis-cursos/{curso_id}", response_model=CursoOut)
async def update_my_course(
    curso_id: str,
    payload: CursoUpdate,
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service),
    authorization: Optional[str] = Header(None)
):
    """
    Actualiza un curso del tutor autenticado.
    Solo permite actualizar cursos propios.
    """
    # Verificar que el curso existe y pertenece al tutor
    curso = service.get(curso_id)
    if curso.id_tutor != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este curso"
        )
    
    # No permitir cambiar el tutor
    if payload.id_tutor is not None and payload.id_tutor != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes cambiar el tutor de un curso"
        )
    
    logger.info(f"Tutor {tutor_id} actualizando curso {curso_id}")
    token = extract_token_from_header(authorization)
    return await service.update(curso_id, payload, token)


@router.delete("/mis-cursos/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_course(
    curso_id: str,
    tutor_id: str = Depends(get_current_tutor_id),
    service: CursoService = Depends(get_curso_service)
):
    """
    Elimina un curso del tutor autenticado.
    Solo permite eliminar cursos propios.
    """
    # Verificar que el curso existe y pertenece al tutor
    curso = service.get(curso_id)
    if curso.id_tutor != tutor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este curso"
        )
    
    logger.info(f"Tutor {tutor_id} eliminando curso {curso_id}")
    service.delete(curso_id)
    return None


@router.get("/perfil")
async def get_my_profile(
    tutor_id: str = Depends(get_current_tutor_id),
    authorization: Optional[str] = Header(None)
):
    """
    Obtiene el perfil del tutor autenticado desde el servicio de usuarios.
    """
    token = extract_token_from_header(authorization)
    usuarios_integration = get_usuarios_integration()
    
    try:
        perfil = await usuarios_integration.get_perfil_tutor_by_id(tutor_id, token)
        return perfil
    except Exception as e:
        logger.error(f"Error obteniendo perfil de tutor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo perfil de tutor"
        )