import "../../styles/Admin/cardAdmin.css";

const CardAdmin = ({ solicitud, onDetail, onReject, onAccept }) => {
  const { curso, perfil_tutor, estado, comentario, creado } = solicitud;

  // Normalizar el estado a minúsculas
  const estadoNormalizado = String(estado || "").toLowerCase();

  const estadoLabel =
    estadoNormalizado === "PENDIENTE"
      ? "Pendiente"
      : estadoNormalizado === "ACEPTADO"
      ? "Aceptado"
      : "Rechazado";

  return (
    <article className="admin-card">
      <div className="admin-card-left">
        <div className="admin-card-avatar">
          <span className="admin-card-avatar-icon">👤</span>
        </div>

        <div className="admin-card-info">
          <div className="admin-card-header">
            <h3 className="admin-card-title">{curso.titulo}</h3>
            <span className={`admin-card-status admin-card-status-${estadoNormalizado}`}>
              {estadoLabel}
            </span>
          </div>

          <p className="admin-card-meta">
            {perfil_tutor.nombre_tutor}
            {curso.modalidad && <span> • {curso.modalidad}</span>}
            {curso.precio && <span> • {curso.precio}</span>}
          </p>

          <p className="admin-card-description">
            {comentario || curso.descripcion}
          </p>

          {creado && (
            <p className="admin-card-date">
              Creado: {creado}
            </p>
          )}
        </div>
      </div>

      <div className="admin-card-actions">
        <button
          type="button"
          className="admin-card-btn admin-card-btn-secondary"
          onClick={onDetail}
        >
          Detalles
        </button>

        {estadoNormalizado === "pendiente" && (
          <>
            <button
              type="button"
              className="admin-card-btn admin-card-btn-outline"
              onClick={onReject}
            >
              Rechazar
            </button>

            <button
              type="button"
              className="admin-card-btn admin-card-btn-primary"
              onClick={onAccept}
            >
              Aceptar
            </button>
          </>
        )}
      </div>
    </article>
  );
};

export default CardAdmin;