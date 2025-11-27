// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",              // URL de Keycloak
  realm: "enseniamelo",               // tu realm
  clientId: "enseniamelo-front-client",             // el client que creaste en Keycloak
});

export default keycloak;
