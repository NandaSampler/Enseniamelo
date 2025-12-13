// frontend/src/api/index.js

// Exportar la instancia de axios configurada
export { default as api } from './config';

// Exportar todas las APIs
export { authAPI } from './auth';
export { cursosAPI, categoriasAPI, horariosAPI } from './cursos';
export { reservasAPI } from './reservas';
export { chatsAPI } from './chats';
export { planesAPI } from './planes';
export { verificarAPI } from './verificar';
export { uploadsAPI } from './uploads';