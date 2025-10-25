import axios from 'axios';

const API_URL = '/v1/auth';

export default {
  register(userData) {
    return axios.post(`${API_URL}/register`, {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      telefono: userData.telefono,
      contrasenia: userData.password
    });
  },

  login(credentials) {
    return axios.post(`${API_URL}/login`, {
      email: credentials.email,
      contrasenia: credentials.password
    });
  },

  getCurrentUser(userId) {
    return axios.get(`${API_URL}/me/${userId}`);
  },

  saveUser(user) {
    const userData = {
      id: user.id,
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      foto: user.foto
    };
    return userData;
  },

  logout() {
    return axios.post(`${API_URL}/logout`);
  }
}