// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://keycloak:8080",              // URL de Keycloak
  realm: "enseniamelo-realm",               // tu realm
  clientId: "react-web-client",             // el client que creaste en Keycloak
});

export default keycloak;
