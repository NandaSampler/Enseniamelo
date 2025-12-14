// frontend/src/api/cursos.js
import api from './config';

// Rutas a través del gateway (según configuración)
const CURSOS_BASE = '/curso/api/v1/cursos';
const CATEGORIAS_BASE = '/curso/api/v1/categorias';
const HORARIOS_BASE = '/curso/api/v1/horarios';

// ============================================
// API DE CURSOS
// ============================================
export const cursosAPI = {
  // Obtener todos los cursos (público)
  getCursos: async () => {
    return await api.get(CURSOS_BASE);
  },

  // Obtener un curso por ID
  getCurso: async (id) => {
    return await api.get(`${CURSOS_BASE}/${id}`);
  },

  // Obtener curso con detalles del tutor
  getCursoDetalles: async (id) => {
    return await api.get(`${CURSOS_BASE}/${id}/detalles`);
  },

  // Crear un nuevo curso (requiere autenticación de tutor)
  createCurso: async (cursoData) => {
    return await api.post(CURSOS_BASE, cursoData);
  },

  // Actualizar un curso existente
  updateCurso: async (id, cursoData) => {
    return await api.put(`${CURSOS_BASE}/${id}`, cursoData);
  },

  // Eliminar un curso
  deleteCurso: async (id) => {
    return await api.delete(`${CURSOS_BASE}/${id}`);
  },

  // Obtener cursos del tutor autenticado
  getMisCursos: async () => {
    return await api.get(`${CURSOS_BASE}`, {
      params: {
        // El backend debería filtrar por el tutor autenticado basándose en el token
      }
    });
  },

  // Buscar cursos por query
  buscarCursos: async (query) => {
    return await api.get(CURSOS_BASE, {
      params: { q: query }
    });
  },

  // Filtrar cursos por tutor
  getCursosPorTutor: async (id_tutor) => {
    return await api.get(CURSOS_BASE, {
      params: { id_tutor }
    });
  },

  // Operaciones de categorías del curso
  addCategoria: async (cursoId, categoriaId) => {
    return await api.post(`${CURSOS_BASE}/${cursoId}/categorias`, {
      curso_id: cursoId,
      categoria_id: categoriaId
    });
  },

  getCategorias: async (cursoId) => {
    return await api.get(`${CURSOS_BASE}/${cursoId}/categorias`);
  },

  removeCategoria: async (cursoId, categoriaId) => {
    return await api.delete(`${CURSOS_BASE}/${cursoId}/categorias/${categoriaId}`);
  }
};

// ============================================
// API DE CATEGORÍAS
// ============================================
export const categoriasAPI = {
  // Obtener todas las categorías
  getCategorias: async () => {
    return await api.get(CATEGORIAS_BASE);
  },

  // Obtener una categoría por ID
  getCategoria: async (id) => {
    return await api.get(`${CATEGORIAS_BASE}/${id}`);
  },

  // Crear una nueva categoría (admin)
  createCategoria: async (categoriaData) => {
    return await api.post(CATEGORIAS_BASE, categoriaData);
  },

  // Actualizar una categoría
  updateCategoria: async (id, categoriaData) => {
    return await api.put(`${CATEGORIAS_BASE}/${id}`, categoriaData);
  },

  // Eliminar una categoría
  deleteCategoria: async (id) => {
    return await api.delete(`${CATEGORIAS_BASE}/${id}`);
  },

  // Obtener cursos de una categoría
  getCursosPorCategoria: async (categoriaId) => {
    return await api.get(`${CATEGORIAS_BASE}/${categoriaId}/cursos`);
  }
};

// ============================================
// API DE HORARIOS
// ============================================
export const horariosAPI = {
  // Obtener todos los horarios
  getHorarios: async (params = {}) => {
    return await api.get(HORARIOS_BASE, { params });
  },

  // Obtener un horario por ID
  getHorario: async (id) => {
    return await api.get(`${HORARIOS_BASE}/${id}`);
  },

  // Crear un nuevo horario
  createHorario: async (horarioData) => {
    return await api.post(HORARIOS_BASE, horarioData);
  },

  // Actualizar un horario
  updateHorario: async (id, horarioData) => {
    return await api.put(`${HORARIOS_BASE}/${id}`, horarioData);
  },

  // Eliminar un horario
  deleteHorario: async (id) => {
    return await api.delete(`${HORARIOS_BASE}/${id}`);
  }
};

export default cursosAPI;