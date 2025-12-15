from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from app.schemas.horario import HorarioCreate
from app.schemas.reserva import ReservaCreate, ReservaOut, ReservaUpdate
from app.repositories.curso_repository import CursoRepository, get_curso_repo
from app.repositories.reserva_repository import ReservaRepository, get_reserva_repo
from app.services.horario_service import HorarioService


class ReservaService:
    """
    Flujo:
    - Estudiante crea reserva: SOLO id_usuario + id_curso (sin horario aún)
    - Tutor acepta: crea horario (inicio/fin) y lo asigna a la reserva -> confirmada
    """

    def __init__(
        self,
        repo: Optional[ReservaRepository] = None,
        curso_repo: Optional[CursoRepository] = None,
    ) -> None:
        self.repo = repo or get_reserva_repo()
        self.curso_repo = curso_repo or get_curso_repo()
        self.horario_service = HorarioService()  # usa tus reglas (solapes, etc.)

        # duración default para fin = inicio + X min
        self.default_duration_min = int(
            (datetime.now().strftime("%S") and "60")  # no importa, solo fallback
        )

    def list(
        self,
        id_usuario: Optional[str] = None,
        id_curso: Optional[str] = None,
        id_horario: Optional[str] = None,
        estado: Optional[str] = None,
    ):
        return self.repo.list(
            id_usuario=id_usuario,
            id_curso=id_curso,
            id_horario=id_horario,
            estado=estado,
        )

    def get(self, reserva_id: str) -> ReservaOut:
        return self.repo.get(reserva_id)

    def create(self, payload: ReservaCreate) -> ReservaOut:
        # ✅ curso debe existir
        curso = self.curso_repo.get(payload.id_curso)

        # ✅ si ya tiene una reserva activa para ese curso, devolvemos esa
        existing = self.repo.find_active_by_user_course(payload.id_usuario, payload.id_curso)
        if existing:
            return existing

        # ✅ defaults
        if payload.fecha is None:
            payload.fecha = datetime.utcnow()

        if payload.monto is None:
            payload.monto = curso.precio_reserva or 0

        # ✅ cupos: una reserva pendiente consume cupo
        if payload.estado != "cancelada":
            self.curso_repo.increment_cupo(payload.id_curso, amount=1)

        return self.repo.create(payload)

    def update(self, reserva_id: str, payload: ReservaUpdate) -> ReservaOut:
        current = self.get(reserva_id)
        new_estado = payload.estado if payload.estado is not None else current.estado

        # cupos: activa -> cancelada libera
        if current.estado != "cancelada" and new_estado == "cancelada":
            self.curso_repo.decrement_cupo(current.id_curso, amount=1)

        # cancelada -> activa consume
        if current.estado == "cancelada" and new_estado != "cancelada":
            self.curso_repo.increment_cupo(current.id_curso, amount=1)

        return self.repo.update(reserva_id, payload)

    def delete(self, reserva_id: str) -> None:
        current = self.repo.get(reserva_id)
        if current.estado != "cancelada":
            self.curso_repo.decrement_cupo(current.id_curso, amount=1)
        self.repo.delete(reserva_id)

    # ---------- extras para tu frontend ----------
    def disponibilidad(self, curso_id: str, id_usuario: Optional[str]) -> dict:
        curso = self.curso_repo.get(curso_id)

        # si el curso no usa cupo, siempre disponible
        tiene_cupo_limitado = bool(getattr(curso, "tiene_cupo", False))
        cupo_total = getattr(curso, "cupo", None)
        cupo_ocupado = getattr(curso, "cupo_ocupado", 0) or 0

        cupos_disponibles = None
        tiene_disponibilidad = True

        if tiene_cupo_limitado and cupo_total is not None:
            cupos_disponibles = max(0, int(cupo_total) - int(cupo_ocupado))
            tiene_disponibilidad = cupos_disponibles > 0

        usuario_tiene_reserva = False
        if id_usuario:
            r = self.repo.find_active_by_user_course(id_usuario, curso_id)
            usuario_tiene_reserva = r is not None

        return {
            "tiene_cupo_limitado": tiene_cupo_limitado,
            "cupos_disponibles": cupos_disponibles,
            "tiene_disponibilidad": tiene_disponibilidad,
            "usuario_tiene_reserva": usuario_tiene_reserva,
        }

    def get_reserva_chat(self, curso_id: str, estudiante_id: str) -> Optional[ReservaOut]:
        return self.repo.find_active_by_user_course(estudiante_id, curso_id)

    def aceptar_reserva(self, curso_id: str, estudiante_id: str, inicio: datetime, duracion_min: int = 60) -> ReservaOut:
        reserva = self.repo.find_active_by_user_course(estudiante_id, curso_id)
        if not reserva:
            raise KeyError("reserva no encontrada para ese curso/estudiante")

        if reserva.estado == "cancelada":
            raise ValueError("no se puede aceptar una reserva cancelada")

        # ✅ crear horario (usa tu HorarioService que valida solapes)
        fin = inicio + timedelta(minutes=int(duracion_min or 60))
        horario = self.horario_service.create(HorarioCreate(id_curso=curso_id, inicio=inicio, fin=fin))

        # ✅ asignar horario y confirmar
        updated = self.repo.update(
            reserva.id,
            ReservaUpdate(
                estado="confirmada",
                id_horario=horario.id,
                fecha=inicio,
            ),
        )
        return updated

    def rechazar_reserva(self, curso_id: str, estudiante_id: str) -> ReservaOut:
        reserva = self.repo.find_active_by_user_course(estudiante_id, curso_id)
        if not reserva:
            raise KeyError("reserva no encontrada para ese curso/estudiante")

        if reserva.estado == "cancelada":
            return reserva  # ya cancelada

        # ✅ cancelar libera cupo (update maneja cupo)
        return self.update(reserva.id, ReservaUpdate(estado="cancelada"))

    def completar_reserva(self, curso_id: str, estudiante_id: str) -> ReservaOut:
        reserva = self.repo.find_active_by_user_course(estudiante_id, curso_id)
        if not reserva:
            raise KeyError("reserva no encontrada para ese curso/estudiante")

        if reserva.estado == "cancelada":
            raise ValueError("no se puede completar una reserva cancelada")

        return self.repo.update(reserva.id, ReservaUpdate(estado="completada"))
