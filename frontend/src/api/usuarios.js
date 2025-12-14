// frontend/src/api/usuarios.js
import api from "./config";

// Rutas del servicio de usuarios a través del gateway
const USUARIO_BASE = "/v1/usuario";
const TUTOR_BASE = "/v1/tutores";

export const usuariosAPI = {
  getUsuario: async (id) => {
    return await api.get(`${USUARIO_BASE}/${id}`);
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
