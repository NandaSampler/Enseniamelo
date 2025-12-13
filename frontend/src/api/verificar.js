// frontend/src/api/verificar.js
import api from './config';

// Rutas del servicio de verificación a través del gateway
const VERIFICAR_BASE = '/v1/verificacion';

export const verificarAPI = {
  // Crear una nueva solicitud de verificación
  crearSolicitud: async (formData) => {
    return await api.post(VERIFICAR_BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Obtener todas las solicitudes (admin)
  getSolicitudes: async () => {
    return await api.get(VERIFICAR_BASE);
  },

  // Obtener una solicitud por ID
  getSolicitud: async (id) => {
    return await api.get(`${VERIFICAR_BASE}/${id}`);
  },

  // Obtener solicitudes del tutor autenticado
  getMisSolicitudes: async () => {
    return await api.get(`${VERIFICAR_BASE}/mis-solicitudes`);
  },

  // Cambiar estado de una solicitud (admin)
  cambiarEstado: async (id, data) => {
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