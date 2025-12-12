import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Perfiles/perfilTutor.css";
import { authAPI } from "../../api/auth";

const PerfilTutor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
      }
    };

    fetchUserProfile();
  }, []);

  const editProfile = () => {
    navigate("/tutor/perfil/editar");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="perfil-tutor-page">
      <div className="main-content">
        <div className="container">
          <div className="perfil-card">
            <div className="profile-header">
              <div className="profile-banner">
                <div className="banner-placeholder" aria-label="Imagen de portada">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-avatar" aria-label="Avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                  </svg>
                </div>

                <div className="profile-details">
                  <h2 className="profile-name">{user?.nombre || "Tutor"}</h2>
                  <p className="profile-email">{user?.email}</p>
                  <p className="profile-role">Tutor verificado</p>
                </div>

                <div className="profile-actions">
                  <button className="message-btn" type="button">
                    Enviar mensaje
                  </button>
                  <div className="chat-icon" title="Abrir chat">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3 className="section-title">Descripción</h3>
              <div className="description-content">
                {user?.descripcion ? (
                  <p>{user.descripcion}</p>
                ) : (
                  <p className="placeholder-text">No hay descripción disponible.</p>
                )}
              </div>
            </div>

            {/* Cursos y comentarios se implementarán más adelante */}

            <div className="profile-actions-section">
              <button className="edit-profile-btn" type="button" onClick={editProfile}>
                Editar perfil
              </button>
              <button className="logout-btn" type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilTutor;
