import "../../styles/Explorar/cursoCard.css";
import { Link } from "react-router-dom";

const tagColors = {
  Programación: "tag-blue",
  Productividad: "tag-green",
  Marketing: "tag-pink",
};

const CursoCard = ({ id, titulo, tag, descripcion, nivel, duracion }) => {
  const tagClass = tagColors[tag] || "tag-default";

  return (
    <Link to={`/curso/${id}`} className="block">
      <article className="curso-card hover:shadow-md transition-shadow">
        <div className="curso-thumb" />

        <div className="curso-content">
          <div>
            <div className="curso-title-row">
              <h3 className="curso-title">{titulo}</h3>
            </div>

            {tag && (
              <span className={`curso-tag ${tagClass}`}>
                {tag}
              </span>
            )}

            <p className="curso-description">{descripcion}</p>
          </div>

          {(nivel || duracion) && (
            <div className="curso-meta">
              {nivel && <span className="mr-2">Nivel: {nivel}</span>}
              {duracion && <span>Duración: {duracion}</span>}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default CursoCard;
