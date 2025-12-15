// frontend/src/api/verificar.js
import api from './config';

// Rutas del servicio de verificación a través del gateway
const VERIFICAR_BASE = '/v1/verificacion';

export const verificarAPI = {
  // ==========================================
  // NUEVOS MÉTODOS - Endpoints completos
  // ==========================================
  
  /**
   * Obtiene todas las solicitudes con información completa
   * (usuario, tutor y curso incluidos) - Para panel de administración
   */
  getSolicitudesCompletas: async () => {
    return await api.get(`${VERIFICAR_BASE}/completas`);
  },

  /**
   * Obtiene una solicitud específica con información completa
   */
  getSolicitudCompletaById: async (id) => {
    return await api.get(`${VERIFICAR_BASE}/${id}/completa`);
  },

  /**
   * Obtiene solicitudes por estado
   */
  getSolicitudesByEstado: async (estado) => {
    return await api.get(`${VERIFICAR_BASE}/estado/${estado}`);
  },

  /**
   * Aprueba una solicitud de verificación
   */
  aprobarSolicitud: async (id, comentario = '') => {
    return await api.put(`${VERIFICAR_BASE}/${id}/aprobar`, {
      comentario,
    });
  },

  /**
   * Rechaza una solicitud de verificación
   */
  rechazarSolicitud: async (id, comentario = 'Solicitud rechazada') => {
    return await api.put(`${VERIFICAR_BASE}/${id}/rechazar`, {
      comentario,
    });
  },

  // ==========================================
  // MÉTODOS EXISTENTES (mantenidos)
  // ==========================================
  
  // Crear una nueva solicitud de verificación (multipart)
  crearSolicitud: async (formData) => {
    return await api.post(VERIFICAR_BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Crear solicitud para curso (JSON)
  crearSolicitudCurso: async (payload) => {
    return await api.post(`${VERIFICAR_BASE}/curso`, payload);
  },

  // Obtener todas las solicitudes (admin) - Datos básicos
  getSolicitudes: async () => {
    return await api.get(VERIFICAR_BASE);
  },

  // Obtener una solicitud por ID - Datos básicos
  getSolicitud: async (id) => {
    return await api.get(`${VERIFICAR_BASE}/${id}`);
  },

  // Obtener solicitudes del tutor autenticado
  getMisSolicitudes: async () => {
    return await api.get(`${VERIFICAR_BASE}/mis-solicitudes`);
  },

  // Cambiar estado de una solicitud (admin) - Método genérico
  cambiarEstado: async (id, data) => {
    // Redirigir al método apropiado según el estado
    const estado = data.estado?.toLowerCase();
    const comentario = data.comentario || '';

    if (estado === 'aceptado' || estado === 'aprobado') {
      return await verificarAPI.aprobarSolicitud(id, comentario);
    } else if (estado === 'rechazado') {
      return await verificarAPI.rechazarSolicitud(id, comentario);
    }
    
    // Fallback al endpoint antiguo si existe
    return await api.put(`${VERIFICAR_BASE}/${id}/estado`, data);
  },

  // Actualizar comentario de una solicitud
  actualizarComentario: async (id, comentario) => {
    return await api.put(`${VERIFICAR_BASE}/${id}/comentario`, {
      comentario
    });
  },

  // Eliminar una solicitud
  eliminarSolicitud: async (id) => {
    return await api.delete(`${VERIFICAR_BASE}/${id}`);
  }
};

export default verificarAPI;