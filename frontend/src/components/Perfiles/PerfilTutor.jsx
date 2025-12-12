// frontend/src/components/Perfiles/PerfilTutor.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Perfiles/perfilEstudiante.css";
import "../../styles/Perfiles/perfilTutor.css"; // ⬅️ aquí se suman los estilos del tutor
import { authAPI } from "../../api/auth";
import { planesAPI } from "../../api/planes";
import { useNotification } from "../NotificationProvider";
import Navbar from "../Navbar"; // ⬅️ para mostrar el navbar

const PerfilTutor = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    foto: "",
    descripcion: "",
  });

  const [suscripcion, setSuscripcion] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  // Perfil del tutor
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

  // Suscripción del tutor
  useEffect(() => {
    const fetchSuscripcion = async () => {
      try {
        const { data } = await planesAPI.getMiSuscripcion();
        if (data?.success) {
          setSuscripcion(data.suscripcion || null);
        }
      } catch (error) {
        console.error("Error obteniendo suscripción del tutor:", error);
      }
    };

    fetchSuscripcion();
  }, []);

  const handleCancelarSuscripcion = async () => {
    if (!suscripcion || cancelando) return;

    // Usamos NotificationProvider en lugar del alert nativo
    showNotification({
      type: "warning",
      title: "Cancelando suscripción",
      message: `Se está procesando la cancelación de tu suscripción al plan "${suscripcion.id_plan.nombre}".`,
      duration: 4000,
    });

    try {
      setCancelando(true);
      const { data } = await planesAPI.cancelarSuscripcion();

      if (data?.success) {
        showNotification({
          type: "success",
          title: "Suscripción cancelada",
          message:
            "Tu suscripción se cancelará al final del período actual. Seguirás teniendo acceso hasta entonces.",
          duration: 6000,
        });

        setSuscripcion((prev) => ({
          ...prev,
          estado: "cancelada",
          fechaCancelacion: new Date(),
        }));
      } else {
        showNotification({
          type: "error",
          title: "Error al cancelar",
          message:
            data?.message || "No se pudo cancelar la suscripción.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error cancelando suscripción:", error);
      showNotification({
        type: "error",
        title: "Error al cancelar",
        message: "Ocurrió un error al cancelar la suscripción.",
        duration: 5000,
      });
    } finally {
      setCancelando(false);
    }
  };

  return (
    <>
      {/* NAVBAR SIEMPRE VISIBLE */}
      <Navbar currentSection="planes" />

      <div className="edit-perfil-page">
        {/* HEADER */}
        <div className="header">
          <div className="container">
            <div className="header-content">
              <div className="header-left">
                <h1>Perfil Tutor</h1>
                <p className="header-subtitle">Container</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
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
                      {perfil.nombre}
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <p className="form-input readonly-input">
                      {perfil.apellido}
                    </p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <p className="form-input readonly-input">{perfil.email}</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <p className="form-input readonly-input">
                      {perfil.telefono}
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

              {/* --- SUSCRIPCIÓN COMO CARD --- */}
              <div className="form-section">
                <h3 className="section-title">Suscripción</h3>

                {suscripcion && suscripcion.id_plan ? (
                  <div className="subscription-card">
                    <div className="subscription-card-header">
                      <div>
                        <p className="subscription-label">Plan actual</p>
                        <h4 className="subscription-name">
                          {suscripcion.id_plan.nombre}
                        </h4>
                      </div>
                      <span
                        className={`subscription-status ${
                          suscripcion.estado === "cancelada"
                            ? "cancelled"
                            : "active"
                        }`}
                      >
                        {suscripcion.estado === "cancelada"
                          ? "Cancelado"
                          : "Activo"}
                      </span>
                    </div>

                    <div className="subscription-card-body">
                      <div className="subscription-price-block">
                        <span className="subscription-price-amount">
                          ${suscripcion.id_plan.precio.toFixed(2)}
                        </span>
                        <span className="subscription-price-tag">USD</span>
                      </div>

                      <div className="subscription-meta">
                        <div className="subscription-meta-item">
                          <span className="meta-label">Duración</span>
                          <span className="meta-value">
                            {suscripcion.id_plan.duracionDias} días
                          </span>
                        </div>
                        <div className="subscription-meta-item">
                          <span className="meta-label">Límite de cursos</span>
                          <span className="meta-value">
                            {suscripcion.id_plan.cantidadCursos}
                          </span>
                        </div>
                        <div className="subscription-meta-item">
                          <span className="meta-label">Inicio</span>
                          <span className="meta-value">
                            {new Date(
                              suscripcion.inicio
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="subscription-meta-item">
                          <span className="meta-label">Fin</span>
                          <span className="meta-value">
                            {new Date(
                              suscripcion.fin
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {suscripcion.estado === "cancelada" && (
                        <div className="subscription-cancelled-notice">
                          <p>
                            <strong>Suscripción cancelada</strong> - Vigente
                            hasta el{" "}
                            {new Date(
                              suscripcion.fin
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {suscripcion.id_plan.descripcion && (
                        <p className="subscription-description">
                          {suscripcion.id_plan.descripcion}
                        </p>
                      )}

                      {suscripcion.estado === "activa" && (
                        <button
                          type="button"
                          onClick={handleCancelarSuscripcion}
                          disabled={cancelando}
                          className="subscription-cancel-btn"
                        >
                          {cancelando
                            ? "Cancelando..."
                            : "Cancelar Suscripción"}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="subscription-card subscription-card-empty">
                    <h4 className="subscription-empty-title">
                      Sin suscripción activa
                    </h4>
                    <p className="subscription-empty-text">
                      Aún no tienes un plan contratado. Explora nuestros
                      planes para comenzar a publicar y gestionar tus cursos.
                    </p>
                    <Link to="/planes" className="subscription-cta">
                      Ver planes disponibles
                    </Link>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="form-section">
                <h3 className="section-title">Descripción</h3>
                <div className="form-group">
                  <label className="form-label">Biografía</label>
                  <p className="form-textarea readonly-input">
                    {perfil.descripcion ||
                      "Aún no has agregado una biografía."}
                  </p>
                </div>
              </div>

              {/* Acciones */}
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
                  onClick={() => navigate("/tutor/perfil/editar")}
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

export default PerfilTutor;
