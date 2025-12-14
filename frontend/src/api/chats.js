// frontend/src/api/chats.js
import api from "./config";

// Rutas del servicio de mensajes a través del gateway
const CHATS_BASE = "api/v1/chat";
const MENSAJES_BASE = "api/v1/mensaje";

export const chatsAPI = {
  // Obtener todos los chats del usuario autenticado
  getChats: async () => {
    return await api.get(CHATS_BASE);
  },

  // Obtener un chat por ID
  getChat: async (id) => {
    return await api.get(`${CHATS_BASE}/${id}`);
  },

  // Crear un nuevo chat
  createChat: async ({ cursoId }) => {
    return await api.post(CHATS_BASE, { cursoId });
  },

  // Obtener mensajes de un chat
  getMensajes: async (chatId) => {
    return await api.get(`${MENSAJES_BASE}/chat/${chatId}`);
  },

  // Enviar un mensaje en un chat
  sendMensaje: async (mensajeDTO) => {
    return await api.post(`${MENSAJES_BASE}`, mensajeDTO);
  },

  // Eliminar un chat
  deleteChat: async (chatId) => {
    return await api.delete(`${CHATS_BASE}/${chatId}`);
  },
};

export default chatsAPI;
