// frontend/src/api/planes.js
import api from "./config";

const PAYMENTS_PREFIX = "/ms-payments/v1";

export const planesAPI = {
  // Planes
  getPlanes: () => api.get(`${PAYMENTS_PREFIX}/planes/`),

  // Suscripciones (si las sigues usando)
  getMisSuscripciones: () => api.get(`${PAYMENTS_PREFIX}/suscripciones/mias`),

  // ✅ NUEVO: crear sesión de checkout Stripe (gateway -> payments-service)
  crearCheckoutStripe: ({ id_plan, inicio }) =>
    api.post(`${PAYMENTS_PREFIX}/stripe/checkout-session`, { id_plan, inicio }),
};
