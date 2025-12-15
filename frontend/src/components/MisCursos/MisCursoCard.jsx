import { Link } from "react-router-dom";
import api from "../../api/config";
import "../../styles/Explorar/cursoCard.css";
import "../../styles/MisCursos/misCursoCard.css";

// Mismo mapa de colores que en CursoCard.jsx
const tagColors = {
  Programación: "tag-blue",
  Productividad: "tag-green",
  Marketing: "tag-pink",
};

const joinUrl = (base, path) => {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  if (!b) return `/${p}`;
  if (!p) return b;
  return `${b}/${p}`;
};

const resolvePortadaUrl = (portada) => {
  if (!portada) return "";
  if (portada.startsWith("data:")) return portada;
  if (portada.startsWith("http://") || portada.startsWith("https://")) return portada;

  // ✅ En dev: baseURL="/api" y portada="/curso/uploads/..." => "/api/curso/uploads/..."
  if (portada.startsWith("/")) {
    const base = api.defaults.baseURL || ""; // "/api"
    return joinUrl(base, portada);
  }

  return portada;
};

const MisCursoCard = ({
  // ✅ ahora el ID correcto para navegar es idCurso
  idCurso,
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

  // ✅ por si llega vacío
  const safeCursoId = idCurso || "";

  return (
    <Link to={`/curso/${safeCursoId}`} className="block">
      <article className="curso-card miscurso-card hover:shadow-md transition-shadow">
        <div className="curso-thumb">
          {portadaSrc && <img src={portadaSrc} alt={titulo} className="curso-thumb-img" />}
        </div>

        <div className="curso-content">
          <div className="miscurso-header-row">
            <div>
              <div className="curso-title-row">
                <h3 className="curso-title">{titulo}</h3>
              </div>

              <div className="curso-tags-row">
                {Array.isArray(categoriasNombres) && categoriasNombres.length > 0 ? (
                  categoriasNombres.map((nombre) => {
                    if (!nombre) return null;
                    const categoriaClass = tagColors[nombre] || "tag-default";
                    return (
                      <span key={nombre} className={`curso-tag ${categoriaClass}`}>
                        {nombre}
                      </span>
                    );
                  })
                ) : tag ? (
                  <span className={`curso-tag ${tagColors[tag] || "tag-default"}`}>{tag}</span>
                ) : null}
              </div>
            </div>

            {showCalificar && <button type="button" className="miscurso-calificar">Calificar</button>}

            {showCalificadoChip && <span className="miscurso-calificado-chip">Calificado</span>}

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
