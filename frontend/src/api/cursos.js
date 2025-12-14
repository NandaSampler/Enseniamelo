// frontend/src/api/cursos.js
import api from "./config";

const CURSOS_BASE = "/curso/api/v1/cursos/";
const CATEGORIAS_BASE = "/curso/api/v1/categorias/";
const HORARIOS_BASE = "/curso/api/v1/horarios/";
const TUTOR_BASE = "/curso/api/v1/tutor/";

export const cursosAPI = {
  getCursos: async () => api.get(CURSOS_BASE),
  getCurso: async (id) => api.get(`${CURSOS_BASE}${id}`),

  createCurso: async (cursoData) => api.post(CURSOS_BASE, cursoData),
  updateCurso: async (id, cursoData) => api.put(`${CURSOS_BASE}${id}`, cursoData),
  deleteCurso: async (id) => api.delete(`${CURSOS_BASE}${id}`),

  // ✅ ESTE ES EL BUENO (tu FastAPI router)
  getMisCursos: async () => api.get(`${TUTOR_BASE}mis-cursos`),

  buscarCursos: async (query) => api.get(CURSOS_BASE, { params: { q: query } }),
  getCursosPorTutor: async (tutor_id) => api.get(CURSOS_BASE, { params: { tutor_id } }),

  addCategoria: async (cursoId, categoriaId) =>
    api.post(`${CURSOS_BASE}${cursoId}/categorias`, {
      curso_id: cursoId,
      categoria_id: categoriaId,
    }),

  getCategorias: async (cursoId) => api.get(`${CURSOS_BASE}${cursoId}/categorias`),
  removeCategoria: async (cursoId, categoriaId) =>
    api.delete(`${CURSOS_BASE}${cursoId}/categorias/${categoriaId}`),
};

export const categoriasAPI = {
  getCategorias: async () => api.get(CATEGORIAS_BASE),
  getCategoria: async (id) => api.get(`${CATEGORIAS_BASE}${id}`),

  createCategoria: async (categoriaData) => api.post(CATEGORIAS_BASE, categoriaData),
  updateCategoria: async (id, categoriaData) =>
    api.put(`${CATEGORIAS_BASE}${id}`, categoriaData),
  deleteCategoria: async (id) => api.delete(`${CATEGORIAS_BASE}${id}`),

  getCursosPorCategoria: async (categoriaId) =>
    api.get(`${CATEGORIAS_BASE}${categoriaId}/cursos`),
};

export const horariosAPI = {
  getHorarios: async (params = {}) => api.get(HORARIOS_BASE, { params }),
  getHorario: async (id) => api.get(`${HORARIOS_BASE}${id}`),

  createHorario: async (horarioData) => api.post(HORARIOS_BASE, horarioData),
  updateHorario: async (id, horarioData) => api.put(`${HORARIOS_BASE}${id}`, horarioData),
  deleteHorario: async (id) => api.delete(`${HORARIOS_BASE}${id}`),
};

export default cursosAPI;
