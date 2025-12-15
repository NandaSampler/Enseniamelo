// frontend/src/components/Tutor/SolicitudesReservasModal.jsx
import { useEffect, useMemo, useState } from "react";
import { reservasAPI } from "../../api/reservas";
import { usuariosAPI } from "../../api/usuarios";
import "../../styles/Chat/chat.css"; // reutiliza el modal existente (backdrop/modal)
import { useNotification } from "../NotificationProvider";

const normalizeId = (x) => {
  if (!x) return null;
  if (typeof x === "string") return x;
  if (x?.$oid) return x.$oid;
  if (x?._id) return x._id;
  if (x?.id) return x.id;
  return String(x);
};

const getCursoIdFromReserva = (r) => {
  const raw = r?.id_curso ?? r?.cursoId ?? r?.idCurso ?? null;
  return normalizeId(raw);
};

const getEstudianteIdFromReserva = (r) => {
  const raw = r?.id_usuario ?? r?.usuarioId ?? r?.estudianteId ?? null;
  return normalizeId(raw);
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

const SolicitudesReservasModal = ({
  open,
  onClose,
  cursos = [], // [{id, titulo}]
  onUpdated, // callback para refrescar datos en PanelTutor
}) => {
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [fechaHora, setFechaHora] = useState("");
  const [duracionMin, setDuracionMin] = useState(60);

  const [nombresUsuarios, setNombresUsuarios] = useState({}); // { userId: "Nombre Apellido" }

  const cursosMap = useMemo(() => {
    const m = new Map();
    (cursos || []).forEach((c) => {
      const id = normalizeId(c?.id);
      if (id) m.set(id, c);
    });
    return m;
  }, [cursos]);

  const selectedReserva = useMemo(
    () => reservasPendientes.find((r) => String(r?.id || r?._id) === String(selectedId)) || null,
    [reservasPendientes, selectedId]
  );

  const cargarNombres = async (reservas) => {
    const ids = Array.from(
      new Set(
        (reservas || [])
          .map(getEstudianteIdFromReserva)
          .filter(Boolean)
      )
    );

    const out = {};
    for (const id of ids) {
      try {
        const { data } = await usuariosAPI.getUsuario(id);
        out[id] = `${data?.nombre || ""} ${data?.apellido || ""}`.trim() || data?.email || "Estudiante";
      } catch {
        out[id] = "Estudiante";
      }
    }
    setNombresUsuarios(out);
  };

  const fetchPendientes = async () => {
    if (!open) return;
    setLoading(true);
    try {
      // Trae pendientes globales y filtramos por cursos del tutor (workaround)
      const { data } = await reservasAPI.getReservas({ estado: "pendiente" });
      const raw = Array.isArray(data) ? data : data?.reservas || [];
      const filtered = raw.filter((r) => {
        const cursoId = getCursoIdFromReserva(r);
        return cursoId && cursosMap.has(cursoId);
      });

      // normaliza id principal
      const normalized = filtered.map((r) => ({
        ...r,
        id: normalizeId(r?.id || r?._id),
      }));

      setReservasPendientes(normalized);
      setSelectedId(normalized[0]?.id || null);

      await cargarNombres(normalized);
    } catch (err) {
      console.error("Error cargando reservas pendientes:", err);
      setReservasPendientes([]);
      setSelectedId(null);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudieron cargar las solicitudes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchPendientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cursosMap]);

  const handleAceptar = async () => {
    if (!selectedReserva) return;

    const cursoId = getCursoIdFromReserva(selectedReserva);
    const estudianteId = getEstudianteIdFromReserva(selectedReserva);

    if (!cursoId || !estudianteId) {
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo determinar curso/estudiante de la reserva.",
      });
      return;
    }

    if (!fechaHora) {
      showNotification({
        type: "warning",
        title: "Campos incompletos",
        message: "Selecciona fecha y hora.",
      });
      return;
    }

    try {
      setLoading(true);

      // datetime-local -> ISO
      const inicioISO = new Date(fechaHora).toISOString();

      await reservasAPI.aceptarReserva({
        cursoId: String(cursoId),
        estudianteId: String(estudianteId),
        inicio: inicioISO,
        duracion_min: Number(duracionMin) || 60,
      });

      showNotification({
        type: "success",
        title: "Reserva aceptada",
        message: "Se asignó un horario y la reserva quedó confirmada.",
      });

      setFechaHora("");
      setDuracionMin(60);

      await fetchPendientes();
      onUpdated?.();
    } catch (err) {
      console.error("Error aceptando reserva:", err);
      showNotification({
        type: "error",
        title: "Error",
        message: err?.response?.data?.detail || err?.response?.data?.message || "No se pudo aceptar la reserva.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedReserva) return;

    const cursoId = getCursoIdFromReserva(selectedReserva);
    const estudianteId = getEstudianteIdFromReserva(selectedReserva);

    if (!cursoId || !estudianteId) {
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo determinar curso/estudiante de la reserva.",
      });
      return;
    }

    try {
      setLoading(true);

      await reservasAPI.rechazarReserva({
        cursoId: String(cursoId),
        estudianteId: String(estudianteId),
      });

      showNotification({
        type: "info",
        title: "Reserva rechazada",
        message: "La reserva fue rechazada.",
      });

      await fetchPendientes();
      onUpdated?.();
    } catch (err) {
      console.error("Error rechazando reserva:", err);
      showNotification({
        type: "error",
        title: "Error",
        message: err?.response?.data?.detail || err?.response?.data?.message || "No se pudo rechazar la reserva.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="chat-modal-backdrop" onMouseDown={onClose}>
      <div className="chat-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="chat-modal-title">Solicitudes de reserva (pendientes)</h3>
        <p className="chat-modal-text">
          Gestiona solicitudes de tus cursos. Al aceptar, asignas fecha/hora.
        </p>

        {loading && (
          <p className="chat-modal-text" style={{ opacity: 0.8 }}>
            Cargando...
          </p>
        )}

        {!loading && reservasPendientes.length === 0 && (
          <p className="chat-modal-text" style={{ opacity: 0.8 }}>
            No tienes solicitudes pendientes.
          </p>
        )}

        {!loading && reservasPendientes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.85 }}>Selecciona una solicitud</span>
              <select
                className="chat-modal-input"
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {reservasPendientes.map((r) => {
                  const cursoId = getCursoIdFromReserva(r);
                  const curso = cursosMap.get(cursoId);
                  const estId = getEstudianteIdFromReserva(r);
                  const estNombre = nombresUsuarios[estId] || "Estudiante";

                  return (
                    <option key={r.id} value={r.id}>
                      {curso?.titulo || curso?.nombre || "Curso"} · {estNombre} · {formatDate(r?.fechaCreacion)}
                    </option>
                  );
                })}
              </select>
            </label>

            <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Curso:{" "}
                <strong>
                  {(() => {
                    const cId = getCursoIdFromReserva(selectedReserva);
                    const c = cursosMap.get(cId);
                    return c?.titulo || c?.nombre || "—";
                  })()}
                </strong>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Estudiante:{" "}
                <strong>
                  {(() => {
                    const eId = getEstudianteIdFromReserva(selectedReserva);
                    return nombresUsuarios[eId] || "—";
                  })()}
                </strong>
              </div>
            </div>

            <hr style={{ opacity: 0.2, margin: "8px 0" }} />

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.85 }}>Fecha y hora (para aceptar)</span>
              <input
                type="datetime-local"
                className="chat-modal-input"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.85 }}>Duración (min)</span>
              <select
                className="chat-modal-input"
                value={duracionMin}
                onChange={(e) => setDuracionMin(Number(e.target.value))}
              >
                {[30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="chat-modal-actions" style={{ marginTop: 14 }}>
          <button type="button" className="chat-modal-btn-secondary" onClick={onClose} disabled={loading}>
            Cerrar
          </button>

          <button
            type="button"
            className="chat-modal-btn-secondary"
            onClick={handleRechazar}
            disabled={loading || !selectedReserva}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            Rechazar
          </button>

          <button
            type="button"
            className="chat-modal-btn-primary"
            onClick={handleAceptar}
            disabled={loading || !selectedReserva}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            Aceptar + asignar horario
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolicitudesReservasModal;
