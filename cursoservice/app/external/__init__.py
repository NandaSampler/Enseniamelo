# cursoservice/app/external/__init__.py
"""
Paquete de integraciones externas (clientes HTTP hacia otros microservicios).
"""

from __future__ import annotations

# ✅ Preferimos el nombre nuevo (snake_case)
try:
    from .ms_usuarios_integration import MsUsuariosIntegration, get_usuarios_integration
except ModuleNotFoundError:
    # ✅ Fallback por compatibilidad si aún existe el archivo viejo
    from .MsUsuariosIntegration import MsUsuariosIntegration, get_usuarios_integration  # type: ignore

__all__ = [
    "MsUsuariosIntegration",
    "get_usuarios_integration",
]
