import "../../styles/Explorar/cursoCard.css";
import "../../styles/MisCursos/misCursoCard.css";
import { Link } from "react-router-dom";
import api from "../../api/config";

// Mismo mapa de colores que en CursoCard.jsx
const tagColors = {
  Programación: "tag-blue",
  Productividad: "tag-green",
  Marketing: "tag-pink",
};

const resolvePortadaUrl = (portada) => {
  if (!portada) return "";
  if (portada.startsWith("data:")) return portada;
  if (portada.startsWith("http://") || portada.startsWith("https://")) return portada;
  if (portada.startsWith("/")) {
    const baseApi = api.defaults.baseURL || "";
    const root = baseApi.replace(/\/+api\/?$/, "");
    return root + portada;
  }
  return portada;
};

const MisCursoCard = ({
  id,
  titulo,
  tag,
  categoriasNombres = [],
  descripcion,
  nivel,
  duracion,
  estadoReserva,
  fechaCompleta,
  fecha,
  hora,
  portada,
}) => {
  const ahora = new Date();
  const fechaClase = fechaCompleta ? new Date(fechaCompleta) : null;
  const portadaSrc = resolvePortadaUrl(portada);

  const showFecha = !!fechaClase && fecha && hora;
  const showCalificar =
    !!fechaClase && fechaClase <= ahora && estadoReserva !== "cancelada" && estadoReserva !== "completada";
  const showCalificadoChip = estadoReserva === "completada";

  return (
    <Link to={`/curso/${id}`} className="block">
      <article className="curso-card miscurso-card hover:shadow-md transition-shadow">
        <div className="curso-thumb">
          {portadaSrc && (
            <img
              src={portadaSrc}
              alt={titulo}
              className="curso-thumb-img"
            />
          )}
        </div>

        <div className="curso-content">
          <div className="miscurso-header-row">
            <div>
              <div className="curso-title-row">
                <h3 className="curso-title">{titulo}</h3>
              </div>

              <div className="curso-tags-row">
                {Array.isArray(categoriasNombres) && categoriasNombres.length > 0
                  ? categoriasNombres.map((nombre) => {
                      if (!nombre) return null;
                      const categoriaClass = tagColors[nombre] || "tag-default";
                      return (
                        <span
                          key={nombre}
                          className={`curso-tag ${categoriaClass}`}
                        >
                          {nombre}
                        </span>
                      );
                    })
                  : tag && (
                      <span
                        className={`curso-tag ${
                          tagColors[tag] || "tag-default"
                        }`}
                      >
                        {tag}
                      </span>
                    )}
              </div>
            </div>

            {showCalificar && (
              <button type="button" className="miscurso-calificar">
                Calificar
              </button>
            )}

            {showCalificadoChip && (
              <span className="miscurso-calificado-chip">Calificado</span>
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
