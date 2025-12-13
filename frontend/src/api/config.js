// frontend/src/api/config.js
import axios from 'axios';

// URL base del gateway
const API_BASE_URL = 'https://localhost:8443';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refrescar token si es necesario
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No hay refresh token, redirigir a login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Intentar refrescar el token
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', 'react-web-client');
        params.append('refresh_token', refreshToken);

        const tokenResponse = await fetch(
          'http://localhost:8080/realms/enseniamelo-realm/protocol/openid-connect/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
          }
        );

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Guardar nuevos tokens
          localStorage.setItem('token', tokenData.access_token);
          localStorage.setItem('access_token', tokenData.access_token);
          localStorage.setItem('refresh_token', tokenData.refresh_token);

          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
          return api(originalRequest);
        } else {
          // No se pudo refrescar el token, cerrar sesión
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Error al refrescar token, cerrar sesión
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;