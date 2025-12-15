// frontend/src/api/chats.js
import api from "./config";

// Gateway
const CHATS_BASE = "api/v1/chat";
const MENSAJES_BASE = "api/v1/mensaje";

export const chatsAPI = {
  getChats: async () => {
    return await api.get(CHATS_BASE);
  },

  getChat: async (id) => {
    return await api.get(`${CHATS_BASE}/${id}`);
  },

  createChat: async (payload) => {
    const body = payload || {};

    // compatibilidad
    const id_curso = body.id_curso || body.idCurso || body.cursoId || null;
    const participantes = Array.isArray(body.participantes)
      ? body.participantes
      : undefined;
    const ultimoMensaje = body.ultimoMensaje ?? undefined;

    console.log("Creating chat with:", {
      id_curso,
      participantes,
      ultimoMensaje,
    });

    const req = {};
    if (id_curso) req.id_curso = id_curso;
    if (participantes) req.participantes = participantes;
    if (ultimoMensaje !== undefined) req.ultimoMensaje = ultimoMensaje;

    return await api.post(CHATS_BASE, req);
  },

  getMensajes: async (chatId) => {
    return await api.get(`${MENSAJES_BASE}/chat/${chatId}`);
  },

  sendMensaje: async (mensajeDTO) => {
    return await api.post(MENSAJES_BASE, mensajeDTO);
  },

  deleteChat: async (chatId) => {
    return await api.delete(`${CHATS_BASE}/${chatId}`);
  },
};

export default chatsAPI;
