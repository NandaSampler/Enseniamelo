// frontend/src/api/comentarios.js
import api from './config';

// Ruta base del servicio de comentarios a través del gateway
const COMENTARIOS_BASE = '/api/comentario-curso';

export const comentariosAPI = {
  // Obtener todos los comentarios
  getComentarios: async () => {
    return await api.get(COMENTARIOS_BASE);
  },

  // Obtener un comentario por ID
  getComentario: async (id) => {
    return await api.get(`${COMENTARIOS_BASE}/${id}`);
  },

  // Obtener comentarios de un curso específico
  getComentariosByCurso: async (idCurso) => {
    return await api.get(`${COMENTARIOS_BASE}/curso/${idCurso}`);
  },

  // Obtener comentarios de un usuario específico
  getComentariosByUsuario: async (idUsuario) => {
    return await api.get(`${COMENTARIOS_BASE}/usuario/${idUsuario}`);
  },

  // Obtener mis comentarios (usuario autenticado)
  getMisComentarios: async () => {
    return await api.get(`${COMENTARIOS_BASE}/mis-comentarios`);
  },

  // Obtener promedio de clasificación de un curso
  getPromedioClasificacion: async (idCurso) => {
    return await api.get(`${COMENTARIOS_BASE}/curso/${idCurso}/promedio`);
  },

  // Crear un nuevo comentario
  createComentario: async (comentarioData) => {
    return await api.post(COMENTARIOS_BASE, comentarioData);
  },

  // Actualizar un comentario existente
  updateComentario: async (id, comentarioData) => {
    return await api.put(`${COMENTARIOS_BASE}/${id}`, comentarioData);
  },

  // Eliminar un comentario
  deleteComentario: async (id) => {
    return await api.delete(`${COMENTARIOS_BASE}/${id}`);
  }
};

export default comentariosAPI;