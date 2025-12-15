// frontend/src/api/auth.js
import api from './config';

// Rutas del servicio de usuarios a través del gateway
const AUTH_BASE = '/v1/auth';

export const authAPI = {
  // Registrar un nuevo usuario
  register: async (userData) => {
    return await api.post(`${AUTH_BASE}/register`, userData);
  },

  // Login (aunque ya se hace directo a Keycloak, esto podría ser útil)
  login: async (credentials) => {
    return await api.post(`${AUTH_BASE}/login`, credentials);
  },

  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    return await api.get(`${AUTH_BASE}/me`);
  },

  // Actualizar perfil del usuario autenticado
  updateProfile: async (profileData) => {
    return await api.put(`${AUTH_BASE}/me`, profileData);
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    return await api.put(`${AUTH_BASE}/me/password`, passwordData);
  },

  // Verificar token
  verifyToken: async () => {
    return await api.get(`${AUTH_BASE}/verify`);
  },

  // Logout (limpiar sesión en el backend si es necesario)
  logout: async () => {
    return await api.post(`${AUTH_BASE}/logout`);
  }
};

export function hasRole(role) {
  try {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) return false;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const roles = payload?.realm_access?.roles || [];

    return roles.includes(role);
  } catch {
    return false;
  }
}


export default authAPI;