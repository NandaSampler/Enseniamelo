import { Link } from "react-router-dom";
import api from "../../api/config";
import "../../styles/Explorar/cursoCard.css";

const categoryColorClasses = [
  "curso-chip-color-1",
  "curso-chip-color-2",
  "curso-chip-color-3",
  "curso-chip-color-4",
];

const tagColors = {
  Programación: "tag-blue",
  Productividad: "tag-green",
  Marketing: "tag-pink",
};

// ✅ helper que faltaba
const joinUrl = (base = "", path = "") => {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "/");
  return b ? `${b}${p}` : p;
};

const resolvePortadaUrl = (portada) => {
  if (!portada) return "";

  if (portada.startsWith("data:")) return portada;
  if (portada.startsWith("http://") || portada.startsWith("https://")) return portada;

  // ✅ en DEV baseURL suele ser "/api" (proxy). Queremos "/api" + "/curso/uploads/.."
  if (portada.startsWith("/curso/") || portada.startsWith("/uploads/")) {
    const base = api.defaults.baseURL || ""; // "/api" en dev
    return joinUrl(base, portada);           // => "/api/curso/uploads/xxx.jpg"
  }

  return portada.startsWith("/") ? portada : `/${portada}`;
};

const CursoCard = ({ id, titulo, tag, descripcion, nivel, duracion, portada, categorias = [] }) => {
  const portadaSrc = resolvePortadaUrl(portada);

  const categoryNames = (Array.isArray(categorias) ? categorias : [])
    .map((cat) => (typeof cat === "string" ? cat : cat?.nombre))
    .filter(Boolean);

  const tagNormalized = (tag || "").trim();
  const tagAlreadyInCategories = categoryNames.some(
    (c) => c.toLowerCase() === tagNormalized.toLowerCase()
  );

  const showTag = tagNormalized && !tagAlreadyInCategories;

  return (
    <Link to={`/curso/${id}`} className="block">
      <article className="curso-card hover:shadow-md transition-shadow">
        <div className="curso-thumb">
          {portadaSrc && <img src={portadaSrc} alt={titulo} className="curso-thumb-img" />}
        </div>

        <div className="curso-content">
          <div>
            <div className="curso-title-row">
              <h3 className="curso-title">{titulo}</h3>
            </div>

            <div className="curso-tags-row">
              {categoryNames.map((nombre, index) => {
                const categoriaClass = categoryColorClasses[index % categoryColorClasses.length];
                return (
                  <span key={nombre} className={`curso-tag ${categoriaClass}`}>
                    {nombre}
                  </span>
                );
              })}

              {showTag && (
                <span className={`curso-tag ${tagColors[tagNormalized] || "tag-default"}`}>
                  {tagNormalized}
                </span>
              )}
            </div>

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
