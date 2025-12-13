import api from "./config";

export const verificarAPI = {
  getSolicitudes: (params = {}) => api.get("/verificar", { params }),
  cambiarEstado: (id, data) => api.patch(`/verificar/${id}/estado`, data),
  crearSolicitud: (formData) =>
    api.post("/verificar/solicitud", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
