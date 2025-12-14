import api from "./config";

export const uploadsAPI = {
  uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    // ✅ SIEMPRE con /curso para que pase por el gateway
    return api.post("/curso/api/v1/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
