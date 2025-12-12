import api from "./config";

const getUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // El backend a veces usa _id, pero el login guarda 'id'
    return parsed?._id || parsed?.id || null;
  } catch {
    return null;
  }
};

export const chatsAPI = {
  createChat: ({ cursoId }) => {
    const userId = getUserId();
    return api.post("/chats", { id_curso: cursoId, id_estudiante: userId });
  },

  getChats: () => {
    const userId = getUserId();
    return api.get("/chats", { params: { id_usuario: userId } });
  },

  getMensajes: (chatId) => api.get(`/chats/${chatId}/mensajes`),

  sendMensaje: (chatId, contenido) => {
    const userId = getUserId();
    return api.post(`/chats/${chatId}/mensajes`, { contenido, id_remitente: userId });
  },
};
