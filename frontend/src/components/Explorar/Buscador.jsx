import "../../styles/Explorar/buscador.css";

const Buscador = ({
  searchTerm,
  onSearchChange,
  tags,
  activeTags,
  onTagToggle,
  onClear,
}) => {
  return (
    <section className="buscador-wrapper">
      <div className="buscador-inner">
        <h2 className="buscador-title">Buscar cursos</h2>

        <div className="buscador-box">
          <input
            type="text"
            className="buscador-input"
            placeholder="Busca por nombre o tema..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="buscador-clear-btn"
              onClick={onClear}
            >
              Limpiar
            </button>
          )}
        </div>

        {tags?.length > 0 && (
          <div className="buscador-tags">
            {tags.map((tag) => {
              const isActive = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`buscador-tag ${
                    isActive ? "buscador-tag-active" : ""
                  }`}
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Buscador;
