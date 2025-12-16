// frontend/src/components/Tutor/PanelTutor.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cursosAPI } from "../../api/cursos";
import { reservasAPI } from "../../api/reservas";
import { usuariosAPI } from "../../api/usuarios";
import "../../styles/Tutor/panelTutor.css";
import { useNotification } from "../NotificationProvider";
import CardTutor from "./CardTutor";
import api from "../../api/config";


// =====================================================
// Helpers (robustos para ids + nombres)
// =====================================================
const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);


const PAYMENTS_PREFIX = "/ms-payments/v1";

const fetchMe = async () => {
  const meRes = await api.get("/v1/auth/me");
  const me = meRes?.data;
  if (!me?.id) throw new Error("No se pudo obtener el id del usuario (/v1/auth/me).");
  return me.id;
};

const fetchSubsForUser = async (userId) => {
  try {
    const r1 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`, { params: { id_usuario: userId } });
    const list1 = Array.isArray(r1.data) ? r1.data : [];
    if (list1.length > 0) return list1;
  } catch { }

  const r2 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`);
  const list2 = Array.isArray(r2.data) ? r2.data : [];
  return list2.filter((s) => String(s?.id_usuario) === String(userId));
};

const fetchPlanById = async (planId) => {
  try {
    const r = await api.get(`${PAYMENTS_PREFIX}/planes/${planId}`);
    return r?.data;
  } catch {
    const r = await api.get(`${PAYMENTS_PREFIX}/planes/${planId}/`);
    return r?.data;
  }
};


const normalizeId = (x) => {
  if (!x) return null;
  if (typeof x === "string") return x;
  if (x?.$oid) return x.$oid;
  if (x?._id) return x._id;
  if (x?.id) return x.id;
  return String(x);
};

const getUsuarioActual = () => JSON.parse(localStorage.getItem("user") || "{}");

