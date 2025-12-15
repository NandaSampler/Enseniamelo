// frontend/src/components/Admin/GestionCursos.jsx
import { useEffect, useState } from "react";
import { cursosAPI } from "../../api/cursos";
import { useNotification } from "../NotificationProvider";
import ConfirmModal from "../ConfirmModal"; // Importar el modal mejorado
import "../../styles/Admin/gestionCursos.css";

const GestionCursos = () => {
  const { showNotification } = useNotification();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Nuevo estado para el modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState({
    isOpen: false,
    curso: null
  });

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    setLoading(true);
    try {
      const { data } = await cursosAPI.getCursos();
      const cursosArray = Array.isArray(data) ? data : data?.cursos || [];
      setCursos(cursosArray);
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudieron cargar los cursos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await cursosAPI.updateCurso(id, { estado: nuevoEstado });
      
      showNotification({
        type: "success",
        title: "Curso actualizado",
        message: `Curso ${nuevoEstado === "activo" ? "activado" : "desactivado"} correctamente`,
      });
      
      await fetchCursos();
    } catch (error) {
      console.error("Error actualizando curso:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el curso",
      });
    }
  };

  const handleCambiarVerificacion = async (id, estadoVerificacion) => {
    try {
      await cursosAPI.updateCurso(id, { verificacion_estado: estadoVerificacion });
      
      showNotification({
        type: "success",
        title: "Verificación actualizada",
        message: `Estado de verificación cambiado a ${estadoVerificacion}`,
      });
      
      await fetchCursos();
      setModalAbierto(false);
    } catch (error) {
      console.error("Error actualizando verificación:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar la verificación",
      });
    }
  };

  // Nueva función para abrir el modal de confirmación
  const abrirModalEliminar = (curso) => {
    setModalEliminar({
      isOpen: true,
      curso: curso
    });
  };

  // Nueva función para confirmar eliminación
  const confirmarEliminarCurso = async () => {
    const curso = modalEliminar.curso;
    
    try {
      await cursosAPI.deleteCurso(curso.id || curso._id);
      
      showNotification({
        type: "success",
        title: "Curso eliminado",
        message: "El curso se eliminó correctamente",
      });
      
      await fetchCursos();
    } catch (error) {
      console.error("Error eliminando curso:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "No se pudo eliminar el curso",
      });
    } finally {
      setModalEliminar({ isOpen: false, curso: null });
    }
  };

  const cursosFiltrados = cursos.filter((curso) => {
    const cumpleFiltro = 
      filtro === "todos" || 
      (filtro === "activos" && curso.estado === "activo") ||
      (filtro === "inactivos" && curso.estado !== "activo") ||
      (filtro === "verificados" && curso.verificacion_estado === "aceptado") ||
      (filtro === "pendientes" && curso.verificacion_estado === "pendiente") ||
      (filtro === "rechazados" && curso.verificacion_estado === "rechazado");

    const cumpleBusqueda = 
      !busqueda ||
      curso.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleFiltro && cumpleBusqueda;
  });

  const getEstadoClass = (estado) => {
    return estado === "activo" ? "estado-activo" : "estado-inactivo";
  };

  const getVerificacionClass = (verificacion) => {
    const classes = {
      pendiente: "verificacion-pendiente",
      aceptado: "verificacion-aceptado",
      rechazado: "verificacion-rechazado",
    };
    return classes[verificacion] || "verificacion-pendiente";
  };

  const getVerificacionLabel = (verificacion) => {
    const labels = {
      pendiente: "Pendiente",
      aceptado: "Verificado",
      rechazado: "Rechazado",
    };
    return labels[verificacion] || verificacion;
  };

  const getModalidadIcon = (modalidad) => {
    switch(modalidad?.toLowerCase()) {
      case 'virtual':
        return '';
      case 'presencial':
        return '';
      case 'hibrida':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="gestion-cursos">
      <div className="cursos-header">
        <div>
          <h2 className="cursos-title">Gestión de Cursos</h2>
          <p className="cursos-subtitle">
            Administra todos los cursos del sistema, su estado y verificación
          </p>
        </div>
      </div>

      <div className="cursos-controles">
        <div className="search-bar-cursos">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input-cursos"
          />
        </div>

        <div className="filtros-cursos">
          <button
            className={`filtro-btn ${filtro === "todos" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("todos")}
          >
            Todos ({cursos.length})
          </button>
          <button
            className={`filtro-btn ${filtro === "activos" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("activos")}
          >
            Activos ({cursos.filter(c => c.estado === "activo").length})
          </button>
          <button
            className={`filtro-btn ${filtro === "inactivos" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("inactivos")}
          >
            Inactivos ({cursos.filter(c => c.estado !== "activo").length})
          </button>
          <button
            className={`filtro-btn ${filtro === "verificados" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("verificados")}
          >
            Verificados ({cursos.filter(c => c.verificacion_estado === "aceptado").length})
          </button>
          <button
            className={`filtro-btn ${filtro === "pendientes" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("pendientes")}
          >
            Pendientes ({cursos.filter(c => c.verificacion_estado === "pendiente").length})
          </button>
          <button
            className={`filtro-btn ${filtro === "rechazados" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("rechazados")}
          >
            Rechazados ({cursos.filter(c => c.verificacion_estado === "rechazado").length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando cursos...</p>
        </div>
      )}

      {!loading && (
        <div className="cursos-table-container">
          <table className="cursos-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Modalidad</th>
                <th>Precio</th>
                <th>Cupos</th>
                <th>Estado</th>
                <th>Verificación</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursosFiltrados.map((curso) => (
                <tr key={curso.id || curso._id}>
                  <td>
                    <div className="curso-info">
                      <div className="curso-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="curso-nombre">{curso.nombre}</div>
                        <div className="curso-descripcion">
                          {curso.descripcion?.substring(0, 60)}
                          {curso.descripcion?.length > 60 ? "..." : ""}
                        </div>
                        <div className="curso-id">ID: {curso.id || curso._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="modalidad-badge">
                      <span className="modalidad-emoji">{getModalidadIcon(curso.modalidad)}</span>
                      <span>{curso.modalidad || "—"}</span>
                    </span>
                  </td>
                  <td>
                    <span className="precio-badge">
                      {curso.precio_reserva ? `${curso.precio_reserva} Bs/h` : "Gratis"}
                    </span>
                  </td>
                  <td>
                    <span className="cupos-info">
                      {curso.tiene_cupo 
                        ? `${curso.cupo_ocupado || 0}/${curso.cupo || 0}`
                        : "∞"
                      }
                    </span>
                  </td>
                  <td>
                    <button
                      className={`estado-toggle ${getEstadoClass(curso.estado)}`}
                      onClick={() => handleCambiarEstado(
                        curso.id || curso._id, 
                        curso.estado === "activo" ? "inactivo" : "activo"
                      )}
                    >
                      {curso.estado === "activo" ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td>
                    <span className={`verificacion-badge ${getVerificacionClass(curso.verificacion_estado)}`}>
                      {getVerificacionLabel(curso.verificacion_estado)}
                    </span>
                  </td>
                  <td>
                    {curso.createdAt || curso.creado
                      ? new Date(curso.createdAt || curso.creado).toLocaleDateString("es-BO")
                      : "—"
                    }
                  </td>
                  <td>
                    <div className="acciones-cell">
                      <button
                        className="btn-accion btn-ver"
                        onClick={() => window.open(`/curso/${curso.id || curso._id}`, '_blank')}
                        title="Ver curso"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      </button>
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => {
                          setCursoSeleccionado(curso);
                          setModalAbierto(true);
                        }}
                        title="Cambiar verificación"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => abrirModalEliminar(curso)}
                        title="Eliminar curso"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cursosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No se encontraron cursos con los filtros aplicados
            </div>
          )}
        </div>
      )}

      {/* Modal de cambio de verificación (existente) */}
      {modalAbierto && cursoSeleccionado && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Cambiar Estado de Verificación</h3>
            <p className="modal-text">
              Curso: <strong>{cursoSeleccionado.nombre}</strong>
            </p>
            <p className="modal-text">
              Estado actual: <strong>{getVerificacionLabel(cursoSeleccionado.verificacion_estado)}</strong>
            </p>

            <div className="modal-verificaciones">
              <button
                className="verificacion-option pendiente"
                onClick={() => handleCambiarVerificacion(
                  cursoSeleccionado.id || cursoSeleccionado._id, 
                  "pendiente"
                )}
              >
                Pendiente
              </button>
              <button
                className="verificacion-option aceptado"
                onClick={() => handleCambiarVerificacion(
                  cursoSeleccionado.id || cursoSeleccionado._id, 
                  "aceptado"
                )}
              >
                Verificado
              </button>
              <button
                className="verificacion-option rechazado"
                onClick={() => handleCambiarVerificacion(
                  cursoSeleccionado.id || cursoSeleccionado._id, 
                  "rechazado"
                )}
              >
                Rechazado
              </button>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nuevo modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={modalEliminar.isOpen}
        onClose={() => setModalEliminar({ isOpen: false, curso: null })}
        onConfirm={confirmarEliminarCurso}
        title="¿Eliminar este curso?"
        message={`Esta acción no se puede deshacer. El curso "${modalEliminar.curso?.nombre || ''}" y toda su información serán eliminados permanentemente del sistema.`}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default GestionCursos;