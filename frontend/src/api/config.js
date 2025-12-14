// frontend/src/api/config.js
import axios from "axios";

// En DEV usamos el proxy de Vite: /api -> gateway
// En PROD puedes setear VITE_API_BASE_URL="https://tu-dominio.com"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Keycloak token endpoint (mejor por env para PROD)
const KEYCLOAK_TOKEN_URL =
  import.meta.env.VITE_KEYCLOAK_TOKEN_URL ||
  "http://localhost:8080/realms/enseniamelo-realm/protocol/openid-connect/token";

const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "react-web-client";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// ✅ helper: busca token en varios lugares típicos
function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    null
  );
}

function getRefreshToken() {
  return (
    localStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh_token") ||
    null
  );
}

// ✅ Añade token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    config.headers = config.headers || {};

    // No fuerces JSON si es FormData (axios lo detecta solo)
    // Solo setea JSON si el caller no puso nada
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Refresh token si 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // Si es error de red (cert/caído), no intentes refresh
    if (error?.code === "ERR_NETWORK") {
      return Promise.reject(error);
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("client_id", KEYCLOAK_CLIENT_ID);
        params.append("refresh_token", refreshToken);

        const tokenResponse = await fetch(KEYCLOAK_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });

        if (!tokenResponse.ok) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const tokenData = await tokenResponse.json();

        // ✅ guarda tokens
        localStorage.setItem("token", tokenData.access_token);
        localStorage.setItem("access_token", tokenData.access_token);
        localStorage.setItem("refresh_token", tokenData.refresh_token);

        // ✅ reintenta request original con nuevo token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
