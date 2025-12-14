// frontend/src/api/cursos.js
import api from "./config";

// ✅ Mantén slash final SOLO en el collection endpoint (POST/GET list)
const CURSOS_BASE = "/curso/api/v1/cursos/";
const CATEGORIAS_BASE = "/curso/api/v1/categorias/";
const HORARIOS_BASE = "/curso/api/v1/horarios/";
const TUTOR_BASE = "/curso/api/v1/tutor/";

export const cursosAPI = {
  // Público (GET)
  getCursos: async () => api.get(CURSOS_BASE),

  // ⚠️ IMPORTANTE:
  // Tu backend: @router.get("/{curso_id}") -> NO lleva slash final.
  getCurso: async (id) => api.get(`${CURSOS_BASE}${id}`),

  // Si este endpoint no existe aún, bórralo o crea el endpoint backend
  getCursoDetalles: async (id) => api.get(`${CURSOS_BASE}${id}/detalles`),

  // Tutor/Admin (POST/PUT/DELETE)
  createCurso: async (cursoData) => api.post(CURSOS_BASE, cursoData),

  // Tu backend: @router.put("/{curso_id}") -> NO slash final
  updateCurso: async (id, cursoData) => api.put(`${CURSOS_BASE}${id}`, cursoData),

  // Tu backend: @router.delete("/{curso_id}") -> NO slash final
  deleteCurso: async (id) => api.delete(`${CURSOS_BASE}${id}`),

  // Cursos del tutor autenticado
  getMisCursos: async () => {
    try {
      // si tienes /api/v1/tutor/cursos (ajusta si tu router real es mis-cursos)
      return await api.get(`${TUTOR_BASE}cursos`);
    } catch (err) {
      // fallback si tienes /api/v1/cursos/mis
      return await api.get(`${CURSOS_BASE}mis`);
    }
  },

  buscarCursos: async (query) => api.get(CURSOS_BASE, { params: { q: query } }),

  // ✅ backend espera tutor_id (no id_tutor)
  getCursosPorTutor: async (tutor_id) =>
    api.get(CURSOS_BASE, { params: { tutor_id } }),

  // Operaciones de categorías del curso
  // backend: @router.post("/{curso_id}/categorias") -> no slash final en el decorator
  // pero puedes llamar con slash, FastAPI suele redirigir; mejor sin.
  addCategoria: async (cursoId, categoriaId) =>
    api.post(`${CURSOS_BASE}${cursoId}/categorias`, {
      curso_id: cursoId,
      categoria_id: categoriaId,
    }),

  getCategorias: async (cursoId) => api.get(`${CURSOS_BASE}${cursoId}/categorias`),

  removeCategoria: async (cursoId, categoriaId) =>
    api.delete(`${CURSOS_BASE}${cursoId}/categorias/${categoriaId}`),
};

// ============================================
// API DE CATEGORÍAS
// ============================================
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

// ============================================
// API DE HORARIOS
// ============================================
export const horariosAPI = {
  getHorarios: async (params = {}) => api.get(HORARIOS_BASE, { params }),
  getHorario: async (id) => api.get(`${HORARIOS_BASE}${id}`),

  createHorario: async (horarioData) => api.post(HORARIOS_BASE, horarioData),
  updateHorario: async (id, horarioData) => api.put(`${HORARIOS_BASE}${id}`, horarioData),
  deleteHorario: async (id) => api.delete(`${HORARIOS_BASE}${id}`),
};

export default cursosAPI;
