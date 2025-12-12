import { useState, useEffect } from "react";
import "../../styles/Admin/adminPanel.css";
import CardAdmin from "./CardAdmin";
import AdminDetalle from "./AdminDetalle";
import { verificarAPI } from "../../api/verificar";
import PlanesAdmin from "../Pagos/PlanesAdmin";

const mapSolicitudFromApi = (raw) => {
  const user = raw.id_usuario || {};
  const perfil = raw.id_perfil_tutor || {};
  const curso = raw.id_curso || {};

  const nombreCompleto = [user.nombre, user.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id_verificar: raw._id,
    estado: raw.estado,
    comentario: raw.comentario || "",
    foto_ci: raw.foto_ci
      ? `/static/verificaciones/${raw.foto_ci}`
      : "",
    archivos_verificacion: Array.isArray(raw.archivos)
      ? raw.archivos.map((f) => `/static/verificaciones/${f}`)
      : [],
    creado: raw.creado,
    decidido: raw.decidido,
    actualizado: raw.decidido || raw.creado,
    curso: {
      id_curso: curso._id || "verificacion-" + raw._id,
      nombre: curso.nombre || nombreCompleto || "Solicitud de verificación",
      descripcion:
        curso.descripcion ||
        raw.comentario ||
        "Solicitud de verificación de documentos del tutor.",
      modalidad: curso.modalidad || "Virtual",
      fotos: raw.foto_ci
        ? [`/static/verificaciones/${raw.foto_ci}`]
        : [],
      creado: curso.creado || raw.creado,
      actualizado: curso.actualizado || raw.decidido || raw.creado,
      necesita_reserva:
        typeof curso.necesita_reserva === "boolean"
          ? curso.necesita_reserva
          : false,
      precio_reserva: curso.precio_reserva ?? 0,
      categoriasNombres: Array.isArray(curso.categorias)
        ? curso.categorias
            .map((c) => (typeof c === "string" ? c : c.nombre))
            .filter(Boolean)
        : [],
      attribute_10: 0,
    },
    perfil_tutor: {
      id_tutor: perfil._id,
      ci: perfil.ci,
      verificado: perfil.verificado,
      clasificacion: perfil.clasificacion,
      biografia: perfil.biografia,
      creacion: perfil.creacion,
      actualizado: perfil.actualizado,
      nombre_tutor: nombreCompleto || "Tutor",
    },
  };
};

