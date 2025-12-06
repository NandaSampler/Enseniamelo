import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Keycloak
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./keycloak";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: "login-required",     
        checkLoginIframe: false,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ReactKeycloakProvider>
  </React.StrictMode>
);
