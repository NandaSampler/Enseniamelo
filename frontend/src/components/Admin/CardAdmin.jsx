import "../../styles/Admin/cardAdmin.css";

const CardAdmin = ({ solicitud, onDetail, onReject, onAccept }) => {
  const { curso, perfil_tutor, estado, comentario, creado } = solicitud;

  const estadoNormalizado = String(estado || "pendiente").toLowerCase();

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "aceptado":
      case "aprobado":
        return "Aceptado";
      case "rechazado":
        return "Rechazado";
      default:
        return "Pendiente";
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "aceptado":
      case "aprobado":
        return "aceptado";
      case "rechazado":
        return "rechazado";
      case "pendiente":
      default:
        return "pendiente";
    }
  };

  const estadoLabel = getEstadoLabel(estadoNormalizado);
  const estadoClass = getEstadoClass(estadoNormalizado);

  return (
    <article className="admin-card">
      <div className="admin-card-left">
        <div className="admin-card-avatar">
          <span className="admin-card-avatar-icon">👤</span>
        </div>

        <div className="admin-card-info">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              {curso?.titulo || curso?.nombre || "Sin título"}
            </h3>
            <span className={`admin-card-status admin-card-status-${estadoClass}`}>
              {estadoLabel}
            </span>
          </div>

          <p className="admin-card-meta">
            {perfil_tutor?.nombre_tutor || "Tutor"}
            {curso?.modalidad && <span> • {curso.modalidad}</span>}
            {curso?.precio && <span> • {curso.precio}</span>}
          </p>

          <p className="admin-card-description">
            {comentario || curso?.descripcion || "Sin descripción"}
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
          aria-label="Ver detalles de la solicitud"
        >
          Detalles
        </button>

        {estadoNormalizado === "pendiente" && (
          <>
            <button
              type="button"
              className="admin-card-btn admin-card-btn-outline"
              onClick={onReject}
              aria-label="Rechazar solicitud"
            >
              Rechazar
            </button>

            <button
              type="button"
              className="admin-card-btn admin-card-btn-primary"
              onClick={onAccept}
              aria-label="Aceptar solicitud"
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