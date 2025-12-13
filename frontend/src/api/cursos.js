import api from "./config";

export const cursosAPI = {
  getCursos: (params = {}) => api.get("/cursos", { params }),
  createCurso: (data) => api.post("/cursos", data),
  getMisCursos: () => api.get("/cursos/mis"),
};
