import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import "../../styles/Payments-Services/payments.css";

const API_BASE = "https://localhost:8443/ms-payments";

export default function PaymentsDashboard() {
  const { keycloak, initialized } = useKeycloak();

  const [planes, setPlanes] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [pagos, setPagos] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

    setLoading(true);
    setError(null);

    const api = axios.create({
      baseURL: API_BASE,
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });

    const fetchData = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Precio</th><th>Duración</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.nombre}</td><td>{p.precio}</td>
                  <td>{p.duracion}</td><td>{p.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* SUSCRIPCIONES */}
      <section>
        <h2>Suscripciones</h2>
        {!canViewUserData ? (
          <p className="no-access">No tienes permiso.</p>
        ) : (
          <table>
            <thead>
              <tr>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
