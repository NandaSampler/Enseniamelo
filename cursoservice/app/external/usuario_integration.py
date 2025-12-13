from __future__ import annotations
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class UsuarioIntegration:
    
    def __init__(self):
        self.base_url = self._get_service_url()
        self.timeout = 10.0
    
    def _get_service_url(self) -> str:
        return "http://gateway:8443/usuarios-service"
    
    async def get_usuario(self, id_usuario: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v1/usuario/{id_usuario}"
        logger.debug(f"Consultando usuario en URL: {url}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Usuario {id_usuario} encontrado")
                    return data
                elif response.status_code == 404:
                    logger.warning(f"Usuario {id_usuario} no encontrado")
                    return None
                else:
                    logger.error(
                        f"Error al consultar usuario: {response.status_code} - {response.text}"
                    )
                    return None
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout al consultar usuario {id_usuario}")
            return None
        except Exception as e:
            logger.error(f"Error inesperado al consultar usuario {id_usuario}: {e}")
            return None
    
    async def get_tutor(self, id_tutor: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v1/tutores/{id_tutor}"
        logger.debug(f"Consultando tutor en URL: {url}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Tutor {id_tutor} encontrado")
                    return data
                elif response.status_code == 404:
                    logger.warning(f"Tutor {id_tutor} no encontrado")
                    return None
                else:
                    logger.error(
                        f"Error al consultar tutor: {response.status_code} - {response.text}"
                    )
                    return None
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout al consultar tutor {id_tutor}")
            return None
        except Exception as e:
            logger.error(f"Error inesperado al consultar tutor {id_tutor}: {e}")
            return None
    
    async def get_tutor_por_usuario(self, id_usuario: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/v1/tutores/usuario/{id_usuario}"
        logger.debug(f"Consultando perfil de tutor para usuario {id_usuario}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Perfil de tutor encontrado para usuario {id_usuario}")
                    return data
                elif response.status_code == 404:
                    logger.warning(f"Usuario {id_usuario} no tiene perfil de tutor")
                    return None
                else:
                    logger.error(
                        f"Error al consultar perfil: {response.status_code} - {response.text}"
                    )
                    return None
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout al consultar perfil de tutor")
            return None
        except Exception as e:
            logger.error(f"Error inesperado: {e}")
            return None
    
    async def verificar_tutor_existe(self, id_tutor: str) -> bool:
        tutor = await self.get_tutor(id_tutor)
        return tutor is not None
    
    async def verificar_tutor_verificado(self, id_tutor: str) -> bool:
        tutor = await self.get_tutor(id_tutor)
        if tutor is None:
            return False
        return tutor.get("verificado", False) is True



_integration: Optional[UsuarioIntegration] = None


def get_usuario_integration() -> UsuarioIntegration:
    global _integration
    if _integration is None:
        _integration = UsuarioIntegration()
    return _integration