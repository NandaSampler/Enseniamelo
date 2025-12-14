// frontend/src/api/verificar.js
import api from "./config";

// Rutas del servicio de verificación a través del gateway
const USUARIO_BASE = "/v1/usuario";

export const usuariosAPI = {
  getUsuario: async (id) => {
    return await api.get(`${USUARIO_BASE}/${id}`);
  },
};