const getUsuarioId = () => {
  const u = getUsuarioActual();
  return normalizeId(u?._id || u?.id);
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("es-BO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCursoIdFromReserva = (r) => {
  const raw = r?.id_curso ?? r?.cursoId ?? r?.idCurso ?? null;
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  return normalizeId(raw?._id || raw?.id || raw);
};

// ✅ En TU sistema el estudiante es id_usuario (string u objeto)
const getEstudianteIdFromReserva = (r) => {
  const raw = r?.id_usuario ?? r?.usuarioId ?? r?.idUsuario ?? null;
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  return normalizeId(raw?._id || raw?.id || raw);
};

const getNombreFromUsuario = (u) => {
  if (!u) return "Estudiante";
  const nombre = u?.nombre || u?.name || "";
  const apellido = u?.apellido || u?.last_name || "";
  const full = `${nombre} ${apellido}`.trim();
  return full || u?.email || "Estudiante";
};

// Normaliza respuesta de usuarios-service: puede venir usuario directo o envuelto
const getUsuarioFromResp = (data) => {
  return data?.usuario ?? data?.user ?? data?.data ?? data ?? null;
};

// =====================================================
// Modal: Solicitudes de reserva (pendientes) para tutor
// =====================================================
const SolicitudesReservasModal = ({
  open,
  onClose,
  reservasPendientes = [],
  cursosMap,
  onAccepted,
  onRejected,
}) => {
  const { showNotification } = useNotification();

  const [selectedReservaId, setSelectedReservaId] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [nombresUsuarios, setNombresUsuarios] = useState({}); // { userId: "Nombre Apellido" }
  const [saving, setSaving] = useState(false);



  // Reset cuando se abre
  useEffect(() => {
    if (!open) return;
    setSelectedReservaId(reservasPendientes?.[0]?.id || reservasPendientes?.[0]?._id || "");
    setFechaHora("");
  }, [open, reservasPendientes]);

  // ✅ Cargar nombres reales (pendientes)
  useEffect(() => {
    const run = async () => {
      if (!open) return;

      const list = Array.isArray(reservasPendientes) ? reservasPendientes : [];

      // 1) Embebidos
      const dict = {};
      list.forEach((r) => {
        const rawU = r?.id_usuario;
        if (rawU && typeof rawU === "object") {
          const id = normalizeId(rawU?._id || rawU?.id);
          if (id) dict[id] = getNombreFromUsuario(rawU);
        }
      });

      // 2) Strings -> fetch
      const ids = Array.from(new Set(list.map(getEstudianteIdFromReserva).filter(Boolean))).filter(
        (id) => !dict[id]
      );

      if (ids.length === 0) {
        setNombresUsuarios(dict);
        return;
      }

      setLoadingUsuarios(true);
      try {
        await Promise.all(
          ids.map(async (id) => {
            try {
              const resp = await usuariosAPI.getUsuario(id);
              const u = getUsuarioFromResp(resp?.data);
              dict[id] = getNombreFromUsuario(u);
            } catch {
              dict[id] = "Estudiante";
            }
          })
        );
        setNombresUsuarios(dict);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    run();
  }, [open, reservasPendientes]);

  const selectedReserva = useMemo(() => {
    const id = String(selectedReservaId || "");
    return (reservasPendientes || []).find((r) => String(r?.id || r?._id) === id) || null;
  }, [reservasPendientes, selectedReservaId]);

  const cursoTitulo = useMemo(() => {
    if (!selectedReserva) return "—";
    const cursoId = getCursoIdFromReserva(selectedReserva);
    const c = cursosMap?.get?.(String(cursoId));
    return c?.titulo || c?.nombre || selectedReserva?.id_curso?.nombre || "Curso";
  }, [selectedReserva, cursosMap]);

  const estudianteNombre = useMemo(() => {
    if (!selectedReserva) return "—";
    const rawU = selectedReserva?.id_usuario;

    if (rawU && typeof rawU === "object") return getNombreFromUsuario(rawU);

    const estId = getEstudianteIdFromReserva(selectedReserva);
    return nombresUsuarios?.[estId] || "Estudiante";
  }, [selectedReserva, nombresUsuarios]);

  const handleAceptar = async () => {
    if (!selectedReserva) return;

    const cursoId = getCursoIdFromReserva(selectedReserva);
    const estudianteId = getEstudianteIdFromReserva(selectedReserva);

    if (!cursoId || !estudianteId) {
      showNotification({
        type: "error",
        title: "Datos incompletos",
        message: "No se pudo determinar curso o estudiante para esta solicitud.",
      });
      return;
    }

    if (!fechaHora) {
      showNotification({
        type: "warning",
        title: "Campos incompletos",
        message: "Debes seleccionar fecha y hora para aceptar la reserva.",
      });
      return;
    }

    setSaving(true);
    try {
      const inicioISO = new Date(fechaHora).toISOString();

      const resp = await reservasAPI.aceptarReserva({
        cursoId: String(cursoId),
        estudianteId: String(estudianteId),
        inicio: inicioISO,
        duracion_min: 60,
      });

      const ok = resp?.data?.success === true || resp?.status === 200;
      if (!ok)
        throw new Error(
          resp?.data?.detail || resp?.data?.message || "No se pudo aceptar la reserva."
        );

      showNotification({
        type: "success",
        title: "Reserva aceptada",
        message: `Aceptaste la reserva de ${estudianteNombre} para "${cursoTitulo}".`,
      });

      onAccepted?.(resp?.data?.reserva || null);
    } catch (e) {
      console.error("Error aceptarReserva:", e);
      showNotification({
        type: "error",
        title: "Error",
        message:
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo aceptar la reserva.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedReserva) return;

    const cursoId = getCursoIdFromReserva(selectedReserva);
    const estudianteId = getEstudianteIdFromReserva(selectedReserva);

    if (!cursoId || !estudianteId) {
      showNotification({
        type: "error",
        title: "Datos incompletos",
        message: "No se pudo determinar curso o estudiante para esta solicitud.",
      });
      return;
    }

    setSaving(true);
    try {
      const resp = await reservasAPI.rechazarReserva({
        cursoId: String(cursoId),
        estudianteId: String(estudianteId),
      });

      const ok = resp?.data?.success === true || resp?.status === 200;
      if (!ok)
        throw new Error(
          resp?.data?.detail || resp?.data?.message || "No se pudo rechazar la reserva."
        );

      showNotification({
        type: "info",
        title: "Reserva rechazada",
        message: `Rechazaste la reserva de ${estudianteNombre} para "${cursoTitulo}".`,
      });

      onRejected?.(resp?.data?.reserva || null);
    } catch (e) {
      console.error("Error rechazarReserva:", e);
      showNotification({
        type: "error",
        title: "Error",
        message:
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo rechazar la reserva.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="chat-modal-backdrop">
      <div className="chat-modal" style={{ maxWidth: 520 }}>
        <h3 className="chat-modal-title">Solicitudes de reserva</h3>
        <p className="chat-modal-text">
          Selecciona una solicitud, revisa el curso y el estudiante, y acepta o rechaza.
        </p>

        {reservasPendientes.length === 0 ? (
          <div style={{ padding: 12, fontSize: 14, opacity: 0.8 }}>
            No tienes solicitudes pendientes.
          </div>
        ) : (
          <>
            <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Solicitud</label>

            <select
              className="chat-modal-input"
              value={selectedReservaId}
              onChange={(e) => setSelectedReservaId(e.target.value)}
              disabled={saving}
              style={{ width: "100%", padding: 10 }}
            >
              {reservasPendientes.map((r) => {
                const id = String(r?.id || r?._id);
                const cursoId = getCursoIdFromReserva(r);
                const curso = cursosMap?.get?.(String(cursoId));

                const rawU = r?.id_usuario;
                const estId = getEstudianteIdFromReserva(r);

                const estNombre =
                  (rawU && typeof rawU === "object"
                    ? getNombreFromUsuario(rawU)
                    : (estId ? nombresUsuarios?.[estId] : null)) || "Estudiante";

                const cursoNombre = curso?.titulo || curso?.nombre || r?.id_curso?.nombre || "Curso";

                return (
                  <option key={id} value={id}>
                    {cursoNombre} · {estNombre} · {formatDate(r?.fechaCreacion)}
                  </option>
                );
              })}
            </select>

            {selectedReserva && (
              <div
                style={{
                  marginTop: 12,
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 12,
                  padding: 12,
                  background: "rgba(0,0,0,0.02)",
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 13 }}>
                  <span style={{ opacity: 0.75 }}>Curso:</span> <strong>{cursoTitulo}</strong>
                </div>

                <div style={{ fontSize: 13 }}>
                  <span style={{ opacity: 0.75 }}>Estudiante:</span>{" "}
                  <strong>{estudianteNombre}</strong>
                </div>

                <div style={{ fontSize: 13 }}>
                  <span style={{ opacity: 0.75 }}>Estado:</span>{" "}
                  <strong>{selectedReserva?.estado || "pendiente"}</strong>
                </div>

                <div style={{ fontSize: 13 }}>
                  <span style={{ opacity: 0.75 }}>Solicitada:</span>{" "}
                  <strong>{formatDate(selectedReserva?.fechaCreacion)}</strong>
                </div>
              </div>
            )}

            <label style={{ display: "block", fontSize: 13, marginTop: 12 }}>
              Fecha y hora (para aceptar)
            </label>
            <input
              type="datetime-local"
              className="chat-modal-input"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              disabled={saving}
            />
          </>
        )}

        <div className="chat-modal-actions">
          <button
            type="button"
            className="chat-modal-btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cerrar
          </button>

          <button
            type="button"
            className="chat-modal-btn-secondary"
            onClick={handleRechazar}
            disabled={saving || reservasPendientes.length === 0}
            style={{ opacity: reservasPendientes.length === 0 ? 0.5 : 1 }}
          >
            {saving ? "..." : "Rechazar"}
          </button>

          <button
            type="button"
            className="chat-modal-btn-primary"
            onClick={handleAceptar}
            disabled={saving || reservasPendientes.length === 0}
            style={{ opacity: reservasPendientes.length === 0 ? 0.5 : 1 }}
          >
            {saving ? "..." : "Aceptar"}
          </button>
        </div>

        {loadingUsuarios && (
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>Cargando nombres...</div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// PanelTutor
// =====================================================
const PanelTutor = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(false);

  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState("");

  const [suscripcionActiva, setSuscripcionActiva] = useState(null);
  const [limiteCursos, setLimiteCursos] = useState(3);
  const [planNombre, setPlanNombre] = useState(null);

  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);
  const [reservasPendientes, setReservasPendientes] = useState([]);

  // ✅ nombres para confirmadas
  const [nombresUsuariosConfirmadas, setNombresUsuariosConfirmadas] = useState({});

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [openSolicitudes, setOpenSolicitudes] = useState(false);

  // Map cursos por id
  const cursosMap = useMemo(() => {
    const m = new Map();
    (cursos || []).forEach((c) => m.set(String(c.id), c));
    return m;
  }, [cursos]);

  // ✅ set de ids de cursos del tutor (para filtrar todo)
  const cursosIdsTutor = useMemo(() => {
    return new Set((cursos || []).map((c) => String(c.id)));
  }, [cursos]);

  // --------- Fetch cursos + reservas ----------
  useEffect(() => {
  const fetchCursos = async () => {
    setLoadingCursos(true);
    setErrorCursos("");

    try {
      const { data } = await cursosAPI.getMisCursos();

      const cursosRaw = Array.isArray(data)
        ? data
        : data?.success && Array.isArray(data.cursos)
        ? data.cursos
        : [];

      setCursos(
        cursosRaw.map((c) => ({
          id: c.id || c._id,
          titulo: c.nombre,
          descripcion: c.descripcion,
          categorias: c.categorias || [],
          precio: c.precio_reserva,
          modalidad: c.modalidad,
          verificacion_estado: c.verificacion_estado,
        }))
      );
    } catch (err) {
      console.error("Error obteniendo cursos del tutor:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        `Error al obtener tus cursos (status ${err?.response?.status || "?"}).`;

      setErrorCursos(msg);
    } finally {
      setLoadingCursos(false);
    }
  };

  const fetchReservas = async () => {
    try {
      const { data: conf } = await reservasAPI.getReservasConfirmadasTutor();
      if (conf?.success && Array.isArray(conf.reservas)) setReservasConfirmadas(conf.reservas);
      else setReservasConfirmadas([]);

      const { data: pend } = await reservasAPI.getReservas({ estado: "pendiente" });
      const list = pend?.success ? pend?.reservas || [] : Array.isArray(pend) ? pend : [];
      setReservasPendientes(list);
    } catch (err) {
      console.error("Error obteniendo reservas:", err);
      setReservasConfirmadas([]);
      setReservasPendientes([]);
    }
  };

  const fetchSuscripcion = async () => {
    setLoadingSuscripcion(true);
    try {
      const userId = await fetchMe();
      const subs = await fetchSubsForUser(userId);

      const found =
        subs.find((s) => s.estado === "activa") ||
        subs.find((s) => s.estado === "pendiente") ||
        null;

      setSuscripcionActiva(found);

      if (!found) {
        setLimiteCursos(3);
        setPlanNombre(null);
        return;
      }

      const idPlanRaw = found?.id_plan;
      const planId =
        typeof idPlanRaw === "object" ? (idPlanRaw?.id || idPlanRaw?._id) : idPlanRaw;

      const embeddedLimit = typeof idPlanRaw === "object" ? idPlanRaw?.cantidadCursos : null;

      if (Number.isFinite(Number(embeddedLimit)) && Number(embeddedLimit) > 0) {
        setLimiteCursos(Number(embeddedLimit));
        setPlanNombre(idPlanRaw?.nombre || null);
        return;
      }

      if (planId) {
        const plan = await fetchPlanById(planId);
        const lim = Number(plan?.cantidadCursos || plan?.cantidad_cursos);
        setLimiteCursos(Number.isFinite(lim) && lim > 0 ? lim : 3);
        setPlanNombre(plan?.nombre || null);
        return;
      }

      setLimiteCursos(3);
      setPlanNombre(null);
    } catch (e) {
      setSuscripcionActiva(null);
      setLimiteCursos(3);
      setPlanNombre(null);
    } finally {
      setLoadingSuscripcion(false);
    }
  };

  // ✅ Ejecutar
  fetchCursos().then(fetchReservas);
  fetchSuscripcion();
}, []);


  // ✅ Confirmadas SOLO de cursos del tutor (fallback si conf viene global)
  const reservasConfirmadasTutor = useMemo(() => {
    return (reservasConfirmadas || []).filter((r) => {
      const cursoId = getCursoIdFromReserva(r);
      return cursoId && cursosIdsTutor.has(String(cursoId));
    });
  }, [reservasConfirmadas, cursosIdsTutor]);

  // ✅ Pendientes SOLO de cursos del tutor
  const reservasPendientesTutor = useMemo(() => {
    return (reservasPendientes || []).filter((r) => {
      const cursoId = getCursoIdFromReserva(r);
      return cursoId && cursosIdsTutor.has(String(cursoId));
    });
  }, [reservasPendientes, cursosIdsTutor]);

  // ✅ Hidratar nombres para confirmadas (solo del tutor)
  useEffect(() => {
    const run = async () => {
      const list = Array.isArray(reservasConfirmadasTutor) ? reservasConfirmadasTutor : [];

      // 1) Embebidos
      const dict = {};
      list.forEach((r) => {
        const rawU = r?.id_usuario;
        if (rawU && typeof rawU === "object") {
          const id = normalizeId(rawU?._id || rawU?.id);
          if (id) dict[id] = getNombreFromUsuario(rawU);
        }
      });

      // 2) Strings -> fetch
      const ids = Array.from(new Set(list.map(getEstudianteIdFromReserva).filter(Boolean))).filter(
        (id) => !dict[id]
      );

      if (ids.length === 0) {
        setNombresUsuariosConfirmadas(dict);
        return;
      }

      await Promise.all(
        ids.map(async (id) => {
          try {
            const resp = await usuariosAPI.getUsuario(id);
            const u = getUsuarioFromResp(resp?.data);
            dict[id] = getNombreFromUsuario(u);
          } catch {
            dict[id] = "Estudiante";
          }
        })
      );

      setNombresUsuariosConfirmadas(dict);
    };

    run();
  }, [reservasConfirmadasTutor]);

  // --------- UI actions ----------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleProfile = () => navigate("/tutor/perfil");

  const createNewCourse = () => {

    if (loadingSuscripcion) {
      showNotification({
        type: "info",
        title: "Verificando plan",
        message: "Espera un momento…",
        duration: 2000,
      });
      return;
    }

    const cursosActivos = cursos.length;

    if (!suscripcionActiva && cursosActivos >= 3) {
      showNotification({
        type: "warning",
        title: "Límite de cursos alcanzado",
        message: "Has alcanzado el límite de 3 cursos gratuitos. Adquiere un plan para crear más cursos.",
        duration: 6000,
      });
      navigate("/planes");
      return;
    }

    if (
      suscripcionActiva &&
      Number.isFinite(Number(limiteCursos)) &&
      cursosActivos >= limiteCursos
    ) {
      showNotification({
        type: "warning",
        title: "Límite de cursos alcanzado",
        message: `Has alcanzado el límite de ${limiteCursos} cursos de tu plan${planNombre ? ` "${planNombre}"` : ""
          }.`,
        duration: 6000,
      });
      return;
    }

    navigate("/tutor/curso/nuevo");
  };

  const viewChats = () => navigate("/chats");

  const viewCursos = () => {
    const section = document.getElementById("tutor-cursos-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const viewCalendar = () => {
    const section = document.getElementById("tutor-calendar-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const changeMonth = (delta) => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  // --------- Calendario + próximas clases (SOLO del tutor) ----------
  const currentMonthIndex = currentMonthDate.getMonth();
  const currentYear = currentMonthDate.getFullYear();

  const reservasPorDia = reservasConfirmadasTutor.reduce((acc, reserva) => {
    if (!reserva.fecha) return acc;
    const fecha = new Date(reserva.fecha);

    if (fecha.getMonth() !== currentMonthIndex || fecha.getFullYear() !== currentYear) return acc;

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

  const ahora = new Date();
  const proximasClases = reservasConfirmadasTutor
    .filter((r) => r.fecha && new Date(r.fecha) >= ahora)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 5);

  // --------- Refresh reservas ----------
  const refreshReservas = async () => {
    try {
      const { data: conf } = await reservasAPI.getReservasConfirmadasTutor();
      const confList = conf?.success && Array.isArray(conf.reservas) ? conf.reservas : [];
      setReservasConfirmadas(confList);

      const { data: pend } = await reservasAPI.getReservas({ estado: "pendiente" });
      const list = pend?.success ? pend?.reservas || [] : Array.isArray(pend) ? pend : [];
      setReservasPendientes(list);
    } catch {
      // no reventar UI
    }
  };

  const onAccepted = async () => {
    setOpenSolicitudes(false);
    await refreshReservas();
  };

  const onRejected = async () => {
    setOpenSolicitudes(false);
    await refreshReservas();
  };

  return (
    <div className="panel-tutor-page">
      <div className="main-content">
        <div className="container">
          <h1 className="panel-tutor-title">Panel del tutor</h1>

          {/* Modal solicitudes */}
          <SolicitudesReservasModal
            open={openSolicitudes}
            onClose={() => setOpenSolicitudes(false)}
            reservasPendientes={reservasPendientesTutor}
            cursosMap={cursosMap}
            onAccepted={onAccepted}
            onRejected={onRejected}
          />

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

                      {/* Solicitudes */}
                      <button
                        className="action-btn"
                        type="button"
                        onClick={() => setOpenSolicitudes(true)}
                        style={{ position: "relative" }}
                        title="Ver solicitudes pendientes"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm1 11H7v-2h6V7h2v6Z" />
                        </svg>
                        Solicitudes
                        {reservasPendientesTutor.length > 0 && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "rgba(0,0,0,0.12)",
                            }}
                          >
                            {reservasPendientesTutor.length}
                          </span>
                        )}
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

              {/* Próximas clases (SOLO del tutor) */}
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

                      const cursoId = getCursoIdFromReserva(reserva);
                      const curso = cursosMap.get(String(cursoId));
                      const cursoNombre =
                        curso?.titulo || curso?.nombre || reserva?.id_curso?.nombre || "Curso";

                      const rawU = reserva?.id_usuario;
                      const estId = getEstudianteIdFromReserva(reserva);
                      const nombreEstudiante =
                        rawU && typeof rawU === "object"
                          ? getNombreFromUsuario(rawU)
                          : (estId ? nombresUsuariosConfirmadas?.[estId] : null) || "Estudiante";

                      return (
                        <div className="clase-item" key={reserva.id || reserva._id}>
                          <div className="clase-info">
                            <h3>{cursoNombre}</h3>
                            <p className="clase-details">
                              {fechaTexto && horaTexto
                                ? `${fechaTexto} · ${horaTexto}`
                                : "Sin fecha definida"}
                            </p>
                            <p className="clase-description">Estudiante: {nombreEstudiante}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mis cursos */}
              <div
                id="tutor-cursos-section"
                style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}
              >
                <h3 style={{ margin: 0 }}>Mis cursos</h3>

                {loadingCursos && (
                  <p style={{ fontSize: 14, color: "#7f8c8d" }}>Cargando cursos...</p>
                )}

                {!loadingCursos && errorCursos && (
                  <p style={{ fontSize: 14, color: "#e74c3c" }}>{errorCursos}</p>
                )}

                {!loadingCursos && !errorCursos && cursos.length === 0 && (
                  <p style={{ fontSize: 14, color: "#7f8c8d" }}>Aún no tienes cursos creados.</p>
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

            {/* Calendario (SOLO del tutor) */}
            <div className="right-content" id="tutor-calendar-section">
              <div className="calendar-widget">
                <h3>Seleccionar una fecha</h3>
                <div className="current-date">{todayLabel}</div>

                <div className="month-selector">
                  <button className="nav-btn" type="button" onClick={() => changeMonth(-1)}>
                    ‹
                  </button>
                  <select className="month-dropdown" value={monthLabel} readOnly>
                    <option>{monthLabel}</option>
                  </select>
                  <button className="nav-btn" type="button" onClick={() => changeMonth(1)}>
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
                          .map((r) => {
                            const cId = getCursoIdFromReserva(r);
                            const c = cursosMap.get(String(cId));
                            const cursoNombre =
                              c?.titulo || c?.nombre || r?.id_curso?.nombre || "Curso";

                            const rawU = r?.id_usuario;
                            const estId = getEstudianteIdFromReserva(r);
                            const nombreEstudiante =
                              rawU && typeof rawU === "object"
                                ? getNombreFromUsuario(rawU)
                                : (estId ? nombresUsuariosConfirmadas?.[estId] : null) ||
                                "Estudiante";

                            return `${cursoNombre} - Estudiante: ${nombreEstudiante}`;
                          })
                          .join("\n")
                        : "";

                      return (
                        <div
                          key={day}
                          className={"calendar-day" + (tieneReserva ? " calendar-day-reservado" : "")}
                          title={tooltip}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="calendar-actions">
                  <button className="calendar-btn" type="button" onClick={viewCursos}>
                    Ver cursos
                  </button>
                  <button className="calendar-btn primary" type="button" onClick={viewCalendar}>
                    OK
                  </button>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                  <button className="calendar-btn" type="button" onClick={handleProfile}>
                    Perfil
                  </button>
                  <button className="calendar-btn" type="button" onClick={handleLogout}>
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botón flotante */}
          {reservasPendientesTutor.length > 0 && (
            <button
              type="button"
              onClick={() => setOpenSolicitudes(true)}
              style={{
                position: "fixed",
                right: 18,
                bottom: 18,
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
              }}
              title="Ver solicitudes pendientes"
            >
              Solicitudes ({reservasPendientesTutor.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelTutor;
