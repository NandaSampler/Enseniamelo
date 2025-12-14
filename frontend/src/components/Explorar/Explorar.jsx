import { useEffect, useMemo, useState } from "react";
import { categoriasAPI, cursosAPI } from "../../api/cursos";
import "../../styles/Explorar/explorar.css";
import Buscador from "./Buscador";
import CursoCard from "./CursoCard";

const PER_PAGE = 6;

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // 1) CATEGORÍAS
        const catResp = await categoriasAPI.getCategorias();
        const catData = catResp?.data;

        const cats = Array.isArray(catData)
          ? catData
          : (catData?.success && Array.isArray(catData.categorias) ? catData.categorias : []);

        // mapa local id -> nombre
        const catMap = new Map();
        (cats || []).forEach((c) => {
          const id = c?.id || c?._id;
          if (id) catMap.set(String(id), c?.nombre || String(id));
        });

        if (import.meta.env.DEV) {
          console.log("✅ categorias:", cats);
        }

        if (mounted) setCategorias(cats);

        // 2) CURSOS (públicos)
        const cursosResp = await cursosAPI.getCursos();
        const cursosData = cursosResp?.data;

        const raw = Array.isArray(cursosData)
          ? cursosData
          : (cursosData?.success && Array.isArray(cursosData.cursos) ? cursosData.cursos : []);

        if (import.meta.env.DEV) {
          console.log("✅ cursos raw:", raw);
        }

        const publicados = (raw || [])
          .filter((c) => {
            const activo = c?.activo !== false;
            const estadoOk = !c?.estado || c?.estado === "activo";
            const verifOk = !c?.verificacion_estado || c?.verificacion_estado === "aceptado";
            return activo && estadoOk && verifOk;
          })
          .map((c) => {
            const id = c?.id || c?._id;
            const categoriasIds = Array.isArray(c?.categorias) ? c.categorias : [];

            const categoriasNombres = categoriasIds.map((cid) => {
              const key = String(cid);
              return catMap.get(key) || key;
            });

            const tag =
              (Array.isArray(c?.tags) && c.tags[0]) ||
              categoriasNombres[0] ||
              "General";

            return {
              id,
              titulo: c?.nombre || "",
              descripcion: c?.descripcion || "",
              tag,
              categorias: categoriasNombres, // nombres
              modalidad: c?.modalidad,
              precio: c?.precio_reserva,
              portada: c?.portada_url,
            };
          });

        if (mounted) setCursos(publicados);
      } catch (err) {
        console.error("❌ Error en Explorar:", {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });

        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Error al obtener los cursos. Inténtalo de nuevo más tarde.";

        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const cursosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return cursos.filter((curso) => {
      const textMatch =
        term === "" ||
        (curso.titulo || "").toLowerCase().includes(term) ||
        (curso.descripcion || "").toLowerCase().includes(term) ||
        (curso.tag || "").toLowerCase().includes(term);

      const hasTodos = activeTags.includes("Todos");
      if (activeTags.length === 0 || hasTodos) return textMatch;

      const categoriaMatch = Array.isArray(curso.categorias)
        ? curso.categorias.some((nombre) => activeTags.includes(nombre))
        : false;

      return textMatch && categoriaMatch;
    });
  }, [searchTerm, activeTags, cursos]);

  const totalPages = Math.max(1, Math.ceil(cursosFiltrados.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PER_PAGE;
  const cursosPagina = cursosFiltrados.slice(startIndex, startIndex + PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(() => {
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
        tags={["Todos", ...(categorias || []).map((c) => c?.nombre).filter(Boolean)]}
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
          {loading && <p className="explorar-empty">Cargando cursos...</p>}

          {!loading && error && (
            <p className="explorar-empty text-red-500">{error}</p>
          )}

          {!loading && !error && (
            <>
              {cursosPagina.length > 0 ? (
                cursosPagina.map((curso) => <CursoCard key={curso.id} {...curso} />)
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
