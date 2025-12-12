import "../../styles/Admin/cardAdmin.css";

const CardAdmin = ({ solicitud, onDetail, onReject, onAccept }) => {
  const { curso, perfil_tutor, estado, comentario, creado } = solicitud;

  const estadoLabel =
    estado === "pendiente"
      ? "Pendiente"
      : estado === "aceptado"
      ? "Aceptado"
      : "Rechazado";

  return (
    <article className="admin-card">
      <div className="admin-card-left">
        <div className="admin-card-avatar">
          <span className="admin-card-avatar-icon">👤</span>
        </div>

        <div className="admin-card-info">
          <div className="admin-card-title-row">
            <h3 className="admin-card-title">{curso.nombre}</h3>
            <span className={`admin-card-status admin-card-status-${estado}`}>
              {estadoLabel}
            </span>
          </div>

          <p className="admin-card-meta">
            {perfil_tutor.nombre_tutor && (
              <span>{perfil_tutor.nombre_tutor}</span>
            )}
            {curso.modalidad && <span> • {curso.modalidad}</span>}
            {curso.necesita_reserva && curso.precio_reserva > 0 && (
              <span> • {curso.precio_reserva} Bs/hora</span>
            )}
          </p>

          <p className="admin-card-description">
            {comentario || curso.descripcion}
          </p>

          {creado && (
            <p className="admin-card-meta admin-card-meta-small">
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

        {estado === "pendiente" && (
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
