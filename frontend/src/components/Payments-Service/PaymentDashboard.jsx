<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import "../../styles/Payments-Services/payments.css";

const API_BASE = "https://localhost:8443/ms-payments";
=======
// src/components/Payments-Service/PaymentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useMemo } from "react";
import axios from "axios";
import "../../styles/Payments-Services/payments.css";

const API_BASE = "https://localhost:8443/api";
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662

export default function PaymentsDashboard() {
  const { keycloak, initialized } = useKeycloak();

  const [planes, setPlanes] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
<<<<<<< HEAD
  const [pagos, setPagos] = useState([]);
=======
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // Roles 
  const roles = keycloak?.realmAccess?.roles || [];
  const isAdmin = roles.includes("ADMIN");
  const canViewUserData = roles.includes("USER") || roles.includes("TUTOR");

  const handleLogout = () => {
    if (!keycloak) return;
    keycloak.logout({
      redirectUri: window.location.origin, 
    });
  };

  useEffect(() => {
    if (!initialized || !keycloak?.authenticated || !keycloak.token) return;
=======
  const roles = useMemo(() => keycloak.realmAccess?.roles || [], [keycloak]);
  const isAdmin = useMemo(() => roles.includes("admin"), [roles]);
  const canViewUserData = useMemo(
    () => roles.includes("estudiante") || roles.includes("docente"),
    [roles]
  );

  useEffect(() => {
    // Si no hay token todavía, no hacemos peticiones
    if (!keycloak.token) return;
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662

    setLoading(true);
    setError(null);

    const api = axios.create({
      baseURL: API_BASE,
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
<<<<<<< HEAD
=======
        withCredentials: false
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
      },
    });

    const fetchData = async () => {
      try {
<<<<<<< HEAD
        if (canViewUserData) {
          const [planesRes, susRes] = await Promise.all([
            api.get("/v1/planes/"),
            api.get("/v1/suscripciones/"),
          ]);

          setPlanes(planesRes.data);
          setSuscripciones(susRes.data);
        }

        if (isAdmin) {
          const pagosRes = await api.get("/v1/pagos/");
          setPagos(pagosRes.data);
        }
      } catch (err) {
        console.error("Error llamando a Payments:", err);
        setError("Hubo un error cargando los datos.");
=======
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
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
      } finally {
        setLoading(false);
      }
    };

    fetchData();
<<<<<<< HEAD
  }, [initialized, keycloak?.authenticated, keycloak?.token, isAdmin, canViewUserData]);


  if (!initialized) return <p className="payments-dashboard">Cargando sesión...</p>;

  if (!keycloak?.authenticated)
    return <p className="payments-dashboard">No autenticado...</p>;

  return (
    <div className="payments-dashboard">
      {/* encabezado + logout */}
      <div className="payments-header">
        <div>
          <h1>Payments Service</h1>
          <p>Usuario: {keycloak.tokenParsed?.preferred_username}</p>
          <p>Roles: {roles.join(", ") || "(sin roles)"}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {loading && <p>Cargando datos del microservicio...</p>}
      {error && <p className="error">{error}</p>}

      {/* PLANES */}
      <section>
        <h2>Planes</h2>
        {!canViewUserData ? (
          <p className="no-access">No tienes permiso para ver planes.</p>
=======
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
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
        ) : (
          <table>
            <thead>
              <tr>
<<<<<<< HEAD
                <th>ID</th><th>Nombre</th><th>Precio</th><th>Duración</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.nombre}</td><td>{p.precio}</td>
                  <td>{p.duracion}</td><td>{p.estado}</td>
=======
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
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

<<<<<<< HEAD
      {/* SUSCRIPCIONES */}
      <section>
        <h2>Suscripciones</h2>
        {!canViewUserData ? (
          <p className="no-access">No tienes permiso.</p>
=======
      {/* CHATS */}
      <section>
        <h2>Chats</h2>
        {!canViewUserData ? (
          <p className="no-access">No tienes permiso para ver chats (requiere rol ESTUDIANTE o DOCENTE)</p>
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
        ) : (
          <table>
            <thead>
              <tr>
<<<<<<< HEAD
                <th>ID</th><th>User</th><th>Plan</th>
                <th>Inicio</th><th>Fin</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {suscripciones.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.user_id}</td>
                  <td>{s.plan_id}</td>
                  <td>{s.inicio_iso}</td>
                  <td>{s.fin_iso}</td>
                  <td>{s.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* PAGOS */}
      <section>
        <h2>Pagos</h2>
        {!isAdmin ? (
          <p className="no-access">Solo ADMIN puede ver pagos.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Suscripción</th><th>Monto</th>
                <th>Método</th><th>Estado</th><th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.suscripcion_id}</td>
                  <td>{p.monto}</td>
                  <td>{p.metodo}</td>
                  <td>{p.estado}</td>
                  <td>{p.provider_ref}</td>
=======
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
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
