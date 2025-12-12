// src/components/Payments-Service/LoginKeycloak.jsx
import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

const LoginKeycloak = () => {
  const { keycloak } = useKeycloak();

  useEffect(() => {
    if (!keycloak.authenticated) {
      keycloak.login({
        redirectUri: window.location.origin, // vuelve a la raíz después de login
      });
    }
  }, [keycloak]);

  return <p>Redirigiendo a la página de inicio de sesión...</p>;
};

export default LoginKeycloak;
