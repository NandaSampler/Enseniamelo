// frontend/src/api/reservas.js
import api from './config';

const RESERVAS_BASE = '/curso/api/v1/reservas';

export const reservasAPI = {
  // Obtener todas las reservas con filtros opcionales
  getReservas: async (params = {}) => {
    return await api.get(RESERVAS_BASE, { params });
  },

  // Obtener una reserva por ID
  getReserva: async (id) => {
    return await api.get(`${RESERVAS_BASE}/${id}`);
  },

  // Crear una nueva reserva
  createReserva: async (reservaData) => {
    return await api.post(RESERVAS_BASE, reservaData);
  },

  // Actualizar una reserva
  updateReserva: async (id, reservaData) => {
    return await api.put(`${RESERVAS_BASE}/${id}`, reservaData);
  },

  // Eliminar una reserva
  deleteReserva: async (id) => {
    return await api.delete(`${RESERVAS_BASE}/${id}`);
  },

  // Obtener reservas del estudiante autenticado
  getMisReservasEstudiante: async () => {
    return await api.get(RESERVAS_BASE, {
      params: {
        // El backend filtrará por el usuario autenticado
      }
    });
  },

  // Obtener reservas confirmadas del tutor
  getReservasConfirmadasTutor: async () => {
    return await api.get(RESERVAS_BASE, {
      params: {
        estado: 'confirmada'
        // El backend filtrará por los cursos del tutor autenticado
      }
    });
  },

  // Aceptar una reserva (crear horario)
  aceptarReserva: async ({ cursoId, estudianteId, inicio }) => {
    return await api.post(`${RESERVAS_BASE}/aceptar`, {
      cursoId,
      estudianteId,
      inicio
    });
  },

  // Rechazar una reserva
  rechazarReserva: async ({ cursoId, estudianteId }) => {
    return await api.post(`${RESERVAS_BASE}/rechazar`, {
      cursoId,
      estudianteId
    });
  },

  // Marcar reserva como completada
  marcarReservaCompletada: async ({ cursoId }) => {
    return await api.post(`${RESERVAS_BASE}/completar`, {
      cursoId
    });
  },

  // Obtener estado de reserva para un chat
  getEstadoReservaChat: async ({ cursoId, estudianteId }) => {
    return await api.get(`${RESERVAS_BASE}/estado`, {
      params: { cursoId, estudianteId }
    });
  },

  // Verificar disponibilidad de cupos para un curso
  verificarDisponibilidad: async (cursoId, usuarioId) => {
    return await api.get(`${RESERVAS_BASE}/disponibilidad/${cursoId}`, {
      params: { id_usuario: usuarioId }
    });
  }
};

export default reservasAPI;