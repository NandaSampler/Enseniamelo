// frontend/src/api/planes.js
import api from "./config";

const PAYMENTS_PREFIX = "/ms-payments/v1";

export const planesAPI = {
  // Planes
  getPlanes: () => api.get(`${PAYMENTS_PREFIX}/planes/`),

  // ✅ Suscripciones (filtrables)
  getSuscripciones: (params) => api.get(`${PAYMENTS_PREFIX}/suscripciones/`, { params }),

  // ✅ Alias que tu UI ya está intentando usar
  getMiSuscripcion: (id_usuario) =>
    api.get(`${PAYMENTS_PREFIX}/suscripciones/`, { params: { id_usuario } }),

  // Stripe checkout
  crearCheckoutStripe: ({ id_plan, inicio }) =>
    api.post(`${PAYMENTS_PREFIX}/stripe/checkout-session`, { id_plan, inicio }),
};
