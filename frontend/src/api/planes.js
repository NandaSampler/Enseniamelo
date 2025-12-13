import api from "./config";

export const planesAPI = {
  getPlanes: () => api.get("/planes"),
  getMiSuscripcion: () => api.get("/planes/mi-suscripcion"),
  crearSesionPago: (id_plan) => api.post("/planes/crear-sesion", { id_plan }),
  crearPlan: (payload) => api.post("/planes", payload),
  cancelarSuscripcion: () => api.post("/planes/cancelar-suscripcion"),
};
