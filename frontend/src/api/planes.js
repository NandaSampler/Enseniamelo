// frontend/src/api/planes.js
import api from "./config";

const PAYMENTS_PREFIX = "/ms-payments/v1";

export const planesAPI = {
  // GET todos los planes
  getPlanes: () => api.get(`${PAYMENTS_PREFIX}/planes/`),

  // ADMIN
  crearPlan: (payload) =>
    api.post(`${PAYMENTS_PREFIX}/planes/`, payload),

  actualizarPlan: (id, payload) =>
    api.put(`${PAYMENTS_PREFIX}/planes/${id}`, payload),

  eliminarPlan: (id) =>
    api.delete(`${PAYMENTS_PREFIX}/planes/${id}`),

  // Suscripciones (filtrables)
  getSuscripciones: (params) => api.get(`${PAYMENTS_PREFIX}/suscripciones/`, { params }),

  //  Alias ya está intentando usar
  getMiSuscripcion: (id_usuario) =>
    api.get(`${PAYMENTS_PREFIX}/suscripciones/`, { params: { id_usuario } }),

  // Stripe checkout
  crearCheckoutStripe: ({ id_plan, inicio }) =>
    api.post(`${PAYMENTS_PREFIX}/stripe/checkout-session`, { id_plan, inicio }),

  // Cancelar suscripción (estado → cancelada)
  cancelarSuscripcion: (sid) =>
    api.put(`${PAYMENTS_PREFIX}/suscripciones/${sid}`, {
      estado: "cancelada",
    }),
};
