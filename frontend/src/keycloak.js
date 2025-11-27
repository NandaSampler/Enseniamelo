// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",       // tu Keycloak
  realm: "enseniamelo-realm",        // tu realm
  clientId: "frontend-react",        // tu client en Keycloak
});

// Promesa compartida para evitar múltiples inits
let keycloakInitPromise = null;

export function initKeycloak() {
  // Si ya se inició (o se está iniciando), devuelve la misma promesa
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
      // Si falla, reseteamos la promesa para poder reintentar si hace falta
      keycloakInitPromise = null;
      throw err;
    });

  return keycloakInitPromise;
}

export default keycloak;
