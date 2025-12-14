# cursoservice/app/services/curso_service.py
from __future__ import annotations

from typing import List, Optional

import httpx

from app.schemas.curso import CursoCreate, CursoUpdate, CursoOut

from app.repositories.curso_repository import CursoRepository, get_curso_repo
from app.repositories.horario_repository import HorarioRepository, get_horario_repo
from app.repositories.reserva_repository import ReservaRepository, get_reserva_repo
from app.repositories.curso_categoria_repository import (
    CursoCategoriaRepository,
    get_curso_categoria_repo,
)

from app.external.ms_usuarios_integration import get_usuarios_integration, MsUsuariosIntegration
from app.core.logging import get_logger

logger = get_logger(__name__)


def _safe_json(resp: Optional[httpx.Response]) -> str:
    if resp is None:
        return ""
    try:
        return str(resp.json())
    except Exception:
        return (resp.text or "").strip()[:800]


class CursoService:
    """Reglas de negocio para Curso (Mongo)."""

    def __init__(
        self,
        repo: Optional[CursoRepository] = None,
        horario_repo: Optional[HorarioRepository] = None,
        reserva_repo: Optional[ReservaRepository] = None,
        curso_categoria_repo: Optional[CursoCategoriaRepository] = None,
    ) -> None:
        self.repo = repo or get_curso_repo()
        self.horario_repo = horario_repo or get_horario_repo()
        self.reserva_repo = reserva_repo or get_reserva_repo()
        self.curso_categoria_repo = curso_categoria_repo or get_curso_categoria_repo()
        self.usuarios_integration = get_usuarios_integration()

    # -----------------------
    # Query
    # -----------------------
    def list(self, q: Optional[str] = None, id_tutor: Optional[str] = None) -> List[CursoOut]:
        return self.repo.list(q=q, id_tutor=id_tutor)

    def get(self, curso_id: str) -> CursoOut:
        try:
            return self.repo.get(curso_id)
        except KeyError:
            raise KeyError("curso no encontrado")

    # -----------------------
    # Commands
    # -----------------------
    async def create(self, payload: CursoCreate, token: Optional[str] = None) -> CursoOut:
        """
        Crea un curso y luego crea automáticamente su solicitud de verificación.

        Flujo:
        1) Resolver id_tutor desde JWT
        2) Validar tutor
        3) Crear curso en Mongo
        4) Crear solicitud de verificación en usuarios-service
        """

        # 1) Resolver id_tutor si falta
        id_tutor = payload.id_tutor
        if not id_tutor:
            if not token:
                raise ValueError("Falta Authorization Bearer token para resolver el tutor.")

            try:
                id_tutor = await self.usuarios_integration.resolve_tutor_id_from_token(token)

            except ValueError:
                raise

            except httpx.HTTPStatusError as e:
                msg = MsUsuariosIntegration.debug_http_error(e)
                logger.error("Error resolviendo tutor desde JWT | %s", msg)
                raise ValueError(msg)

            except httpx.RequestError as e:
                logger.error(
                    "usuarios-service no disponible resolviendo tutor | base_url=%s err=%s",
                    getattr(self.usuarios_integration, "base_url", None),
                    str(e),
                )
                raise ValueError("usuarios-service no disponible (RequestError)")

            except Exception as e:
                logger.exception("Error inesperado resolviendo tutor desde JWT: %s", str(e))
                raise ValueError("Error inesperado resolviendo tutor desde JWT")

        # 2) Validar tutor por id
        try:
            perfil_val = await self.usuarios_integration.get_perfil_tutor_by_id(id_tutor, token)

        except httpx.HTTPStatusError as e:
            msg = MsUsuariosIntegration.debug_http_error(e)
            logger.error("Error validando tutor por id | %s", msg)
            raise ValueError(msg)

        except httpx.RequestError as e:
            logger.error(
                "usuarios-service no disponible validando tutor | base_url=%s err=%s",
                getattr(self.usuarios_integration, "base_url", None),
                str(e),
            )
            raise ValueError("usuarios-service no disponible (RequestError)")

        except Exception as e:
            logger.exception("Error inesperado validando tutor por id: %s", str(e))
            raise ValueError("Error inesperado validando tutor por id")

        if perfil_val is None:
            raise ValueError(f"El tutor con id {id_tutor} no existe.")

        # Obtener id_usuario desde perfil de tutor
        id_usuario = perfil_val.get("idUsuario")
        if not id_usuario:
            raise ValueError("No se pudo obtener idUsuario del perfil de tutor")

        # 3) Crear curso
        payload_db = payload.model_copy(update={"id_tutor": id_tutor})
        try:
            curso_creado = self.repo.create(payload_db)
        except Exception as e:
            logger.exception("Error creando curso en repo: %s", str(e))
            raise ValueError("Error interno creando el curso.")
        try:
            await self._crear_solicitud_verificacion(
                curso_id=curso_creado.id,
                id_usuario=id_usuario,
                id_tutor=id_tutor,
                foto_ci=payload.portada_url or "",  
                archivos=payload.galeria_urls or payload.fotos or [],
                token=token
            )
            logger.info("Solicitud de verificación creada para curso: %s", curso_creado.id)
        except Exception as e:
            logger.error("Error creando solicitud de verificación para curso %s: %s", curso_creado.id, str(e))

        return curso_creado

    async def _crear_solicitud_verificacion(
        self,
        curso_id: str,
        id_usuario: str,
        id_tutor: str,
        foto_ci: str,
        archivos: List[str],
        token: Optional[str] = None
    ) -> None:
        solicitud_data = {
            "idUsuario": id_usuario,
            "idPerfilTutor": id_tutor,
            "idCurso": curso_id,
            "fotoCi": foto_ci,
            "archivos": archivos
        }

        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
            response = await client.post(
                f"{self.usuarios_integration.base_url}/v1/verificacion/curso",
                json=solicitud_data,
                headers=headers
            )
            response.raise_for_status()
            logger.info("Solicitud de verificación creada: %s", response.json())

    async def update(self, curso_id: str, payload: CursoUpdate, token: Optional[str] = None) -> CursoOut:
        if payload.id_tutor is not None:
            logger.info("Validando nuevo tutor %s para curso %s", payload.id_tutor, curso_id)

            try:
                perfil_tutor = await self.usuarios_integration.get_perfil_tutor_by_id(payload.id_tutor, token)

            except httpx.HTTPStatusError as e:
                msg = MsUsuariosIntegration.debug_http_error(e)
                logger.error("Error validando tutor en update | %s", msg)
                raise ValueError(msg)

            except httpx.RequestError as e:
                logger.error(
                    "usuarios-service no disponible en update | base_url=%s err=%s",
                    getattr(self.usuarios_integration, "base_url", None),
                    str(e),
                )
                raise ValueError("usuarios-service no disponible (RequestError)")

            if perfil_tutor is None:
                raise ValueError(f"El tutor con id {payload.id_tutor} no existe.")

        try:
            return self.repo.update(curso_id, payload)
        except KeyError:
            raise KeyError("curso no encontrado")
        except ValueError as e:
            raise ValueError(str(e))

    def delete(self, curso_id: str) -> None:
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
        curso = self.get(curso_id)
        curso_dict = curso.model_dump()

        try:
            perfil_tutor = await self.usuarios_integration.get_perfil_tutor_by_id(curso.id_tutor, token)
            if perfil_tutor:
                curso_dict["tutor_info"] = {
                    "id": perfil_tutor.get("_id") or perfil_tutor.get("id"),
                    "nombre_completo": perfil_tutor.get("nombreCompleto"),
                    "email": perfil_tutor.get("email"),
                    "verificado": perfil_tutor.get("verificado"),
                    "clasificacion": perfil_tutor.get("clasificacion"),
                    "biografia": perfil_tutor.get("biografia"),
                }
            else:
                curso_dict["tutor_info"] = None
        except Exception as e:
            logger.error("Error obteniendo información del tutor: %s", str(e))
            curso_dict["tutor_info"] = None

        return curso_dict