const PanelAdmin = () => {
  const [activeTab, setActiveTab] = useState("solicitudes"); // 'solicitudes' | 'planes'
  const [filter, setFilter] = useState("todos");
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await verificarAPI.getSolicitudes();
        if (data?.success && Array.isArray(data.solicitudes)) {
          setSolicitudes(data.solicitudes.map(mapSolicitudFromApi));
        } else {
          setError("No se pudieron cargar las solicitudes.");
        }
      } catch (err) {
        console.error("Error cargando solicitudes de verificación:", err);
        setError(
          err?.response?.data?.message ||
            "Error al obtener las solicitudes de verificación."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const handleChangeEstado = async (id_verificar, nuevoEstado, nuevoComentario) => {
    try {
      const payload = { estado: nuevoEstado };
      if (typeof nuevoComentario === "string") {
        payload.comentario = nuevoComentario;
      }

      const { data } = await verificarAPI.cambiarEstado(id_verificar, payload);
      if (data?.success && data.solicitud) {
        const actualizada = mapSolicitudFromApi(data.solicitud);

        setSolicitudes((prev) =>
          prev.map((s) => (s.id_verificar === id_verificar ? actualizada : s))
        );

        setSelectedSolicitud((prev) =>
          prev && prev.id_verificar === id_verificar ? actualizada : prev
        );
      }
    } catch (err) {
      console.error("Error actualizando estado de solicitud:", err);
      alert(
        err?.response?.data?.message ||
          "No se pudo actualizar el estado de la solicitud."
      );
    }
  };

  const filteredSolicitudes = solicitudes.filter((sol) =>
    filter === "todos" ? true : sol.estado === filter
  );

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-container">
        <section className="admin-panel-hero">
          <div className="admin-panel-hero-overlay" />
          <div className="admin-panel-hero-content">
            <div>
              <h1 className="admin-panel-title">Panel de administración</h1>
              <p className="admin-panel-subtitle">
                Administra solicitudes de verificación y los planes de suscripción para tutores.
              </p>
            </div>
            <div className="admin-panel-hero-buttons">
              <button
                type="button"
                className={
                  "admin-panel-chip " +
                  (activeTab === "solicitudes"
                    ? "admin-panel-chip-primary"
                    : "admin-panel-chip-light")
                }
                onClick={() => setActiveTab("solicitudes")}
              >
                Solicitudes de tutores
              </button>
              <button
                type="button"
                className={
                  "admin-panel-chip " +
                  (activeTab === "planes"
                    ? "admin-panel-chip-primary"
                    : "admin-panel-chip-light")
                }
                onClick={() => setActiveTab("planes")}
              >
                Planes de suscripción
              </button>
            </div>
          </div>
          <div className="admin-panel-hero-graphic" />
        </section>

        {activeTab === "solicitudes" && !selectedSolicitud && (
          <div className="admin-panel-filters">
            <button
              className={
                "admin-panel-filter " +
                (filter === "todos" ? "admin-panel-filter-active" : "")
              }
              onClick={() => setFilter("todos")}
            >
              Todos
            </button>

            <button
              className={
                "admin-panel-filter " +
                (filter === "pendiente" ? "admin-panel-filter-active" : "")
              }
              onClick={() => setFilter("pendiente")}
            >
              Pendientes
            </button>
            <button
              className={
                "admin-panel-filter " +
                (filter === "aceptado" ? "admin-panel-filter-active" : "")
              }
              onClick={() => setFilter("aceptado")}
            >
              Aceptados
            </button>
            <button
              className={
                "admin-panel-filter " +
                (filter === "rechazado" ? "admin-panel-filter-active" : "")
              }
              onClick={() => setFilter("rechazado")}
            >
              Rechazados
            </button>
          </div>
        )}

        {activeTab === "planes" && (
          <section className="admin-panel-list">
            <PlanesAdmin />
          </section>
        )}

        {activeTab === "solicitudes" && selectedSolicitud && (
          <AdminDetalle
            solicitud={selectedSolicitud}
            onClose={() => setSelectedSolicitud(null)}
            onChangeEstado={(nuevoEstado) =>
              handleChangeEstado(selectedSolicitud.id_verificar, nuevoEstado)
            }
            onViewDocs={() => {
              console.log(
                "Ver documentos de solicitud",
                selectedSolicitud.id_verificar
              );
              // aquí luego vas a abrir modal / nueva vista con documentos
            }}
            onAddComment={() => {
              const nuevoComentario = window.prompt(
                "Agregar comentario del administrador:",
                selectedSolicitud.comentario || ""
              );
              if (nuevoComentario !== null) {
                handleChangeEstado(
                  selectedSolicitud.id_verificar,
                  selectedSolicitud.estado,
                  nuevoComentario
                );
              }
            }}
          />
        )}

        {activeTab === "solicitudes" && !selectedSolicitud && (
          <section className="admin-panel-list">
            {loading && (
              <p className="text-center text-sm text-slate-500 py-6">
                Cargando solicitudes...
              </p>
            )}

            {!loading && error && (
              <p className="text-center text-sm text-red-500 py-6">{error}</p>
            )}

            {!loading && !error && (
              <>
                {filteredSolicitudes.length > 0 ? (
                  filteredSolicitudes.map((item) => (
                    <CardAdmin
                      key={item.id_verificar}
                      solicitud={item}
                      onDetail={() => setSelectedSolicitud(item)}
                      onReject={() =>
                        handleChangeEstado(item.id_verificar, "rechazado")
                      }
                      onAccept={() =>
                        handleChangeEstado(item.id_verificar, "aceptado")
                      }
                    />
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 py-6">
                    No hay solicitudes en esta categoría.
                  </p>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default PanelAdmin;
