import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Perfiles/perfilEstudiante.css";
import { authAPI } from "../../api/auth";

const PerfilEstudiante = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    foto: "",
    descripcion: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.data.success) {
          const user = response.data.user;
          setPerfil({
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            telefono: user.telefono || "",
            foto: user.foto || "",
            descripcion: user.descripcion || "",
          });
        }
      } catch (error) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setPerfil({
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          email: userData.email || "",
          telefono: userData.telefono || "",
          foto: userData.foto || "",
          descripcion: userData.descripcion || "",
        });
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="edit-perfil-page">
      <div className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>Editar Perfil Estudiante</h1>
              <p className="header-subtitle">Container</p>
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
                  <p className="form-input readonly-input">{perfil.nombre}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <p className="form-input readonly-input">{perfil.apellido}</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <p className="form-input readonly-input">{perfil.email}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <p className="form-input readonly-input">{perfil.telefono}</p>
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
                onClick={() => navigate("/mis-cursos")}
                className="cancel-btn"
              >
                Volver
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={() => navigate("/perfil/editar")}
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilEstudiante;
