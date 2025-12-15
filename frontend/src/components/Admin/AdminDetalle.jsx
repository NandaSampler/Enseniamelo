import "../../styles/Admin/adminDetalle.css";
import api from "../../api/config";

// Función auxiliar para unir URLs
const joinUrl = (base = "", path = "") => {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "/");
  return b ? `${b}${p}` : p;
};

// Función mejorada basada en resolvePortadaUrl de CursoCard
const resolveStaticUrl = (url) => {
  if (!url) return "";

  // Si ya es una URL completa o un data URL, la devolvemos tal cual
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Si la ruta ya está bien formada, la unimos con la base de la API
  if (url.startsWith("/curso/") || url.startsWith("/uploads/")) {
    const base = api.defaults.baseURL || ""; // "/api" en desarrollo
    return joinUrl(base, url); // => "/api/curso/uploads/xxx.jpg"
  }

  // Para rutas relativas, asumimos que están en /uploads/curso/
  const base = api.defaults.baseURL || "";
  return joinUrl(base, `/uploads/curso/${url.replace(/^\/+/, "")}`);
};

const AdminDetalle = ({
  solicitud,
  onClose,
  onChangeEstado,
  onViewDocs,
  onAddComment,
}) => {
  if (!solicitud) return null;

  const { curso, perfil_tutor } = solicitud;

  return (
    <section className="admin-detail">
      <div className="admin-detail-left">
        <div className="admin-detail-media">
          {curso.portada_url || (curso.fotos && curso.fotos[0]) ? (
            <img
              src={resolveStaticUrl(curso.portada_url || curso.fotos[0])}
              alt={curso.nombre}
              className="admin-detail-media-img"
            />
          ) : (
            <div className="admin-detail-media-placeholder" />
          )}
        </div>

        <div className="admin-detail-tutor-section">
          <h3 className="admin-detail-section-subtitle">Información del Tutor</h3>
          <div className="admin-detail-tutor-row">
            <div className="admin-detail-tutor-info">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  perfil_tutor.nombre_tutor || "Tutor"
                )}&background=0EA5E9&color=0F172A`}
                alt={perfil_tutor.nombre_tutor || "Tutor"}
                className="admin-detail-tutor-avatar"
              />
              <div>
                <p className="admin-detail-tutor-name">
                  {perfil_tutor.nombre_tutor || "Tutor sin nombre"}
                </p>
                {perfil_tutor.email && (
                  <p className="admin-detail-tutor-contact">{perfil_tutor.email}</p>
                )}
                {perfil_tutor.telefono && (
                  <p className="admin-detail-tutor-contact">{perfil_tutor.telefono}</p>
                )}
              </div>
            </div>
          </div>
          {perfil_tutor.biografia && (
            <p className="admin-detail-tutor-bio">
              {perfil_tutor.biografia}
            </p>
          )}
        </div>
      </div>

      <div className="admin-detail-info">
        <div className="admin-detail-header-row">
          <h2 className="admin-detail-title">{curso.titulo || curso.nombre}</h2>

          <button
            type="button"
            className="admin-detail-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {curso.modalidad && (
          <span className="admin-detail-tag">{curso.modalidad}</span>
        )}

        <div className="admin-detail-price-row">
          <span className="admin-detail-arrow">→</span>
          <p className="admin-detail-price">
            {curso.precio || "Sin precio definido"}
          </p>
        </div>

        <div className="admin-detail-description-block">
          <h3 className="admin-detail-description-title">Descripción del curso</h3>
          <p className="admin-detail-summary">{curso.descripcion}</p>
        </div>

        <div className="admin-detail-meta-grid">
          <div>
            <p className="admin-detail-meta-label">CI tutor</p>
            <p className="admin-detail-meta-value">{perfil_tutor.ci}</p>
          </div>
          <div>
            <p className="admin-detail-meta-label">Estado verificación</p>
            <p className="admin-detail-meta-value">{"VERIFICADO"}</p>
          </div>
          <div>
            <p className="admin-detail-meta-label">Clasificación</p>
            <p className="admin-detail-meta-value">
              {perfil_tutor.clasificacion} / 5
            </p>
          </div>
          <div>
            <p className="admin-detail-meta-label">Estado solicitud</p>
            <p className="admin-detail-meta-value">
              {solicitud.estado.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="admin-detail-description-block">
          <h3 className="admin-detail-description-title">
            Comentario de la solicitud
          </h3>
          <p className="admin-detail-description-text">
            {solicitud.comentario || "Sin comentarios adicionales."}
          </p>
        </div>

        {solicitud.foto_ci && (
          <div className="admin-detail-description-block">
            <h3 className="admin-detail-description-title">Documento de identidad</h3>
            <button
              type="button"
              className="admin-detail-btn admin-detail-btn-light"
              onClick={() => window.open(resolveStaticUrl(solicitud.foto_ci), "_blank")}
            >
              Ver CI
            </button>
          </div>
        )}

        {Array.isArray(solicitud.archivos_verificacion) &&
          solicitud.archivos_verificacion.length > 0 && (
            <div className="admin-detail-description-block">
              <h3 className="admin-detail-description-title">
                Documentos adicionales
              </h3>
              <ul className="admin-detail-docs-list">
                {solicitud.archivos_verificacion.map((url, index) => (
                  <li key={url}>
                    <a
                      href={resolveStaticUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-detail-doc-link"
                    >
                      Documento {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div className="admin-detail-secondary-actions">
          <button
            type="button"
            className="admin-detail-btn admin-detail-btn-light"
            onClick={() => {
              const urls = solicitud.archivos_verificacion || [];
              if (urls.length > 0) {
                window.open(resolveStaticUrl(urls[0]), "_blank");
              }
            }}
          >
            Ver documentos
          </button>

          <button
            type="button"
            className="admin-detail-btn admin-detail-btn-light"
            onClick={onAddComment}
          >
            Agregar comentario
          </button>
        </div>

        <div className="admin-detail-actions">
          <button
            type="button"
            className="admin-detail-btn admin-detail-btn-outline"
            onClick={() => onChangeEstado("rechazado")}
          >
            Rechazar
          </button>

          <button
            type="button"
            className="admin-detail-btn admin-detail-btn-primary"
            onClick={() => onChangeEstado("aceptado")}
          >
            Aceptar
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminDetalle;