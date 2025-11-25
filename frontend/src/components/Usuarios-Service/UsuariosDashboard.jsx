import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import "../../styles/Users-Services/users.css";

const API_BASE = "https://localhost:8443";

export default function UsersDashboard() {
  const { keycloak, initialized } = useKeycloak();

  // ---- HOOKS (siempre primeros) ----
  const [usuarios, setUsuarios] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [verificaciones, setVerificaciones] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const roles = keycloak?.realmAccess?.roles || [];
  const isAdmin = roles.includes("ADMIN");
  const isUser = roles.includes("USER");
  const isTutor = roles.includes("TUTOR");

  // ---- EFFECTS ----
  useEffect(() => {
    if (!initialized || !keycloak?.authenticated || !keycloak.token) return;

    setLoading(true);
    setError(null);

    const headers = {
      Authorization: `Bearer ${keycloak.token}`,
      "Content-Type": "application/json",
    };

    const fetchData = async () => {
      try {
        const userId = keycloak.tokenParsed?.sub;

        if (userId) {
          const userRes = await fetch(`${API_BASE}/v1/auth/me/${userId}`, { headers });
          if (userRes.ok) setCurrentUser(await userRes.json());
        }

        if (isAdmin || isUser) {
          const usuariosRes = await fetch(`${API_BASE}/v1/usuario`, { headers });
          if (usuariosRes.ok) setUsuarios(await usuariosRes.json());
        }

        const tutoresRes = await fetch(`${API_BASE}/v1/tutores`, { headers });
        if (tutoresRes.ok) setTutores(await tutoresRes.json());

        if (isAdmin) {
          const verificacionesRes = await fetch(`${API_BASE}/v1/verificacion`, { headers });
          if (verificacionesRes.ok) setVerificaciones(await verificacionesRes.json());
        }

      } catch (err) {
        setError("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialized, keycloak, isAdmin, isUser, isTutor]);

  // ---- RETURNS (después de HOOKS) ----
  if (!initialized) {
    return <p className="users-dashboard">Cargando sesión...</p>;
  }

  if (!keycloak || !keycloak.authenticated) {
    return <p className="users-dashboard">No autenticado...</p>;
  }


  return (
    <div className="users-dashboard">
      <h1>Users Service</h1>
      
      <div className="user-info">
        <p><strong>Usuario:</strong> {keycloak.tokenParsed?.preferred_username}</p>
        <p><strong>Email:</strong> {keycloak.tokenParsed?.email}</p>
        <p><strong>Roles:</strong> {roles.join(", ") || "(sin roles de realm)"}</p>
      </div>

      {loading && <p>Cargando datos del microservicio de usuarios...</p>}
      {error && <p className="error">{error}</p>}

      {/* USUARIO ACTUAL */}
      {currentUser && (
        <section>
          <h2>Mi Perfil</h2>
          <div className="profile-card">
            <div className="profile-grid">
              <div className="profile-item">
                <span className="label">ID Usuario</span>
                <span className="value">{currentUser.idUsuario}</span>
              </div>
              <div className="profile-item">
                <span className="label">Email</span>
                <span className="value">{currentUser.email}</span>
              </div>
              <div className="profile-item">
                <span className="label">Nombre</span>
                <span className="value">{currentUser.nombre || "N/A"}</span>
              </div>
              <div className="profile-item">
                <span className="label">Mensaje</span>
                <span className="value">{currentUser.mensaje || "N/A"}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* USUARIOS */}
      <section>
        <h2>Usuarios</h2>
        {!isAdmin && !isUser ? (
          <p className="no-access">No tienes permiso para ver usuarios (requiere rol ADMIN o USER)</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center'}}>No hay usuarios disponibles</td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id || u.idUsuario}>
                    <td>{u.id || u.idUsuario}</td>
                    <td>{u.email}</td>
                    <td>{u.nombre || "N/A"}</td>
                    <td>{u.apellido || "N/A"}</td>
                    <td>{u.telefono || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* TUTORES */}
      <section>
        <h2>Tutores</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario ID</th>
              <th>Especialidad</th>
              <th>Clasificación</th>
              <th>Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {tutores.length === 0 ? (
              <tr>
                <td colSpan="5" style={{textAlign: 'center'}}>No hay tutores disponibles</td>
              </tr>
            ) : (
              tutores.map((t) => (
                <tr key={t.id || t.idTutor}>
                  <td>{t.id || t.idTutor}</td>
                  <td>{t.usuarioId || t.usuario_id}</td>
                  <td>{t.especialidad || "N/A"}</td>
                  <td>
                    <span className="badge badge-blue">
                      {t.clasificacion || "N/A"}
                    </span>
                  </td>
                  <td>
                    {t.disponibilidad ? (
                      <span className="badge badge-green">Disponible</span>
                    ) : (
                      <span className="badge badge-gray">No disponible</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* VERIFICACIONES (solo ADMIN) */}
      <section>
        <h2>Verificaciones</h2>
        {!isAdmin ? (
          <p className="no-access">Solo ADMIN puede ver el listado de verificaciones.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {verificaciones.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center'}}>No hay verificaciones disponibles</td>
                </tr>
              ) : (
                verificaciones.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.usuarioId || v.usuario_id}</td>
                    <td>{v.tipo || "N/A"}</td>
                    <td>
                      <span className={`badge ${
                        v.estado === "APROBADO" ? "badge-green" :
                        v.estado === "RECHAZADO" ? "badge-red" :
                        "badge-yellow"
                      }`}>
                        {v.estado || "PENDIENTE"}
                      </span>
                    </td>
                    <td>{v.fecha || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}