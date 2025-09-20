# cursoservice/tests/test_cursos.py
from __future__ import annotations
from datetime import datetime, timedelta

from app.schemas.curso import CursoCreate
from app.schemas.horario import HorarioCreate
from app.schemas.reserva import ReservaCreate, ReservaUpdate
from app.services.curso_service import CursoService
from app.services.horario_service import HorarioService
from app.services.reserva_service import ReservaService

# Repos para limpiar estado entre tests
from app.repositories.curso_repository import curso_repo
from app.repositories.categoria_repository import categoria_repo
from app.repositories.curso_categoria_repository import curso_categoria_repo
from app.repositories.horario_repository import horario_repo
from app.repositories.reserva_repository import reserva_repo


def setup_function():
    # reset in-memory state
    curso_repo.clear()
    categoria_repo.clear()
    curso_categoria_repo.clear()
    horario_repo.clear()
    reserva_repo.clear()


def test_flujo_basico_curso_horario_reserva():
    cs = CursoService()
    hs = HorarioService()
    rs = ReservaService()

    # 1) crear curso
    curso = cs.create(
        CursoCreate(
            nombre="Python Básico",
            descripcion="Introducción a Python",
            modalidad="online",
            duracion_semanas=4,
            costo_inscripcion=0,
            costo_curso=100,
            cupo_maximo=2,
            cupo_ocupado=0,
            estado="activo",
        )
    )
    assert curso.id >= 1
    assert curso.cupo_ocupado == 0

    # 2) crear horario del curso
    inicio = datetime.utcnow() + timedelta(days=1)
    fin = inicio + timedelta(hours=2)
    horario = hs.create(HorarioCreate(curso_id=curso.id, inicio=inicio, fin=fin))
    assert horario.curso_id == curso.id

    # 3) crear reserva (consume cupo)
    reserva = rs.create(ReservaCreate(curso_id=curso.id, horario_id=horario.id, pagado=False, estado="pendiente"))
    assert reserva.id >= 1

    # 4) verificar cupo ocupado incrementado
    curso_after = cs.get(curso.id)
    assert curso_after.cupo_ocupado == 1

    # 5) cancelar reserva -> libera cupo
    reserva_upd = rs.update(reserva.id, ReservaUpdate(estado="cancelada"))
    assert reserva_upd.estado == "cancelada"
    curso_after2 = cs.get(curso.id)
    assert curso_after2.cupo_ocupado == 0
