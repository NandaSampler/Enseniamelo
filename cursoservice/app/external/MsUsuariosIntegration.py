# cursoservice/app/external/ms_usuarios_integration.py
"""
Integración con el microservicio de usuarios para obtener información de tutores.
"""
from __future__ import annotations
import httpx
from typing import Optional, Dict, Any
from app.core.logging import get_logger

logger = get_logger(__name__)


class MsUsuariosIntegration:
    """
    Cliente para comunicarse con el microservicio de usuarios.
    Permite obtener información de perfiles de tutores.
    """
    
    def __init__(self, base_url: str = "http://usuarios-service:8081"):
        """
        Inicializa el cliente de integración.
        
        Args:
            base_url: URL base del microservicio de usuarios (ej: http://usuarios-service:8081)
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = httpx.Timeout(10.0, connect=5.0)
    
    async def get_perfil_tutor_by_usuario(self, id_usuario: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Obtiene el perfil de tutor asociado a un usuario.
        
        Args:
            id_usuario: ID de MongoDB del usuario
            token: Token JWT para autenticación (opcional)
            
        Returns:
            Dict con los datos del perfil de tutor o None si no existe
            
        Raises:
            httpx.HTTPError: Si hay un error en la comunicación
        """
        url = f"{self.base_url}/v1/tutores/usuario/{id_usuario}"
        headers = {}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Consultando perfil de tutor para usuario: {id_usuario}")
                response = await client.get(url, headers=headers)
                
                if response.status_code == 404:
                    logger.warning(f"Usuario {id_usuario} no tiene perfil de tutor")
                    return None
                
                response.raise_for_status()
                data = response.json()
                logger.info(f"Perfil de tutor encontrado: {data.get('id')}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP al consultar perfil de tutor: {e.response.status_code}")
            if e.response.status_code == 404:
                return None
            raise
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con servicio de usuarios: {str(e)}")
            raise
    
    async def get_perfil_tutor_by_id(self, id_tutor: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Obtiene el perfil de tutor por su ID.
        
        Args:
            id_tutor: ID de MongoDB del perfil de tutor
            token: Token JWT para autenticación (opcional)
            
        Returns:
            Dict con los datos del perfil de tutor o None si no existe
        """
        url = f"{self.base_url}/v1/tutores/{id_tutor}"
        headers = {}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Consultando perfil de tutor con id: {id_tutor}")
                response = await client.get(url, headers=headers)
                
                if response.status_code == 404:
                    logger.warning(f"Perfil de tutor no encontrado: {id_tutor}")
                    return None
                
                response.raise_for_status()
                data = response.json()
                logger.info(f"Perfil de tutor encontrado: {id_tutor}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP al consultar perfil de tutor: {e.response.status_code}")
            if e.response.status_code == 404:
                return None
            raise
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con servicio de usuarios: {str(e)}")
            raise
    
    async def verify_tutor_exists(self, id_tutor: str, token: Optional[str] = None) -> bool:
        """
        Verifica si existe un perfil de tutor.
        
        Args:
            id_tutor: ID de MongoDB del perfil de tutor
            token: Token JWT para autenticación (opcional)
            
        Returns:
            True si el tutor existe, False en caso contrario
        """
        try:
            perfil = await self.get_perfil_tutor_by_id(id_tutor, token)
            return perfil is not None
        except Exception as e:
            logger.error(f"Error verificando existencia de tutor: {str(e)}")
            return False
    
    async def get_usuario_info(self, id_usuario: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Obtiene información básica de un usuario.
        
        Args:
            id_usuario: ID de MongoDB del usuario
            token: Token JWT para autenticación (opcional)
            
        Returns:
            Dict con los datos del usuario o None si no existe
        """
        url = f"{self.base_url}/v1/usuario/{id_usuario}"
        headers = {}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Consultando información de usuario: {id_usuario}")
                response = await client.get(url, headers=headers)
                
                if response.status_code == 404:
                    logger.warning(f"Usuario no encontrado: {id_usuario}")
                    return None
                
                response.raise_for_status()
                data = response.json()
                logger.info(f"Usuario encontrado: {id_usuario}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP al consultar usuario: {e.response.status_code}")
            if e.response.status_code == 404:
                return None
            raise
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con servicio de usuarios: {str(e)}")
            raise
    
    async def get_perfil_tutor_by_usuario(self, id_usuario: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Obtiene el perfil de tutor asociado a un ID de usuario.
        
        Args:
            id_usuario: ID del usuario (puede ser Keycloak ID o MongoDB ID)
            token: Token JWT para autenticación (opcional)
            
        Returns:
            Dict con los datos del perfil de tutor o None si no existe
        """
        url = f"{self.base_url}/v1/tutores/usuario/{id_usuario}"
        headers = {}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Consultando perfil de tutor para usuario: {id_usuario}")
                response = await client.get(url, headers=headers)
                
                if response.status_code == 404:
                    logger.warning(f"Usuario {id_usuario} no tiene perfil de tutor")
                    return None
                
                response.raise_for_status()
                data = response.json()
                logger.info(f"Perfil de tutor encontrado: {data.get('id')}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP al consultar perfil de tutor: {e.response.status_code}")
            if e.response.status_code == 404:
                return None
            raise
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con servicio de usuarios: {str(e)}")
            raise
    
    async def get_usuario_by_keycloak_id(self, keycloak_id: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Intenta obtener usuario por su Keycloak ID (podría ser el mismo que MongoDB ID).
        
        Args:
            keycloak_id: ID de Keycloak (sub del JWT)
            token: Token JWT para autenticación
            
        Returns:
            Dict con datos del usuario o None si no existe
        """
        # Primero intenta con el ID directo
        return await self.get_usuario_info(keycloak_id, token)
    
    async def get_usuario_from_jwt(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene el usuario usando el endpoint /auth/me que lee del JWT.
        
        Args:
            token: Token JWT
            
        Returns:
            Dict con datos del usuario o None si no existe
        """
        url = f"{self.base_url}/v1/auth/me"
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info("Consultando usuario desde JWT (/auth/me)")
                response = await client.get(url, headers=headers)
                
                if response.status_code == 404:
                    logger.warning("Usuario no encontrado desde JWT")
                    return None
                
                response.raise_for_status()
                data = response.json()
                logger.info(f"Usuario encontrado: {data.get('id')}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP al consultar usuario desde JWT: {e.response.status_code}")
            if e.response.status_code == 404:
                return None
            raise
        except httpx.RequestError as e:
            logger.error(f"Error de conexión: {str(e)}")
            raise


# Singleton para reutilizar en toda la app
_integration: Optional[MsUsuariosIntegration] = None


def get_usuarios_integration() -> MsUsuariosIntegration:
    """
    Obtiene la instancia singleton de la integración con usuarios.
    
    Returns:
        Instancia de MsUsuariosIntegration
    """
    global _integration
    if _integration is None:
        # Puedes obtener la URL desde config/env si lo prefieres
        import os
        base_url = os.getenv("USUARIOS_SERVICE_URL", "http://usuarios-service:8081")
        _integration = MsUsuariosIntegration(base_url)
    return _integration