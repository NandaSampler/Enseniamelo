import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'enseniamelo-realm',
  clientId: 'enseniamelo-frontend', // <-- EXACTAMENTE el Client ID que creaste
});

export default keycloak;
