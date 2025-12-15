import { useEffect, useState } from "react";
import api from "../../api/config";
import { useNotification } from "../NotificationProvider";
import ConfirmModal from "../ConfirmModal"; // Importar el nuevo modal
import "../../styles/Admin/gestionUsuarios.css";

const GestionUsuarios = () => {
  const { showNotification } = useNotification();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Nuevo estado para el modal de confirmación
  const [modalEliminar, setModalEliminar] = useState({
    isOpen: false,
    usuario: null
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/v1/usuario");
      const usuariosArray = Array.isArray(data) ? data : data?.usuarios || [];
      setUsuarios(usuariosArray);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/v1/usuario/${id}`, { activo: nuevoEstado });
      
      showNotification({
        type: "success",
        title: "Usuario actualizado",
        message: `Usuario ${nuevoEstado ? "activado" : "desactivado"} correctamente`,
      });
      
      await fetchUsuarios();
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el usuario",
      });
    }
  };

  const handleCambiarRol = async (id, nuevoRol) => {
    try {
      await api.put(`/v1/usuario/${id}`, { rol: nuevoRol });
      
      showNotification({
        type: "success",
        title: "Rol actualizado",
        message: "El rol del usuario se actualizó correctamente",
      });
      
      await fetchUsuarios();
      setModalAbierto(false);
    } catch (error) {
      console.error("Error actualizando rol:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el rol del usuario",
      });
    }
  };

  // Nueva función para abrir el modal de confirmación
  const abrirModalEliminar = (usuario) => {
    setModalEliminar({
      isOpen: true,
      usuario: usuario
    });
  };

  // Nueva función para confirmar eliminación
  const confirmarEliminar = async () => {
    const usuario = modalEliminar.usuario;
    
    try {
      await api.delete(`/v1/usuario/${usuario.id || usuario._id}`);
      
      showNotification({
        type: "success",
        title: "Usuario eliminado",
        message: "El usuario se eliminó correctamente",
      });
      
      await fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "No se pudo eliminar el usuario",
      });
    } finally {
      setModalEliminar({ isOpen: false, usuario: null });
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const cumpleFiltro = 
      filtro === "todos" || 
      (filtro === "estudiantes" && usuario.rol === "ESTUDIANTE") ||
      (filtro === "tutores" && (usuario.rol === "TUTOR" || usuario.rol === "DOCENTE")) ||
      (filtro === "admins" && usuario.rol === "ADMIN") ||
      (filtro === "activos" && usuario.activo !== false) ||
      (filtro === "inactivos" && usuario.activo === false);

    const cumpleBusqueda = 
      !busqueda ||
      `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleFiltro && cumpleBusqueda;
  });

  const getRolLabel = (rol) => {
    const roles = {
      ESTUDIANTE: "Estudiante",
      TUTOR: "Tutor",
      DOCENTE: "Tutor",
      ADMIN: "Administrador",
    };
    return roles[rol] || rol;
  };

  const getRolClass = (rol) => {
    const classes = {
      ESTUDIANTE: "rol-estudiante",
      TUTOR: "rol-tutor",
      DOCENTE: "rol-tutor",
      ADMIN: "rol-admin",
    };
    return classes[rol] || "";
  };

  return (
    <div className="gestion-usuarios">
      <div className="usuarios-header">
        <div>
          <h2 className="usuarios-title">Gestión de Usuarios</h2>
          <p className="usuarios-subtitle">
            Administra los usuarios, sus roles y estados en el sistema
          </p>
        </div>
      </div>

      <div className="usuarios-controles">
        <div className="search-bar-usuarios">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input-usuarios"
          />
        </div>

        <div className="filtros-usuarios">
          <button
            className={`filtro-btn ${filtro === "todos" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("todos")}
          >
            Todos ({usuarios.length})
          </button>
          <button
            className={`filtro-btn ${filtro === "estudiantes" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("estudiantes")}
          >
            Estudiantes ({usuarios.filter(u => u.rol === "ESTUDIANTE").length})
          </button>
          <button
            className={`filtro-btn ${filtro === "tutores" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("tutores")}
          >
            Tutores ({usuarios.filter(u => u.rol === "TUTOR" || u.rol === "DOCENTE").length})
          </button>
          <button
            className={`filtro-btn ${filtro === "admins" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("admins")}
          >
            Admins ({usuarios.filter(u => u.rol === "ADMIN").length})
          </button>
          <button
            className={`filtro-btn ${filtro === "activos" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("activos")}
          >
            Activos
          </button>
          <button
            className={`filtro-btn ${filtro === "inactivos" ? "filtro-activo" : ""}`}
            onClick={() => setFiltro("inactivos")}
          >
            Inactivos
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando usuarios...</p>
        </div>
      )}

      {!loading && (
        <div className="usuarios-table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id || usuario._id}>
                  <td>
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.foto ? (
                          <img src={usuario.foto} alt={usuario.nombre} />
                        ) : (
                          <span>{usuario.nombre?.[0]}{usuario.apellido?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="usuario-nombre">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div className="usuario-id">ID: {usuario.id || usuario._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{usuario.email || "—"}</td>
                  <td>{usuario.telefono || "—"}</td>
                  <td>
                    <span className={`rol-badge ${getRolClass(usuario.rol)}`}>
                      {getRolLabel(usuario.rol)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`estado-toggle ${usuario.activo !== false ? "activo" : "inactivo"}`}
                      onClick={() => handleCambiarEstado(usuario.id || usuario._id, !(usuario.activo !== false))}
                    >
                      {usuario.activo !== false ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td>
                    {usuario.creado 
                      ? new Date(usuario.creado).toLocaleDateString("es-BO")
                      : usuario.fechaCreacion
                      ? new Date(usuario.fechaCreacion).toLocaleDateString("es-BO")
                      : "—"
                    }
                  </td>
                  <td>
                    <div className="acciones-cell">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => {
                          setUsuarioSeleccionado(usuario);
                          setModalAbierto(true);
                        }}
                        title="Cambiar rol"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => abrirModalEliminar(usuario)}
                        title="Eliminar usuario"
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

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No se encontraron usuarios con los filtros aplicados
            </div>
          )}
        </div>
      )}

      {/* Modal de cambio de rol (existente) */}
      {modalAbierto && usuarioSeleccionado && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Cambiar Rol de Usuario</h3>
            <p className="modal-text">
              Usuario: <strong>{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</strong>
            </p>
            <p className="modal-text">
              Rol actual: <strong>{getRolLabel(usuarioSeleccionado.rol)}</strong>
            </p>

            <div className="modal-roles">
              <button
                className="rol-option"
                onClick={() => handleCambiarRol(usuarioSeleccionado.id || usuarioSeleccionado._id, "ESTUDIANTE")}
              >
                Estudiante
              </button>
              <button
                className="rol-option"
                onClick={() => handleCambiarRol(usuarioSeleccionado.id || usuarioSeleccionado._id, "TUTOR")}
              >
                Tutor
              </button>
              <button
                className="rol-option"
                onClick={() => handleCambiarRol(usuarioSeleccionado.id || usuarioSeleccionado._id, "ADMIN")}
              >
                Administrador
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
        onClose={() => setModalEliminar({ isOpen: false, usuario: null })}
        onConfirm={confirmarEliminar}
        title="¿Eliminar este usuario?"
        message={`Esta acción no se puede deshacer. El usuario ${modalEliminar.usuario?.nombre || ''} ${modalEliminar.usuario?.apellido || ''} y toda su información serán eliminados permanentemente del sistema.`}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default GestionUsuarios;