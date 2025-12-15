import { useState, useEffect } from "react";
import "../../styles/Admin/adminPanel.css";
import CardAdmin from "./CardAdmin";
import AdminDetalle from "./AdminDetalle";
import { verificarAPI } from "../../api/verificar";
import PlanesAdmin from "../Pagos/PlanesAdmin";

const mapSolicitudCompletaFromApi = (raw) => {
  const solicitud = raw.solicitud || {};
  const usuario = raw.usuario || {};
  const tutor = raw.tutor || {};
  const curso = raw.curso || {};

  const nombreCompleto = [usuario.nombre, usuario.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  const fechaCreacion = solicitud.creado
    ? new Date(solicitud.creado).toLocaleDateString("es-BO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const precioFormateado = curso.precioReserva
    ? `${curso.precioReserva} Bs/hora`
    : "Sin precio definido";

  return {
    id_verificar: solicitud.id,
    estado: solicitud.estado,
    comentario: solicitud.comentario || "",
    foto_ci: solicitud.fotoCi ? solicitud.fotoCi : "",
    archivos_verificacion: Array.isArray(solicitud.archivos)
      ? solicitud.archivos
      : [],
    creado: fechaCreacion,
    decidido: solicitud.decidido,
    actualizado: solicitud.actualizado || solicitud.creado,
    
    curso: {
      id_curso: curso.id || solicitud.idCurso,
      nombre: curso.nombre || nombreCompleto || "Solicitud de verificación",
      titulo: curso.titulo || curso.nombre || "Sin título",
      descripcion:
        curso.descripcion ||
        solicitud.comentario ||
        "Solicitud de verificación de documentos del tutor.",
      modalidad: curso.modalidad || "Virtual",
      precio: precioFormateado,
      precio_reserva: curso.precioReserva ?? 0,
      portada_url: curso.portadaUrl || "",
      fotos: Array.isArray(curso.fotos) ? curso.fotos : [],
      creado: curso.creado || solicitud.creado,
      actualizado: curso.actualizado || solicitud.actualizado,
      necesita_reserva:
        typeof curso.necesitaReserva === "boolean"
          ? curso.necesitaReserva
          : false,
      categoriasNombres: Array.isArray(curso.categorias)
        ? curso.categorias.map((c) => (typeof c === "string" ? c : c.nombre || c))
        : [],
      estadoVerificacion: curso.estadoVerificacion || solicitud.estado,
    },
    
    // Información del tutor completa
    perfil_tutor: {
      id_tutor: tutor.id || solicitud.idPerfilTutor,
      ci: tutor.ci || "Sin CI",
      verificado: tutor.verificado || "pendiente",
      clasificacion: tutor.clasificacion || 0,
      biografia: tutor.biografia || "Sin biografía disponible",
      creacion: tutor.creacion,
      actualizado: tutor.actualizado,
      nombre_tutor: tutor.nombreCompleto || nombreCompleto || "Tutor",
      email: tutor.email || usuario.email || "",
      telefono: tutor.telefono || usuario.telefono || "",
      foto: tutor.foto || usuario.foto || "",
    },
    
    // Información del usuario
    usuario: {
      id: usuario.id || solicitud.idUsuario,
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      foto: usuario.foto || "",
      rol: usuario.rol || "",
    },
  };
};

const PanelAdmin = () => {
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [filter, setFilter] = useState("todos");
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "solicitudes") {
      fetchSolicitudes();
    }
  }, [activeTab]);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError("");
    try {
      // Usar el nuevo endpoint que devuelve información completa
      const { data } = await verificarAPI.getSolicitudesCompletas();
      
      if (data?.success && Array.isArray(data.solicitudes)) {
        const solicitudesMapeadas = data.solicitudes.map(mapSolicitudCompletaFromApi);
        setSolicitudes(solicitudesMapeadas);
        console.log("Solicitudes cargadas:", solicitudesMapeadas);
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

  const handleChangeEstado = async (id_verificar, nuevoEstado, nuevoComentario) => {
    try {
      let response;
      
      // Normalizar el estado
      const estadoNormalizado = nuevoEstado.toLowerCase();
      
      if (estadoNormalizado === "aceptado" || estadoNormalizado === "aprobado") {
        response = await verificarAPI.aprobarSolicitud(id_verificar, nuevoComentario || "");
      } else if (estadoNormalizado === "rechazado") {
        response = await verificarAPI.rechazarSolicitud(
          id_verificar,
          nuevoComentario || "Solicitud rechazada"
        );
      } else {
        throw new Error("Estado no válido");
      }

      if (response?.data?.success && response.data.solicitud) {
        // Recargar solicitudes para obtener datos actualizados
        await fetchSolicitudes();
        
        // Si hay una solicitud seleccionada, actualizarla también
        if (selectedSolicitud?.id_verificar === id_verificar) {
          const solicitudActualizada = solicitudes.find(
            (s) => s.id_verificar === id_verificar
          );
          if (solicitudActualizada) {
            setSelectedSolicitud(solicitudActualizada);
          }
        }
        
        // Mostrar mensaje de éxito
        alert(
          estadoNormalizado === "aceptado" || estadoNormalizado === "aprobado"
            ? "Solicitud aprobada exitosamente"
            : "Solicitud rechazada exitosamente"
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

  const filteredSolicitudes = solicitudes.filter((sol) => {
    if (filter === "todos") return true;
    
    // Normalizar estados para la comparación
    const estadoNormalizado = sol.estado?.toLowerCase();
    const filterNormalizado = filter.toLowerCase();
    
    // Manejar variaciones de estados
    if (filterNormalizado === "aceptado" || filterNormalizado === "aprobado") {
      return estadoNormalizado === "aceptado" || estadoNormalizado === "aprobado";
    }
    if (filterNormalizado === "pendiente") {
      return estadoNormalizado === "pendiente";
    }
    if (filterNormalizado === "rechazado") {
      return estadoNormalizado === "rechazado";
    }
    
    return estadoNormalizado === filterNormalizado;
  });

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
              Todos ({solicitudes.length})
            </button>

            <button
              className={
                "admin-panel-filter " +
                (filter === "pendiente" ? "admin-panel-filter-active" : "")
              }
              onClick={() => setFilter("pendiente")}
            >
              Pendientes (
              {solicitudes.filter((s) => s.estado?.toLowerCase() === "pendiente").length})
            </button>
            <button
              className={
                "admin-panel-filter " +
                (filter === "aceptado" ? "admin-panel-filter-active" : "")
              }
              onClick={() => setFilter("aceptado")}
            >
              Aceptados (
              {solicitudes.filter(
                (s) =>
                  s.estado?.toLowerCase() === "aceptado" ||
                  s.estado?.toLowerCase() === "aprobado"
              ).length})
            </button>
            <button
              className={
                "admin-panel-filter " +
                (filter === "rechazado" ? "admin-panel-filter-active" : "")
              }
              onClick={() => setFilter("rechazado")}
            >
              Rechazados (
              {solicitudes.filter((s) => s.estado?.toLowerCase() === "rechazado").length})
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
              // Aquí puedes implementar un modal para ver documentos
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
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-slate-600">Cargando solicitudes...</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchSolicitudes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
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
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-4 text-slate-500">
                      No hay solicitudes en esta categoría.
                    </p>
                  </div>
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