// frontend/src/components/Perfiles/PerfilTutor.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Perfiles/perfilEstudiante.css";
import "../../styles/Perfiles/perfilTutor.css";
import { authAPI } from "../../api/auth";
import api from "../../api/config";
import { useNotification } from "../NotificationProvider";
import Navbar from "../Navbar";

const PAYMENTS_PREFIX = "/ms-payments/v1";

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

  const [mongoId, setMongoId] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [suscripcionRaw, setSuscripcionRaw] = useState(null);

  const [cancelando, setCancelando] = useState(false);

  // Perfil del tutor
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.data?.success) {
          const user = response.data.user;
          setPerfil({
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            telefono: user.telefono || "",
            foto: user.foto || "",
            descripcion: user.descripcion || "",
          });
          return;
        }
      } catch {}

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setPerfil({
        nombre: userData.nombre || "",
        apellido: userData.apellido || "",
        email: userData.email || "",
        telefono: userData.telefono || "",
        foto: userData.foto || "",
        descripcion: userData.descripcion || "",
      });
    };

    fetchUserProfile();
  }, []);

  // /me -> mongoId
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const meRes = await api.get("/v1/auth/me");
        const me = meRes?.data;
        if (me?.id) setMongoId(me.id);
      } catch (e) {
        // si falla, lo dejamos null
      }
    };
    fetchMe();
  }, []);

  // Planes (para enriquecer)
  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const res = await api.get(`${PAYMENTS_PREFIX}/planes/`);
        setPlanes(Array.isArray(res.data) ? res.data : []);
      } catch {}
    };
    fetchPlanes();
  }, []);

  // Suscripción del tutor (con fallback)
  useEffect(() => {
    if (!mongoId) return;

    const fetchSubsForUser = async (userId) => {
      // 1) intento filtrado backend
      try {
        const r1 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`, {
          params: { id_usuario: userId },
        });
        const list1 = Array.isArray(r1.data) ? r1.data : [];
        if (list1.length > 0) return list1;
      } catch {}

      // 2) fallback: todas y filtrar front
      const r2 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`);
      const list2 = Array.isArray(r2.data) ? r2.data : [];
      return list2.filter((s) => String(s?.id_usuario) === String(userId));
    };

    const fetchSuscripcion = async () => {
      try {
        const subs = await fetchSubsForUser(mongoId);

        const found =
          subs.find((s) => s.estado === "activa") ||
          subs.find((s) => s.estado === "pendiente") ||
          null;

        setSuscripcionRaw(found);
      } catch (error) {
        console.error("Error obteniendo suscripción del tutor:", error);
      }
    };

    fetchSuscripcion();
  }, [mongoId]);

  // Enriquecer id_plan (porque viene string)
  const suscripcion = useMemo(() => {
    if (!suscripcionRaw) return null;

    // si ya viene como objeto (por si algún día cambias backend)
    if (suscripcionRaw.id_plan && typeof suscripcionRaw.id_plan === "object") {
      return suscripcionRaw;
    }

    const planObj = planes.find((p) => String(p.id) === String(suscripcionRaw.id_plan));
    return {
      ...suscripcionRaw,
      id_plan: planObj || null,
    };
  }, [suscripcionRaw, planes]);

  // Cancelación (aquí solo dejo UI, porque tu backend actual no mostró endpoint de cancelación)
  const handleCancelarSuscripcion = async () => {
    if (!suscripcion || cancelando) return;

    showNotification({
      type: "warning",
      title: "Cancelación",
      message: "Aún no hay endpoint de cancelación conectado en el frontend.",
      duration: 5000,
    });

    setCancelando(false);
  };

  return (
    <>
      <Navbar currentSection="planes" />

      <div className="edit-perfil-page">
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

        <div className="main-content">
          <div className="container">
            <div className="edit-form">
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

              <div className="form-section">
                <h3 className="section-title">Suscripción</h3>

                {suscripcion && suscripcion.id_plan ? (
                  <div className="subscription-card">
                    <div className="subscription-card-header">
                      <div>
                        <p className="subscription-label">Plan actual</p>
                        <h4 className="subscription-name">{suscripcion.id_plan.nombre}</h4>
                      </div>
                      <span className="subscription-status active">{suscripcion.estado}</span>
                    </div>

                    <div className="subscription-card-body">
                      <div className="subscription-price-block">
                        <span className="subscription-price-amount">
                          ${Number(suscripcion.id_plan.precio).toFixed(2)}
                        </span>
                        <span className="subscription-price-tag">USD</span>
                      </div>

                      <div className="subscription-meta">
                        <div className="subscription-meta-item">
                          <span className="meta-label">Duración</span>
                          <span className="meta-value">{suscripcion.id_plan.duracionDias} días</span>
                        </div>
                        <div className="subscription-meta-item">
                          <span className="meta-label">Límite de cursos</span>
                          <span className="meta-value">{suscripcion.id_plan.cantidadCursos}</span>
                        </div>
                        <div className="subscription-meta-item">
                          <span className="meta-label">Inicio</span>
                          <span className="meta-value">
                            {suscripcion.inicio ? new Date(suscripcion.inicio).toLocaleDateString() : "-"}
                          </span>
                        </div>
                        <div className="subscription-meta-item">
                          <span className="meta-label">Fin</span>
                          <span className="meta-value">
                            {suscripcion.fin ? new Date(suscripcion.fin).toLocaleDateString() : "-"}
                          </span>
                        </div>
                      </div>

                      {suscripcion.id_plan.descripcion && (
                        <p className="subscription-description">{suscripcion.id_plan.descripcion}</p>
                      )}

                      {suscripcion.estado === "activa" && (
                        <button
                          type="button"
                          onClick={handleCancelarSuscripcion}
                          disabled={cancelando}
                          className="subscription-cancel-btn"
                        >
                          {cancelando ? "Cancelando..." : "Cancelar Suscripción"}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="subscription-card subscription-card-empty">
                    <h4 className="subscription-empty-title">Sin suscripción activa</h4>
                    <p className="subscription-empty-text">
                      Aún no tienes un plan contratado. Explora nuestros planes para comenzar.
                    </p>
                    <Link to="/planes" className="subscription-cta">
                      Ver planes disponibles
                    </Link>
                  </div>
                )}
              </div>

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
                <button type="button" onClick={() => navigate("/mis-cursos")} className="cancel-btn">
                  Volver
                </button>
                <button type="button" className="save-btn" onClick={() => navigate("/tutor/perfil/editar")}>
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
