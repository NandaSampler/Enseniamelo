import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'enseniamelo-realm',
  clientId: 'enseniamelo-frontend', 
});

export default keycloak;
