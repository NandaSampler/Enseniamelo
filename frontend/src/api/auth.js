// frontend/src/api/auth.js
import api from './config';

// Rutas del servicio de usuarios a través del gateway
const AUTH_BASE = '/v1/auth';
const USUARIO_BASE = '/v1/usuario';

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

  // ✅ CORREGIDO: Actualizar perfil usando el endpoint correcto
  updateProfile: async (userId, profileData) => {
    if (!userId) {
      throw new Error('userId es requerido para actualizar el perfil');
    }
    
    // 🔍 DEBUG: Ver qué se está enviando
    console.log('🔍 Actualizando perfil:');
    console.log('   URL:', `${USUARIO_BASE}/${userId}`);
    console.log('   Método: PUT');
    console.log('   Data:', profileData);
    
    try {
      const response = await api.put(`${USUARIO_BASE}/${userId}`, profileData);
      console.log('✅ Respuesta exitosa:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error en updateProfile:');
      console.error('   Status:', error?.response?.status);
      console.error('   Status Text:', error?.response?.statusText);
      console.error('   URL llamada:', error?.config?.url);
      console.error('   Método:', error?.config?.method);
      console.error('   Headers:', error?.config?.headers);
      console.error('   Data enviada:', error?.config?.data);
      console.error('   Respuesta del servidor:', error?.response?.data);
      
      // 🔍 Si es un error 400, mostrar más detalles de validación
      if (error?.response?.status === 400) {
        console.error('📋 Detalles del error 400:');
        console.error('   Mensaje:', error?.response?.data?.message);
        console.error('   Path:', error?.response?.data?.path);
        console.error('   Error:', error?.response?.data?.error);
        console.error('   Timestamp:', error?.response?.data?.timestamp);
      }
      
      throw error;
    }
  },

  // Cambiar contraseña (si tienes un endpoint específico)
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