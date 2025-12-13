# cursoservice/app/external/__init__.py
"""Integraciones con otros microservicios"""
from .MsUsuariosIntegration import MsUsuariosIntegration, get_usuarios_integration

__all__ = ["MsUsuariosIntegration", "get_usuarios_integration"]