// frontend/src/api/planes.js
import api from "./config";

const PAYMENTS_PREFIX = "/ms-payments/v1";

export const planesAPI = {
  // ====== PLANES ======
  getPlanes: () => api.get(`${PAYMENTS_PREFIX}/planes/`),

  // ====== SUSCRIPCIONES ======
  getSuscripciones: (id_usuario) =>
    api.get(`${PAYMENTS_PREFIX}/suscripciones/`, { params: { id_usuario } }),

  crearSuscripcion: (payload) =>
    api.post(`${PAYMENTS_PREFIX}/suscripciones/`, payload),

  cancelarSuscripcion: (sid) =>
    api.put(`${PAYMENTS_PREFIX}/suscripciones/${sid}`, { estado: "cancelada" }),
};
