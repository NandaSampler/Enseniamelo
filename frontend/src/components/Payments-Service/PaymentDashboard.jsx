// src/components/Payments-Service/PaymentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useMemo } from "react";
import axios from "axios";
import "../../styles/Payments-Services/payments.css";

const API_BASE = "https://localhost:8443/api";

export default function PaymentsDashboard() {
  const { keycloak, initialized } = useKeycloak();

  const [planes, setPlanes] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const roles = useMemo(() => keycloak.realmAccess?.roles || [], [keycloak]);
  const isAdmin = useMemo(() => roles.includes("admin"), [roles]);
  const canViewUserData = useMemo(
    () => roles.includes("estudiante") || roles.includes("docente"),
    [roles]
  );

  useEffect(() => {
    // Si no hay token todavía, no hacemos peticiones
    if (!keycloak.token) return;

    setLoading(true);
    setError(null);

    const api = axios.create({
      baseURL: API_BASE,
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        withCredentials: false
      },
    });

    const fetchData = async () => {
      try {
        console.log("Roles del usuario:", roles);
        console.log("Token (primeros 20 chars):", keycloak.token.substring(0, 20) + "...");

        if (canViewUserData) {
          const [planesRes, susRes] = await Promise.all([
            api.get("/v1/mensaje"),
            api.get("/v1/chat"),
          ]);

          console.log("Respuesta /v1/mensaje:", planesRes.data);
          console.log("Respuesta /v1/chat:", susRes.data);

          setPlanes(planesRes.data);
          setSuscripciones(susRes.data);
        }
      } catch (err) {
        console.error("Error llamando a la API de chats:", err);
        setError("Error cargando datos de Mensajes Service. Revisa la consola del navegador.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keycloak.token, canViewUserData, isAdmin]);

  // 1) Mientras Keycloak inicializa
  if (!initialized) {
    return <p className="payments-dashboard">Cargando sesión...</p>;
  }

  // 2) Si por alguna razón no está autenticado
  if (!keycloak || !keycloak.authenticated) {
    return <p className="payments-dashboard">No autenticado...</p>;
  }

  return (
    <div className="payments-dashboard">
      <h1>Mensajes Service</h1>
      <p>Usuario: {keycloak.tokenParsed?.preferred_username}</p>
      <p>Roles: {roles.join(", ") || "(sin roles de realm)"}</p>

      <button
        onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
        className="logout-button"
      >
        Cerrar sesión
      </button>

      {loading && <p>Cargando datos del microservicio de mensajes...</p>}
      {error && <p className="error">{error}</p>}

      {/* MENSAJES */}
      <section>
        <h2>Mensajes</h2>
        {!canViewUserData ? (
          <p className="no-access">No tienes permiso para ver mensajes (requiere rol ESTUDIANTE o DOCENTE)</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Contenido</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Chat ID</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.contenido}</td>
                  <td>{m.estado}</td>
                  <td>{m.fecha}</td>
                  <td>{m.hora}</td>
                  <td>{m.chatId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* CHATS */}
      <section>
        <h2>Chats</h2>
        {!canViewUserData ? (
          <p className="no-access">No tienes permiso para ver chats (requiere rol ESTUDIANTE o DOCENTE)</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Creación</th>
                <th>Usuario Emisor</th>
                <th>Usuario Receptor</th>
              </tr>
            </thead>
            <tbody>
              {suscripciones.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.fechaCreacion}</td>
                  <td>{c.usuario_emisor}</td>
                  <td>{c.usuario_receptor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
