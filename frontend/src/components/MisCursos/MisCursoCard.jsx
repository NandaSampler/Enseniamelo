import "../../styles/Explorar/cursoCard.css";
import "../../styles/MisCursos/misCursoCard.css";
import { Link } from "react-router-dom";

const tagColors = {
  Programación: "tag-blue",
  Productividad: "tag-green",
  Marketing: "tag-pink",
};

const MisCursoCard = ({
  id,
  titulo,
  tag,
  descripcion,
  nivel,
  duracion,
  estado,
  fecha,
  hora,
}) => {
  const tagClass = tagColors[tag] || "tag-default";

  const showCalificar = estado === "calificar";
  const showFecha = estado === "programado" && fecha && hora;

  return (
    <Link to={`/curso/${id}`} className="block">
      <article className="curso-card miscurso-card hover:shadow-md transition-shadow">
        <div className="curso-thumb" />

        <div className="curso-content">
          <div className="miscurso-header-row">
            <div>
              <div className="curso-title-row">
                <h3 className="curso-title">{titulo}</h3>
              </div>

              {tag && (
                <span className={`curso-tag ${tagClass}`}>
                  {tag}
                </span>
              )}
            </div>

            {showCalificar && (
              <button type="button" className="miscurso-calificar">
                Calificar
              </button>
            )}

            {showFecha && (
              <div className="miscurso-fecha-wrapper">
                <span className="miscurso-fecha-chip">{fecha}</span>
                <span className="miscurso-fecha-chip">{hora}</span>
              </div>
            )}
          </div>

          <p className="curso-description">{descripcion}</p>

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

export default MisCursoCard;
