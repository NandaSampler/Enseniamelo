import React, { useMemo, useState } from 'react';
import keycloak from './keycloak';

interface ApiResult {
  status: number;
  body: any;
}

const GATEWAY_BASE_URL = 'http://localhost:8080';

function decodeJwt(token: string | undefined) {
  if (!token) return null;
  const [, payload] = token.split('.');
  try {
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

const App: React.FC = () => {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [comentarioId, setComentarioId] = useState('');

  const token = keycloak.token;
  const payload = useMemo(() => decodeJwt(token), [token]);

  const roles: string[] = useMemo(() => {
    if (!payload) return [];
    const realmRoles: string[] = payload?.realm_access?.roles ?? [];
    return realmRoles;
  }, [payload]);

  const isUser = roles.includes('USER');
  const isAdmin = roles.includes('ADMIN');

  async function callApi(method: string, path: string, body?: any) {
    if (!token) {
      setResult({ status: 0, body: 'No token' });
      return;
    }

    try {
      const res = await fetch(`${GATEWAY_BASE_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await res.text();
      let parsed: any = text;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        // leave as text
      }

      setResult({ status: res.status, body: parsed });
    } catch (err: any) {
      setResult({ status: 0, body: err?.message ?? String(err) });
    }
  }

  const username = payload?.preferred_username ?? 'desconocido';

  return (
    <div className="app">
      <header className="header">
        <h1>Panel de Comentarios - Enseñamelo</h1>
        <div className="user-info">
          <span>Usuario: <strong>{username}</strong></span>
          <span>Roles: <strong>{roles.join(', ') || 'sin roles'}</strong></span>
          <button
            className="btn secondary"
            onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="grid">
        {/* GET */}
        <section className="card">
          <h2>GET - Listar comentarios</h2>
          <p>Endpoint: GET /api/comentario-curso</p>
          <button
            className="btn primary"
            onClick={() => callApi('GET', '/api/comentario-curso')}
          >
            Ejecutar GET
          </button>
        </section>

        {/* POST (solo USER o ADMIN) */}
        {isUser || isAdmin ? (
          <section className="card">
            <h2>POST - Crear comentario</h2>
            <p>Endpoint: POST /api/comentario-curso</p>
            <button
              className="btn primary"
              onClick={() =>
                callApi('POST', '/api/comentario-curso', {
                  idCurso: 'CURSO-1',
                  idUsuario: 'USER-1',
                  comentario: `Comentario de ${username}`,
                  clasificacion: 4.5,
                })
              }
            >
              Ejecutar POST
            </button>
          </section>
        ) : (
          <section className="card disabled">
            <h2>POST - Crear comentario</h2>
            <p>No tienes permisos para POST (requiere rol USER o ADMIN).</p>
          </section>
        )}

        {/* PUT (solo ADMIN) */}
        {isAdmin ? (
          <section className="card">
            <h2>PUT - Actualizar comentario</h2>
            <p>Endpoint: PUT /api/comentario-curso/:id</p>
            <input
              className="input"
              placeholder="ID del comentario"
              value={comentarioId}
              onChange={(e) => setComentarioId(e.target.value)}
            />
            <button
              className="btn primary"
              disabled={!comentarioId}
              onClick={() =>
                callApi('PUT', `/api/comentario-curso/${comentarioId}`, {
                  comentario: `Actualizado por ${username}`,
                  clasificacion: 5.0,
                })
              }
            >
              Ejecutar PUT
            </button>
          </section>
        ) : (
          <section className="card disabled">
            <h2>PUT - Actualizar comentario</h2>
            <p>Solo ADMIN puede actualizar (rol ADMIN requerido).</p>
          </section>
        )}


        {/* DELETE (solo ADMIN) */}
        {isAdmin ? (
          <section className="card">
            <h2>DELETE - Eliminar comentario</h2>
            <p>Endpoint: DELETE /api/comentario-curso/:id</p>
            <input
              className="input"
              placeholder="ID del comentario"
              value={comentarioId}
              onChange={(e) => setComentarioId(e.target.value)}
            />
            <button
              className="btn danger"
              disabled={!comentarioId}
              onClick={() =>
                callApi('DELETE', `/api/comentario-curso/${comentarioId}`)
              }
            >
              Ejecutar DELETE
            </button>
          </section>
        ) : (
          <section className="card disabled">
            <h2>DELETE - Eliminar comentario</h2>
            <p>Solo ADMIN puede eliminar (rol ADMIN requerido).</p>
          </section>
        )}
      </main>

      <section className="result">
        <h2>Resultado de la última llamada</h2>
        {result ? (
          <>
            <p><strong>Status:</strong> {result.status}</p>
            <pre>{JSON.stringify(result.body, null, 2)}</pre>
          </>
        ) : (
          <p>No se ha llamado ningún endpoint todavía.</p>
        )}
      </section>
    </div>
  );
};

export default App;
