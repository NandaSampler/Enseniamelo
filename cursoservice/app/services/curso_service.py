from __future__ import annotations
from typing import List, Optional

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut
from app.repositories.curso_repository import CursoRepository, get_curso_repo
from app.repositories.horario_repository import HorarioRepository, get_horario_repo
from app.repositories.reserva_repository import ReservaRepository, get_reserva_repo
from app.repositories.curso_categoria_repository import (
    CursoCategoriaRepository, get_curso_categoria_repo
)
from app.external.usuario_integration import UsuarioIntegration, get_usuario_integration


class CursoService:
    """Reglas de negocio para Curso (Mongo)."""

    def __init__(self,
                 repo: Optional[CursoRepository] = None,
                 horario_repo: Optional[HorarioRepository] = None,
                 reserva_repo: Optional[ReservaRepository] = None,
                 curso_categoria_repo: Optional[CursoCategoriaRepository] = None,
                 usuario_integration: Optional[UsuarioIntegration] = None) -> None:
        self.repo = repo or get_curso_repo()
        self.horario_repo = horario_repo or get_horario_repo()
        self.reserva_repo = reserva_repo or get_reserva_repo()
        self.curso_categoria_repo = curso_categoria_repo or get_curso_categoria_repo()
        self.usuario_integration = usuario_integration or get_usuario_integration()

    # Query
    def list(self, q: Optional[str] = None, id_tutor: Optional[str] = None) -> List[CursoOut]:
        return self.repo.list(q=q, id_tutor=id_tutor)

    def get(self, curso_id: str) -> CursoOut:
        try:
            return self.repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

    # Commands
    async def create(self, payload: CursoCreate) -> CursoOut:
        id_tutor = payload.id_tutor
        if id_tutor:
            tutor_existe = await self.usuario_integration.verificar_tutor_existe(id_tutor)
            if not tutor_existe:
                raise ValueError(f"El tutor con id {id_tutor} no existe")
            
            # Opcional: validar que esté verificado
            tutor_verificado = await self.usuario_integration.verificar_tutor_verificado(id_tutor)
            if not tutor_verificado:
                raise ValueError(f"El tutor con id {id_tutor} no está verificado")
        
        return self.repo.create(payload)

    async def update(self, curso_id: str, payload: CursoUpdate) -> CursoOut:
        if payload.id_tutor is not None:
            tutor_existe = await self.usuario_integration.verificar_tutor_existe(payload.id_tutor)
            if not tutor_existe:
                raise ValueError(f"El tutor con id {payload.id_tutor} no existe")
            
            tutor_verificado = await self.usuario_integration.verificar_tutor_verificado(payload.id_tutor)
            if not tutor_verificado:
                raise ValueError(f"El tutor con id {payload.id_tutor} no está verificado")
        
        try:
            return self.repo.update(curso_id, payload)
        except KeyError:
            raise KeyError("curso no encontrado")
        except ValueError as e:
            raise ValueError(str(e))

    def delete(self, curso_id: str) -> None:
        if self.horario_repo.list(id_curso=curso_id):
            raise ValueError("no se puede eliminar: curso tiene horarios")
        if self.reserva_repo.list(id_curso=curso_id):
            raise ValueError("no se puede eliminar: curso tiene reservas")
        if self.curso_categoria_repo.list_category_ids_of_course(curso_id):
            raise ValueError("no se puede eliminar: curso tiene categorías vinculadas")

        try:
            self.repo.delete(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")
    
    async def enriquecer_con_datos_tutor(self, curso: CursoOut) -> dict:
        curso_dict = curso.model_dump()
        
        if curso.id_tutor:
            tutor = await self.usuario_integration.get_tutor(curso.id_tutor)
            if tutor:
                curso_dict["tutor"] = {
                    "id": tutor.get("id"),
                    "nombreCompleto": tutor.get("nombreCompleto"),
                    "email": tutor.get("email"),
                    "telefono": tutor.get("telefono"),
                    "verificado": tutor.get("verificado"),
                    "clasificacion": tutor.get("clasificacion"),
                    "biografia": tutor.get("biografia"),
                }
        
        return curso_dict