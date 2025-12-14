# cursoservice/app/core/auth_helper.py
"""
Helper para manejar autenticación y extracción de datos del JWT.
"""
from __future__ import annotations
from typing import Optional
import base64
import json
from app.core.logging import get_logger

logger = get_logger(__name__)


def extract_token_from_header(authorization: Optional[str]) -> Optional[str]:
    """
    Extrae el token JWT del header Authorization.
    
    Args:
        authorization: Header Authorization (formato: "Bearer <token>")
        
    Returns:
        Token JWT o None si no está presente o es inválido
    """
    if not authorization:
        return None
    
    if not authorization.startswith("Bearer "):
        logger.warning("Authorization header no tiene formato Bearer")
        return None
    
    return authorization.split(" ", 1)[1]


def decode_jwt_payload(token: str) -> Optional[dict]:
    """
    Decodifica el payload de un JWT sin verificar la firma.
    ADVERTENCIA: Solo usar para extraer información, NO para validar.
    
    Args:
        token: Token JWT
        
    Returns:
        Dict con el payload del JWT o None si hay error
    """
    try:
        # JWT tiene formato: header.payload.signature
        parts = token.split(".")
        if len(parts) != 3:
            logger.warning("JWT no tiene formato válido")
            return None
        
        payload_b64 = parts[1]
        # Agregar padding si es necesario
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes)
        return payload
        
    except Exception as e:
        logger.error(f"Error decodificando JWT: {str(e)}")
        return None


def extract_user_id_from_token(token: str) -> Optional[str]:
    """
    Extrae el ID de usuario del token JWT.
    
    Args:
        token: Token JWT
        
    Returns:
        ID de usuario o None si no se encuentra
    """
    payload = decode_jwt_payload(token)
    if not payload:
        return None
    
    # Keycloak usa "sub" para el subject (user ID)
    user_id = payload.get("sub")
    if user_id:
        return user_id
    
    # Fallback: buscar en custom claims
    return payload.get("user_id") or payload.get("userId")


def extract_user_role_from_token(token: str) -> Optional[str]:
    """
    Extrae el rol del usuario del token JWT.
    
    Args:
        token: Token JWT
        
    Returns:
        Rol del usuario o None si no se encuentra
    """
    payload = decode_jwt_payload(token)
    if not payload:
        return None
    
    # Keycloak guarda roles en realm_access.roles
    realm_access = payload.get("realm_access", {})
    roles = realm_access.get("roles", [])
    
    # Priorizar roles de negocio
    for role in ["ADMIN", "TUTOR", "USER"]:
        if role in roles:
            return role
    
    # Devolver el primer rol si existe
    return roles[0] if roles else None


def get_user_info_from_token(token: str) -> dict:
    """
    Extrae información útil del usuario desde el token JWT.
    
    Args:
        token: Token JWT
        
    Returns:
        Dict con información del usuario
    """
    payload = decode_jwt_payload(token)
    if not payload:
        return {}
    
    return {
        "user_id": extract_user_id_from_token(token),
        "email": payload.get("email"),
        "name": payload.get("name") or payload.get("preferred_username"),
        "role": extract_user_role_from_token(token),
        "email_verified": payload.get("email_verified", False),
    }