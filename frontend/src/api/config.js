// frontend/src/api/config.js
import axios from "axios";

// ✅ SIEMPRE usar /api (en dev con proxy, y en prod detrás de gateway/nginx)
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim()) ||
  "/api";

const KEYCLOAK_TOKEN_URL =
  import.meta.env.VITE_KEYCLOAK_TOKEN_URL ||
  "http://localhost:8080/realms/enseniamelo-realm/protocol/openid-connect/token";

const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "react-web-client";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

function normalizeToken(raw) {
  if (!raw) return null;

  let t = String(raw).trim();

  // quita comillas si quedó guardado como JSON string
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }

  // si ya viene "Bearer xxx", deja solo el token
  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }

  return t || null;
}

function getAccessToken() {
  return normalizeToken(
    localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("token")
  );
}

function getRefreshToken() {
  return normalizeToken(
    localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token")
  );
}

// ✅ Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    config.headers = config.headers || {};

    // ✅ NO setear Content-Type en GET/HEAD
    const method = (config.method || "get").toLowerCase();
    const isBodyMethod = ["post", "put", "patch", "delete"].includes(method);

    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isBodyMethod && !isFormData && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
    else delete config.headers.Authorization;

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (error?.code === "ERR_NETWORK") return Promise.reject(error);
    if (!originalRequest) return Promise.reject(error);

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

        const newAccess = normalizeToken(tokenData.access_token);
        const newRefresh = normalizeToken(tokenData.refresh_token);

        localStorage.setItem("token", newAccess || "");
        localStorage.setItem("access_token", newAccess || "");
        localStorage.setItem("refresh_token", newRefresh || "");

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

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
