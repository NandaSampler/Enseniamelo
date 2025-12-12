import api from "./config";

export const authAPI = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  register: (userData) =>
    api.post("/auth/register", userData),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (data) => api.put("/auth/profile", data),

  uploadTutorDocuments: (formData) =>
    api.post("/auth/tutor/documentos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
