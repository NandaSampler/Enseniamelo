import api from "./config";

export const uploadsAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
