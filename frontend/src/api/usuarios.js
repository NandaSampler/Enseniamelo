// frontend/src/api/usuarios.js
import api from "./config";

const USUARIO_BASE = "/v1/usuario";
const TUTOR_BASE = "/v1/tutores";

export const usuariosAPI = {
  // Obtener usuario específico
  getUsuario: async (id) => {
    return await api.get(`${USUARIO_BASE}/${id}`);
  },

  // Obtener todos los usuarios (admin) - CORREGIDO: usa /v1/usuario sin 's'
  getUsuarios: async () => {
    return await api.get(USUARIO_BASE);
  },

  // Actualizar usuario (admin)
  updateUsuario: async (id, data) => {
    return await api.put(`${USUARIO_BASE}/${id}`, data);
  },

  // Cambiar rol de usuario (admin)
  cambiarRol: async (id, rol) => {
    return await api.put(`${USUARIO_BASE}/${id}/rol`, { rol });
  },

  // Eliminar usuario (admin)
  deleteUsuario: async (id) => {
    return await api.delete(`${USUARIO_BASE}/${id}`);
  },

  // Obtener perfil de tutor por ID de usuario
  obtenerPerfilTutorPorUsuario: async (idUsuario) => {
    return await api.get(`${TUTOR_BASE}/usuario/${idUsuario}`);
  },

  // Obtener perfil de tutor por ID del perfil
  obtenerPerfilTutor: async (idTutor) => {
    return await api.get(`${TUTOR_BASE}/${idTutor}`);
  },
};

export default usuariosAPI;