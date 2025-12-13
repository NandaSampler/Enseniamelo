import { useState, useMemo, useEffect } from "react";
import Buscador from "../Explorar/Buscador";
import MisCursoCard from "./MisCursoCard";
import { reservasAPI } from "../../api/reservas";
import "../../styles/MisCursos/misCursos.css";

const tagsMock = ["En progreso", "Pendientes de calificar", "Completados"];

const MisCursos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [cursosReservados, setCursosReservados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await reservasAPI.getMisReservasEstudiante();
        if (data?.success && Array.isArray(data.reservas)) {
          const ahora = new Date();
          const estadosValidos = ["pendiente", "confirmada", "completada"];

          const mapped = data.reservas
            .filter((r) => estadosValidos.includes(r.estado))
            .map((r) => {
            const curso = r.id_curso || {};

            // Determinar fecha/hora de la clase
            const fechaClase = r.fecha ? new Date(r.fecha) : (r.id_horario?.inicio ? new Date(r.id_horario.inicio) : null);
            const tieneFecha = !!fechaClase;
            const fechaTexto = tieneFecha
              ? fechaClase.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null;
            const horaTexto = tieneFecha
              ? fechaClase.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            // Estado visual para filtros
            let estadoEtiqueta = "";
            if (r.estado === "pendiente" || r.estado === "confirmada") {
              estadoEtiqueta = "En progreso";
            }
            if (tieneFecha && fechaClase <= ahora && r.estado !== "cancelada") {
              estadoEtiqueta = "Pendientes de calificar";
            }
            if (r.estado === "completada") {
              estadoEtiqueta = "Completados";
            }

            // Nombres de categorías asociados al curso
            const categoriasNombres = Array.isArray(curso.categorias)
              ? curso.categorias
                  .map((c) => (typeof c === "string" ? c : c.nombre))
                  // Filtrar valores vacíos o que parezcan solo IDs (ObjectId de Mongo)
                  .filter((nombre) =>
                    nombre && !/^[0-9a-fA-F]{24}$/.test(nombre.trim())
                  )
              : [];

            // Tag principal: usamos la primera categoría como texto de búsqueda
            const tag = categoriasNombres[0] || "Curso";

            return {
              id: curso._id || r._id,
              titulo: curso.nombre || "Curso",
              tag,
              categoriasNombres,
              descripcion: curso.descripcion || "",
              nivel: "",
              duracion: "",
              estadoReserva: r.estado,
              estadoEtiqueta,
              fechaCompleta: fechaClase ? fechaClase.toISOString() : null,
              fecha: fechaTexto,
              hora: horaTexto,
              portada: curso.portada_url || "",
            };
          });

          // Eliminar duplicados por curso priorizando estados:
          // completada > confirmada > pendiente. Si hay empate, tomar la
          // reserva con fecha más reciente.
          const prioridad = {
            completada: 3,
            confirmada: 2,
            pendiente: 1,
          };

          const porCurso = mapped.reduce((acc, item) => {
            const key = item.id;
            const actual = acc[key];

            if (!actual) {
              acc[key] = item;
              return acc;
            }

            const pNuevo = prioridad[item.estadoReserva] || 0;
            const pActual = prioridad[actual.estadoReserva] || 0;

            if (pNuevo > pActual) {
              acc[key] = item;
              return acc;
            }

            if (pNuevo === pActual) {
              const fNuevo = item.fechaCompleta ? new Date(item.fechaCompleta) : null;
              const fActual = actual.fechaCompleta ? new Date(actual.fechaCompleta) : null;
              if (fNuevo && (!fActual || fNuevo > fActual)) {
                acc[key] = item;
              }
            }

            return acc;
          }, {});

          setCursosReservados(Object.values(porCurso));
        } else {
          setCursosReservados([]);
        }
      } catch (err) {
        console.error("Error obteniendo reservas del estudiante:", err);
        setError("No se pudieron cargar tus cursos reservados.");
        setCursosReservados([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  const cursosFiltrados = useMemo(() => {
    return cursosReservados.filter((curso) => {
      const textMatch =
        searchTerm.trim() === "" ||
        curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.tag.toLowerCase().includes(searchTerm.toLowerCase());

      const tagsMatch =
        activeTags.length === 0 ||
        (curso.estadoEtiqueta && activeTags.includes(curso.estadoEtiqueta));

      return textMatch && tagsMatch;
    });
  }, [searchTerm, activeTags, cursosReservados]);

  return (
    <div className="miscursos-page">
      <Buscador
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        tags={tagsMock}
        activeTags={activeTags}
        onTagToggle={toggleTag}
        onClear={() => setSearchTerm("")}
      />

      <main className="miscursos-main">
        <h2 className="miscursos-title">Mis cursos</h2>

        <section className="miscursos-grid">
          {loading && (
            <p className="miscursos-empty">Cargando tus cursos...</p>
          )}
          {!loading && error && (
            <p className="miscursos-empty">{error}</p>
          )}
          {!loading && !error && cursosFiltrados.length > 0 ? (
            cursosFiltrados.map((curso) => (
              <MisCursoCard key={curso.id} {...curso} />
            ))
          ) : null}
          {!loading && !error && cursosFiltrados.length === 0 && (
            <p className="miscursos-empty">
              Aún no tienes cursos en esta sección.
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default MisCursos;
