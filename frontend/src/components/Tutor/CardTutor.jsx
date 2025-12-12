import "../../styles/Tutor/cardTutor.css";
import { useNavigate } from "react-router-dom";

const EstadoBadge = ({ estado }) => {
  const label = estado || "no_solicitado";
  const cls = `tutor-curso-estado tutor-curso-estado-${label}`;
  const textMap = {
    pendiente: "Pendiente",
    aceptado: "Aceptado",
    rechazado: "Rechazado",
    no_solicitado: "Sin verificación",
  };

  return <span className={cls}>{textMap[label] || label}</span>;
};

const CardTutor = ({ id, titulo, descripcion, categorias, precio, modalidad, verificacion_estado }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/curso/${id}`);
  };

  const categoriasTexto = Array.isArray(categorias)
    ? categorias.map((c) => c.nombre || c).join(", ")
    : "";

  return (
    <article className="tutor-curso-card" onClick={handleClick}>
      <div className="tutor-curso-main">
        <h3 className="tutor-curso-title">{titulo}</h3>
        {categoriasTexto && (
          <p className="tutor-curso-categorias">{categoriasTexto}</p>
        )}
        <p className="tutor-curso-descripcion">{descripcion}</p>
      </div>

      <div className="tutor-curso-meta">
        <div className="tutor-curso-precio-modalidad">
          <span className="tutor-curso-precio">Bs {precio}</span>
          <span className="tutor-curso-modalidad">{modalidad}</span>
        </div>
        <EstadoBadge estado={verificacion_estado} />
      </div>
    </article>
  );
};

export default CardTutor;
