import api from "./config";

export const reservasAPI = {
  createReserva: ({ cursoId }) =>
    api.post("/reservas", { id_curso: cursoId }),

  aceptarReserva: ({ cursoId, estudianteId, inicio }) =>
    api.post("/reservas/aceptar", {
      id_curso: cursoId,
      id_estudiante: estudianteId,
      inicio,
    }),

  getReservasConfirmadasTutor: () =>
    api.get("/reservas/tutor/confirmadas"),

  getEstadoReservaChat: ({ cursoId, estudianteId }) =>
    api.get("/reservas/estado-chat", {
      params: {
        id_curso: cursoId,
        id_estudiante: estudianteId,
      },
    }),

  getMisReservasEstudiante: () =>
    api.get("/reservas/mis"),

  marcarReservaCompletada: ({ cursoId }) =>
    api.post("/reservas/completar", { id_curso: cursoId }),

  rechazarReserva: ({ cursoId, estudianteId }) =>
    api.post("/reservas/rechazar", {
      id_curso: cursoId,
      id_estudiante: estudianteId,
    }),
};
