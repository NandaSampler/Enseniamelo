import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cursosAPI } from "../../api/cursos";
import { reservasAPI } from "../../api/reservas";
import CardTutor from "./CardTutor";
import "../../styles/Tutor/panelTutor.css";

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

const PanelTutor = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState("");
  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    const fetchCursos = async () => {
      setLoadingCursos(true);
      setErrorCursos("");
      try {
        const { data } = await cursosAPI.getMisCursos();
        if (data?.success && Array.isArray(data.cursos)) {
          setCursos(
            data.cursos.map((c) => ({
              id: c._id,
              titulo: c.nombre,
              descripcion: c.descripcion,
              categorias: c.categorias || [],
              precio: c.precio_reserva,
              modalidad: c.modalidad,
              verificacion_estado: c.verificacion_estado,
            }))
          );
        } else {
          setErrorCursos("No se pudieron cargar tus cursos.");
        }
      } catch (err) {
        console.error("Error obteniendo cursos del tutor:", err);
        setErrorCursos(
          err?.response?.data?.message ||
            "Error al obtener tus cursos. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoadingCursos(false);
      }
    };

    fetchCursos();

    const fetchReservasConfirmadas = async () => {
      try {
        const { data } = await reservasAPI.getReservasConfirmadasTutor();
        if (data?.success && Array.isArray(data.reservas)) {
          setReservasConfirmadas(data.reservas);
        } else {
          setReservasConfirmadas([]);
        }
      } catch (err) {
        console.error("Error obteniendo reservas confirmadas del tutor:", err);
        setReservasConfirmadas([]);
      }
    };

    fetchReservasConfirmadas();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    navigate("/tutor/perfil");
  };

  const createNewCourse = () => {
    navigate("/tutor/curso/nuevo");
  };

  const viewCalendar = () => {
    const section = document.getElementById("tutor-calendar-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const viewChats = () => {
    navigate("/chats");
  };

  const currentMonthIndex = currentMonthDate.getMonth();
  const currentYear = currentMonthDate.getFullYear();

  const reservasPorDia = reservasConfirmadas.reduce((acc, reserva) => {
    if (!reserva.fecha) return acc;
    const fecha = new Date(reserva.fecha);

    if (
      fecha.getMonth() !== currentMonthIndex ||
      fecha.getFullYear() !== currentYear
    ) {
      return acc;
    }

    const dia = fecha.getDate();
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(reserva);
    return acc;
  }, {});

  const monthLabel = currentMonthDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const changeMonth = (delta) => {
    setCurrentMonthDate((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const ahora = new Date();
  const proximasClases = reservasConfirmadas
    .filter((r) => r.fecha && new Date(r.fecha) >= ahora)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 5);

  const viewCursos = () => {
    const section = document.getElementById("tutor-cursos-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const verDetalle = (clase) => {
    alert(`Ver detalles de ${clase.titulo}`);
  };

  const rechazar = (clase) => {
    alert(`Rechazar ${clase.titulo}`);
  };

  const aceptar = (clase) => {
    alert(`Aceptar ${clase.titulo}`);
  };

  return (
    <div className="panel-tutor-page">
      <div className="main-content">
        <div className="container">
          <h1 className="panel-tutor-title">Panel del tutor</h1>
          <div className="content-layout">
            <div className="left-content">
              <div className="tutor-banner">
                <div className="banner-content">
                  <div className="banner-info">
                    <h2>Panel de Tutores</h2>
                    <p>Gestiona tus cursos y horarios</p>
                    <div className="banner-actions">
                      <button className="action-btn" type="button" onClick={createNewCourse}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                        </svg>
                        Crear Nuevo Curso
                      </button>
                      <button className="action-btn" type="button" onClick={viewChats}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" />
                        </svg>
                        Ver mis chats
                      </button>
                      <button className="action-btn" type="button" onClick={viewCursos}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 4H21V6H3V4M3 8H21V18H3V8M5 10V16H11V10H5Z" />
                        </svg>
                        Cursos
                      </button>
                    </div>
                  </div>
                  <div className="banner-icons">
                    <div className="placeholder-icon">△</div>
                    <div className="placeholder-icon">⚙</div>
                    <div className="placeholder-icon">□</div>
                  </div>
                </div>
              </div>

              <div className="clases-section">
                <h3 className="clases-title">Próximas clases confirmadas</h3>
                {proximasClases.length === 0 && (
                  <p className="clases-empty">
                    Aún no tienes clases confirmadas próximas en el calendario.
                  </p>
                )}
                {proximasClases.length > 0 && (
                  <div className="clases-list">
                    {proximasClases.map((reserva) => {
                      const fecha = reserva.fecha ? new Date(reserva.fecha) : null;
                      const fechaTexto = fecha
                        ? fecha.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "";
                      const horaTexto = fecha
                        ? fecha.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";

                      const est = reserva.id_usuario || {};
                      const nombreEstudiante =
                        est.nombreCompleto ||
                        (est.nombre && est.apellido
                          ? `${est.nombre} ${est.apellido}`
                          : est.nombre || est.email || "Estudiante");

                      return (
                        <div className="clase-item" key={reserva._id}>
                          <div className="clase-info">
                            <h3>{reserva.id_curso?.nombre || "Curso"}</h3>
                            <p className="clase-details">
                              {fechaTexto && horaTexto
                                ? `${fechaTexto} · ${horaTexto}`
                                : "Sin fecha definida"}
                            </p>
                            <p className="clase-description">
                              Estudiante: {nombreEstudiante}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                id="tutor-cursos-section"
                style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}
              >
                <h3 style={{ margin: 0 }}>Mis cursos</h3>
                {loadingCursos && (
                  <p style={{ fontSize: 14, color: "#7f8c8d" }}>
                    Cargando cursos...
                  </p>
                )}
                {!loadingCursos && errorCursos && (
                  <p style={{ fontSize: 14, color: "#e74c3c" }}>{errorCursos}</p>
                )}
                {!loadingCursos && !errorCursos && cursos.length === 0 && (
                  <p style={{ fontSize: 14, color: "#7f8c8d" }}>
                    Aún no tienes cursos creados.
                  </p>
                )}
                {!loadingCursos && !errorCursos && cursos.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {cursos.map((curso) => (
                      <CardTutor key={curso.id} {...curso} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="right-content" id="tutor-calendar-section">
              <div className="calendar-widget">
                <h3>Seleccionar una fecha</h3>
                <div className="current-date">{todayLabel}</div>

                <div className="month-selector">
                  <button
                    className="nav-btn"
                    type="button"
                    onClick={() => changeMonth(-1)}
                  >
                    ‹
                  </button>
                  <select className="month-dropdown" value={monthLabel} readOnly>
                    <option>{monthLabel}</option>
                  </select>
                  <button
                    className="nav-btn"
                    type="button"
                    onClick={() => changeMonth(1)}
                  >
                    ›
                  </button>
                </div>

                <div className="calendar-grid">
                  <div className="calendar-header">
                    <div className="day-header">S</div>
                    <div className="day-header">D</div>
                    <div className="day-header">L</div>
                    <div className="day-header">M</div>
                    <div className="day-header">M</div>
                    <div className="day-header">J</div>
                    <div className="day-header">V</div>
                  </div>
                  <div className="calendar-days">
                    {calendarDays.map((day) => {
                      const reservasDia = reservasPorDia[day] || [];
                      const tieneReserva = reservasDia.length > 0;
                      const tooltip = tieneReserva
                        ? reservasDia
                            .map(
                              (r) => {
                                const est = r.id_usuario || {};
                                const nombreEstudiante =
                                  est.nombreCompleto ||
                                  (est.nombre && est.apellido
                                    ? `${est.nombre} ${est.apellido}`
                                    : est.nombre || est.email || "Estudiante");
                                return `${r.id_curso?.nombre || "Curso"} - Estudiante: ${nombreEstudiante}`;
                              }
                            )
                            .join("\n")
                        : "";

                      return (
                        <div
                          key={day}
                          className={
                            "calendar-day" +
                            (tieneReserva ? " calendar-day-reservado" : "")
                          }
                          title={tooltip}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="calendar-actions">
                  <button className="calendar-btn" type="button">Cancelar</button>
                  <button className="calendar-btn primary" type="button">OK</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelTutor;
