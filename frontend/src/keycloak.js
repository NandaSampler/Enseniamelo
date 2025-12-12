// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",              // URL de Keycloak dentro del docker-compose
  realm: "enseniamelo-realm",              // tu realm
  clientId: "frontend-react",            // client del frontend en Keycloak
});

// Promesa compartida para evitar múltiples inicializaciones
let keycloakInitPromise = null;

export function initKeycloak() {
  // Si ya está inicializado (o iniciándose), retorna la misma promesa
  if (keycloakInitPromise) {
    return keycloakInitPromise;
  }

  keycloakInitPromise = keycloak
    .init({
      onLoad: "login-required",
    })
    .then((authenticated) => {
      return authenticated;
    })
    .catch((err) => {
      // Si falla, reseteamos la promesa para permitir reintentos
      keycloakInitPromise = null;
      throw err;
    });

  return keycloakInitPromise;
}

export default keycloak;
