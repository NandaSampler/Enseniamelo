# cursoservice/app/services/curso_service.py
from __future__ import annotations
from typing import List, Optional

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut

# Repos con getters (NO singletons a nivel de módulo)
from app.repositories.curso_repository import CursoRepository, get_curso_repo
from app.repositories.horario_repository import HorarioRepository, get_horario_repo
from app.repositories.reserva_repository import ReservaRepository, get_reserva_repo
from app.repositories.curso_categoria_repository import (
    CursoCategoriaRepository, get_curso_categoria_repo
)

# Integración con microservicio de usuarios
from app.external.MsUsuariosIntegration import get_usuarios_integration
from app.core.logging import get_logger

logger = get_logger(__name__)


class CursoService:
    """Reglas de negocio para Curso (Mongo)."""

    def __init__(self,
                 repo: Optional[CursoRepository] = None,
                 horario_repo: Optional[HorarioRepository] = None,
                 reserva_repo: Optional[ReservaRepository] = None,
                 curso_categoria_repo: Optional[CursoCategoriaRepository] = None) -> None:
        self.repo = repo or get_curso_repo()
        self.horario_repo = horario_repo or get_horario_repo()
        self.reserva_repo = reserva_repo or get_reserva_repo()
        self.curso_categoria_repo = curso_categoria_repo or get_curso_categoria_repo()
        self.usuarios_integration = get_usuarios_integration()

    # Query
    def list(self, q: Optional[str] = None, id_tutor: Optional[str] = None) -> List[CursoOut]:
        return self.repo.list(q=q, id_tutor=id_tutor)

    def get(self, curso_id: str) -> CursoOut:
        try:
            return self.repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

    # Commands
    async def create(self, payload: CursoCreate, token: Optional[str] = None) -> CursoOut:
        """
        Crea un nuevo curso validando que el tutor existe en el servicio de usuarios.
        
        Args:
            payload: Datos del curso a crear
            token: Token JWT para autenticación con el servicio de usuarios
            
        Returns:
            CursoOut: Curso creado
            
        Raises:
            ValueError: Si el tutor no existe o no está verificado
        """
        logger.info(f"Validando tutor {payload.id_tutor} antes de crear curso")
        
        try:
            # Validar que el tutor existe en el servicio de usuarios
            perfil_tutor = await self.usuarios_integration.get_perfil_tutor_by_id(
                payload.id_tutor, 
                token
            )
            
            if perfil_tutor is None:
                logger.error(f"Tutor no encontrado: {payload.id_tutor}")
                raise ValueError(f"El tutor con id {payload.id_tutor} no existe")
            
            # Validar que el tutor está verificado (opcional, según tu lógica de negocio)
            if not perfil_tutor.get("verificado"):
                logger.warning(f"Tutor no verificado: {payload.id_tutor}")
                # Puedes decidir si permitir o no cursos de tutores no verificados
                # raise ValueError(f"El tutor con id {payload.id_tutor} no está verificado")
            
            logger.info(f"Tutor validado exitosamente: {perfil_tutor.get('id')}")
            
        except ValueError:
            # Re-lanzar los errores de validación
            raise
        except Exception as e:
            logger.error(f"Error al validar tutor: {str(e)}")
            raise ValueError(f"No se pudo validar el tutor: {str(e)}")
        
        # Si la validación pasó, crear el curso
        return self.repo.create(payload)

    async def update(self, curso_id: str, payload: CursoUpdate, token: Optional[str] = None) -> CursoOut:
        """
        Actualiza un curso validando el tutor si se cambió.
        
        Args:
            curso_id: ID del curso a actualizar
            payload: Datos a actualizar
            token: Token JWT para autenticación
            
        Returns:
            CursoOut: Curso actualizado
        """
        # Si se está cambiando el tutor, validarlo
        if payload.id_tutor is not None:
            logger.info(f"Validando nuevo tutor {payload.id_tutor} para curso {curso_id}")
            
            try:
                perfil_tutor = await self.usuarios_integration.get_perfil_tutor_by_id(
                    payload.id_tutor, 
                    token
                )
                
                if perfil_tutor is None:
                    logger.error(f"Tutor no encontrado: {payload.id_tutor}")
                    raise ValueError(f"El tutor con id {payload.id_tutor} no existe")
                
                logger.info(f"Nuevo tutor validado exitosamente: {perfil_tutor.get('id')}")
                
            except ValueError:
                raise
            except Exception as e:
                logger.error(f"Error al validar tutor: {str(e)}")
                raise ValueError(f"No se pudo validar el tutor: {str(e)}")
        
        try:
            return self.repo.update(curso_id, payload)
        except KeyError:
            raise KeyError("curso no encontrado")
        except ValueError as e:
            raise ValueError(str(e))

    def delete(self, curso_id: str) -> None:
        # Reglas: no permitir borrar si hay dependencias
        if self.horario_repo.list(curso_id=curso_id):
            raise ValueError("no se puede eliminar: curso tiene horarios")
        if self.reserva_repo.list(curso_id=curso_id):
            raise ValueError("no se puede eliminar: curso tiene reservas")
        if self.curso_categoria_repo.list_category_ids_of_course(curso_id):
            raise ValueError("no se puede eliminar: curso tiene categorías vinculadas")

        try:
            self.repo.delete(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")
    
    async def get_curso_with_tutor_info(self, curso_id: str, token: Optional[str] = None) -> dict:
        """
        Obtiene un curso con información enriquecida del tutor.
        
        Args:
            curso_id: ID del curso
            token: Token JWT para autenticación
            
        Returns:
            Dict con datos del curso e información del tutor
        """
        curso = self.get(curso_id)
        curso_dict = curso.model_dump()
        
        try:
            # Obtener información del tutor desde el servicio de usuarios
            perfil_tutor = await self.usuarios_integration.get_perfil_tutor_by_id(
                curso.id_tutor,
                token
            )
            
            if perfil_tutor:
                curso_dict["tutor_info"] = {
                    "id": perfil_tutor.get("id"),
                    "nombre_completo": perfil_tutor.get("nombreCompleto"),
                    "email": perfil_tutor.get("email"),
                    "verificado": perfil_tutor.get("verificado"),
                    "clasificacion": perfil_tutor.get("clasificacion"),
                    "biografia": perfil_tutor.get("biografia"),
                }
            else:
                curso_dict["tutor_info"] = None
                logger.warning(f"No se encontró información del tutor {curso.id_tutor}")
                
        except Exception as e:
            logger.error(f"Error obteniendo información del tutor: {str(e)}")
            curso_dict["tutor_info"] = None
        
        return curso_dict