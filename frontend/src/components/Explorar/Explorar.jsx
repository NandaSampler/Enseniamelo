import { useState, useMemo, useEffect } from "react";
import Buscador from "./Buscador";
import CursoCard from "./CursoCard";
import api from "../../api/config";
import { cursosAPI } from "../../api/cursos";
import "../../styles/Explorar/explorar.css";

const PER_PAGE = 6;

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCursos = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await cursosAPI.getCursos();
        if (data?.success && Array.isArray(data.cursos)) {
          const reales = data.cursos
            .filter((curso) => {
              const tutor = curso.id_tutor;
              const verificacionCurso = curso.verificacion_estado;

              if (!tutor || tutor.verificado !== "verificado") {
                return false;
              }

              // Caso nuevo: cursos con verificacion_estado deben estar aceptados
              if (typeof verificacionCurso === "string") {
                return verificacionCurso === "aceptado";
              }

              // Compatibilidad hacia atrás: si no hay campo, mostramos igual
              return true;
            })
            .map((curso) => ({
              id: curso._id,
              titulo: curso.nombre,
              descripcion: curso.descripcion,
              tag:
                (Array.isArray(curso.tags) && curso.tags[0]) ||
                (Array.isArray(curso.categorias) &&
                  curso.categorias[0]?.nombre) ||
                "General",
              categorias: Array.isArray(curso.categorias)
                ? curso.categorias
                : [],
              modalidad: curso.modalidad,
              precio: curso.precio_reserva,
              portada: curso.portada_url,
            }));

          setCursos(reales);
        } else {
          setError("No se pudieron cargar los cursos.");
        }
      } catch (error) {
        console.error("Error obteniendo cursos:", error);
        setError(
          error?.response?.data?.message ||
            "Error al obtener los cursos. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchCategorias = async () => {
      try {
        const { data } = await api.get("/categorias");
        if (data?.success && Array.isArray(data.categorias)) {
          setCategorias(data.categorias);
        }
      } catch (err) {
        console.error("Error obteniendo categorías:", err);
      }
    };

    fetchCursos();
    fetchCategorias();
  }, []);

  const handleToggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1); 
  };

  const cursosFiltrados = useMemo(() => {
    return cursos.filter((curso) => {
      const textMatch =
        searchTerm.trim() === "" ||
        curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.tag.toLowerCase().includes(searchTerm.toLowerCase());

      // Si no hay categorías activas o está seleccionado "Todos", no filtramos por categoría
      const hasTodos = activeTags.includes("Todos");
      if (activeTags.length === 0 || hasTodos) {
        return textMatch;
      }

      // Filtrar por categorías seleccionadas (por nombre)
      const nombresCategoriasCurso = Array.isArray(curso.categorias)
        ? curso.categorias.map((c) => c.nombre || c)
        : [];

      const categoriaMatch = nombresCategoriasCurso.some((nombre) =>
        activeTags.includes(nombre)
      );

      return textMatch && categoriaMatch;
    });
  }, [searchTerm, activeTags, cursos]);

  const totalPages = Math.max(1, Math.ceil(cursosFiltrados.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PER_PAGE;
  const cursosPagina = cursosFiltrados.slice(
    startIndex,
    startIndex + PER_PAGE
  );

  const goToPage = (page) => {
    setCurrentPage((prev) => {
      if (page < 1) return 1;
      if (page > totalPages) return totalPages;
      return page;
    });
  };

  return (
    <div className="explorar-page">
      <Buscador
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1); 
        }}
        tags={["Todos", ...categorias.map((c) => c.nombre)]}
        activeTags={activeTags}
        onTagToggle={handleToggleTag}
        onClear={() => {
          setSearchTerm("");
          setCurrentPage(1);
        }}
      />

      <main className="explorar-main">
        <h2 className="explorar-title">Explora cursos</h2>

        <section className="explorar-grid">
          {loading && (
            <p className="explorar-empty">Cargando cursos...</p>
          )}

          {!loading && error && (
            <p className="explorar-empty text-red-500">{error}</p>
          )}

          {!loading && !error && (
            <>
              {cursosPagina.length > 0 ? (
                cursosPagina.map((curso) => (
                  <CursoCard key={curso.id} {...curso} />
                ))
              ) : (
                <p className="explorar-empty">
                  No se encontraron cursos con esos filtros.
                </p>
              )}
            </>
          )}
        </section>

        {cursosFiltrados.length > PER_PAGE && (
          <div className="explorar-pagination">
            {safePage > 1 && (
              <button
                type="button"
                className="explorar-pagination-btn"
                onClick={() => goToPage(safePage - 1)}
              >
                ← Anterior
              </button>
            )}


            {[...Array(totalPages)].map((_, idx) => {
              const pageNumber = idx + 1;
              const isActive = pageNumber === safePage;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  className={
                    "explorar-page-number " +
                    (isActive ? "explorar-page-number-active" : "")
                  }
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Botón siguiente (solo se muestra si no estamos en la última) */}
            {safePage < totalPages && (
              <button
                type="button"
                className="explorar-pagination-btn"
                onClick={() => goToPage(safePage + 1)}
              >
                Siguiente →
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Explorar;
