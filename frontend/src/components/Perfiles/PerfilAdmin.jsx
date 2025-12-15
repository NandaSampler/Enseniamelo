// frontend/src/components/Perfiles/PerfilAdmin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Perfiles/perfilEstudiante.css";
import { authAPI } from "../../api/auth";
import api from "../../api/config";
import { verificarAPI } from "../../api/verificar";
import Navbar from "../Navbar";

const PerfilAdmin = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    foto: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalCursos: 0,
    solicitudesPendientes: 0,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      
      try {
        const response = await authAPI.getProfile();
        
        if (response?.data?.success && response.data.user) {
          const user = response.data.user;
          setPerfil({
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            telefono: user.telefono || user.phone || "",
            foto: user.foto || user.photo || user.picture || "",
            descripcion: user.descripcion || user.biografia || user.bio || "",
          });
          
          setLoading(false);
          return;
        }
        
      } catch (error) {
        console.warn('⚠️ Error desde API:', error?.message);
      }
      
      try {
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          setPerfil({
            nombre: userData.nombre || "",
            apellido: userData.apellido || "",
            email: userData.email || "",
            telefono: userData.telefono || userData.phone || "",
            foto: userData.foto || userData.photo || userData.picture || "",
            descripcion: userData.descripcion || userData.biografia || userData.bio || "",
          });
        }
      } catch (parseError) {
        console.error('❌ Error parseando localStorage:', parseError);
      } finally {
        setLoading(false);
      }
    };

    // Cargar estadísticas reales
    const cargarEstadisticas = async () => {
      try {
        // Total de usuarios
        const usuariosRes = await api.get("/v1/usuario");
        const usuarios = Array.isArray(usuariosRes.data) 
          ? usuariosRes.data 
          : usuariosRes.data?.usuarios || [];
        
        // Total de cursos
        const cursosRes = await api.get("/curso/api/v1/cursos/");
        const cursos = Array.isArray(cursosRes.data) 
          ? cursosRes.data 
          : cursosRes.data?.cursos || [];
        
        // Solicitudes pendientes
        const solicitudesRes = await verificarAPI.getSolicitudesCompletas();
        const solicitudes = solicitudesRes?.data?.solicitudes || [];
        const pendientes = solicitudes.filter(s => 
          s?.solicitud?.estado?.toLowerCase() === "pendiente"
        );

        setEstadisticas({
          totalUsuarios: usuarios.length,
          totalCursos: cursos.length,
          solicitudesPendientes: pendientes.length,
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };

    fetchUserProfile();
    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar currentSection="admin" adminMode />
        <div className="edit-perfil-page">
          <div className="header">
            <div className="container">
              <div className="header-content">
                <div className="header-left">
                  <h1>Perfil Administrador</h1>
                  <p className="header-subtitle">Cargando...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar currentSection="admin" adminMode />
      <div className="edit-perfil-page">
        <div className="header">
          <div className="container">
            <div className="header-content">
              <div className="header-left">
                <h1>Perfil Administrador</h1>
                <p className="header-subtitle">Gestión del sistema</p>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="container">
            <div className="edit-form">
              {/* Información Personal */}
              <div className="form-section">
                <h3 className="section-title">Información Personal</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <p className="form-input readonly-input">
                      {perfil.nombre || "Sin nombre"}
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <p className="form-input readonly-input">
                      {perfil.apellido || "Sin apellido"}
                    </p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <p className="form-input readonly-input">
                      {perfil.email || "Sin email"}
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <p className="form-input readonly-input">
                      {perfil.telefono || "Sin teléfono"}
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Foto de Perfil</label>
                  <div className="photo-upload">
                    <div className="photo-preview">
                      {perfil.foto ? (
                        <img src={perfil.foto} alt="Foto de perfil" />
                      ) : (
                        <div className="photo-placeholder">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas del Sistema */}
              <div className="form-section">
                <h3 className="section-title">Estadísticas del Sistema</h3>
                
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon admin-stat-icon-users">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                    </div>
                    <div className="admin-stat-info">
                      <p className="admin-stat-label">Total Usuarios</p>
                      <p className="admin-stat-value">{estadisticas.totalUsuarios}</p>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon admin-stat-icon-courses">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                      </svg>
                    </div>
                    <div className="admin-stat-info">
                      <p className="admin-stat-label">Total Cursos</p>
                      <p className="admin-stat-value">{estadisticas.totalCursos}</p>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon admin-stat-icon-pending">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <div className="admin-stat-info">
                      <p className="admin-stat-label">Solicitudes Pendientes</p>
                      <p className="admin-stat-value">{estadisticas.solicitudesPendientes}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="form-section">
                <h3 className="section-title">Descripción</h3>
                <div className="form-group">
                  <label className="form-label">Biografía</label>
                  <p className="form-textarea readonly-input">
                    {perfil.descripcion || "Aún no has agregado una biografía."}
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/admin/solicitudes-tutores")}
                  className="cancel-btn"
                >
                  Volver al Panel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={() => navigate("/admin/perfil/editar")}
                >
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerfilAdmin;