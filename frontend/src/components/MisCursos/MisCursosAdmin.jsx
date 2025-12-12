// src/components/MisCursos/MisCursosAdmin.jsx
import { useEffect, useState } from "react";
import keycloak, { initKeycloak } from "../../keycloak";
import ListaCurso from "./ListaCurso";

const MisCursosAdmin = () => {
    const [authLoading, setAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [cursos, setCursos] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                const authenticated = await initKeycloak();

                if (!authenticated) {
                    setAuthLoading(false);
                    return;
                }

                if (cancelled) return;

                const roles = keycloak.tokenParsed?.realm_access?.roles || [];
                const userIsAdmin = roles.includes("CURSO_ADMIN");
                setIsAdmin(userIsAdmin);

                // Si no es admin, no llamamos al backend
                if (!userIsAdmin) {
                    setAuthLoading(false);
                    return;
                }

                // Refrescar token si está a punto de expirar (opcional)
                try {
                    await keycloak.updateToken(30);
                } catch (err) {
                    console.warn("No se pudo refrescar el token", err);
                }

                const resp = await fetch(
                    "https://localhost:8443/curso/api/v1/cursos/",
                    {
                        headers: {
                            Authorization: `Bearer ${keycloak.token}`,
                        },
                    }
                );

                if (resp.status === 403) {
                    setError("No tienes permisos para ver los cursos (403).");
                    setAuthLoading(false);
                    return;
                }

                if (!resp.ok) {
                    throw new Error("Error al cargar los cursos");
                }

                const data = await resp.json();
                if (!cancelled) {
                    setCursos(data);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError("Ocurrió un error al autenticar o cargar los cursos.");
                }
            } finally {
                if (!cancelled) {
                    setAuthLoading(false);
                }
            }
        };

        init();

        return () => {
            cancelled = true;
        };
    }, []);

    if (authLoading) {
        return <div className="p-6">Cargando autenticación...</div>;
    }

    const roles = keycloak.tokenParsed?.realm_access?.roles || [];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Mis cursos (Keycloak)</h1>

            <p className="mb-2 text-sm text-gray-600">
                Usuario:{" "}
                <strong>{keycloak.tokenParsed?.preferred_username || "desconocido"}</strong>{" "}
                — Roles: {roles.join(", ") || "sin roles"}
            </p>

            {error && (
                <p className="text-red-600 mb-4">
                    {error}
                </p>
            )}

            {!isAdmin && !error && (
                <p className="text-yellow-800 bg-yellow-100 border border-yellow-300 rounded px-4 py-2">
                    Estás autenticado vía Keycloak, pero no tienes el rol{" "}
                    <strong>CURSO_ADMIN</strong>. Por eso no puedes ver la lista de cursos.
                </p>
            )}

            {isAdmin && !error && (
                <ListaCurso cursos={cursos} />
            )}

            <button
                className="mt-6 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
                onClick={() => keycloak.logout()}
            >
                Cerrar sesión
            </button>
        </div>
    );
};

export default MisCursosAdmin;
