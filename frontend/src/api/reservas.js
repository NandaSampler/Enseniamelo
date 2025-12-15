// frontend/src/api/reservas.js
import api from "./config";

const RESERVAS_BASE = "/curso/api/v1/reservas/";

const getUsuarioActualId = () => {
  const u = JSON.parse(localStorage.getItem("user") || "{}");
  return u._id || u.id || null;
};

export const reservasAPI = {
  getReservas: async (params = {}) => {
    return await api.get(RESERVAS_BASE, { params });
  },

  getReserva: async (id) => {
    return await api.get(`${RESERVAS_BASE}/${id}`);
  },

  // ✅ Crea reserva SIN horario (se asigna después)
  // body: { id_usuario, id_curso }
  createReserva: async (data = {}) => {
    const id_usuario = data.id_usuario || getUsuarioActualId();
    const id_curso = data.id_curso || data.cursoId;

    if (!id_usuario) throw new Error("No se pudo determinar id_usuario (localStorage.user)");
    if (!id_curso) throw new Error("No se pudo determinar id_curso");

    return await api.post(RESERVAS_BASE, { id_usuario, id_curso });
  },

  updateReserva: async (id, reservaData) => {
    return await api.put(`${RESERVAS_BASE}/${id}`, reservaData);
  },

  deleteReserva: async (id) => {
    return await api.delete(`${RESERVAS_BASE}/${id}`);
  },

  // ✅ Tu backend filtra por query param id_usuario
  getMisReservasEstudiante: async () => {
    const id_usuario = getUsuarioActualId();
    if (!id_usuario) throw new Error("No se pudo determinar id_usuario (localStorage.user)");

    return await api.get(RESERVAS_BASE, { params: { id_usuario } });
  },

  // (si luego implementas endpoint real)
  getReservasConfirmadasTutor: async () => {
    return await api.get(RESERVAS_BASE, { params: { estado: "confirmada" } });
  },

  // ✅ Estos endpoints existen en tu frontend actual. Si tu backend aún no los tiene, no los uses.
  aceptarReserva: async ({ cursoId, estudianteId, inicio, duracion_min = 60 }) => {
    return await api.post(`${RESERVAS_BASE}/aceptar`, {
      cursoId,
      estudianteId,
      inicio,
      duracion_min,
    });
  },

  rechazarReserva: async ({ cursoId, estudianteId }) => {
    return await api.post(`${RESERVAS_BASE}/rechazar`, { cursoId, estudianteId });
  },

  marcarReservaCompletada: async ({ cursoId, estudianteId }) => {
    return await api.post(`${RESERVAS_BASE}/completar`, { cursoId, estudianteId });
  },

  getEstadoReservaChat: async ({ cursoId, estudianteId }) => {
    return await api.get(`${RESERVAS_BASE}/estado`, { params: { cursoId, estudianteId } });
  },

  verificarDisponibilidad: async (cursoId, usuarioId) => {
    return await api.get(`${RESERVAS_BASE}/disponibilidad/${cursoId}`, {
      params: { id_usuario: usuarioId },
    });
  },
};

export default reservasAPI;