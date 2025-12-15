import { useEffect, useMemo, useState } from "react";
import { cursosAPI } from "../../api/cursos";
import { reservasAPI } from "../../api/reservas";
import "../../styles/MisCursos/misCursos.css";
import Buscador from "../Explorar/Buscador";
import MisCursoCard from "./MisCursoCard";

const tagsMock = ["En progreso", "Pendientes de calificar", "Completados"];

const isMongoObjectId = (v) => typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v.trim());
const safeLower = (v) => String(v || "").toLowerCase();

const normalizeCategorias = (categorias) => {
  if (!Array.isArray(categorias)) return [];
  return categorias
    .map((c) => (typeof c === "string" ? c : c?.nombre))
    .filter(Boolean)
    .filter((nombre) => !isMongoObjectId(nombre));
};

const normalizeCursoData = (axiosRespData) => {
  // soporta: curso directo, {curso}, {success, curso}
  if (!axiosRespData) return null;
  if (axiosRespData?.curso) return axiosRespData.curso;
  if (axiosRespData?.success && axiosRespData?.curso) return axiosRespData.curso;
  return axiosRespData;
};

const MisCursos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [cursosReservados, setCursosReservados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  useEffect(() => {
    let cancelled = false;

    const fetchReservasYCurso = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await reservasAPI.getMisReservasEstudiante();

        // ✅ Soporta ambos formatos:
        // - backend actual: Array
        // - backend viejo: { success, reservas: [] }
        const reservas = Array.isArray(data) ? data : Array.isArray(data?.reservas) ? data.reservas : [];

        const ahora = new Date();
        const estadosValidos = ["pendiente", "confirmada", "completada", "cancelada"];

        // 1) Reservas -> baseItems con idCurso SIEMPRE string
        const baseItems = reservas
          .filter((r) => estadosValidos.includes(r?.estado))
          .map((r) => {
            const idCurso =
              typeof r?.id_curso === "object" ? r.id_curso?._id || r.id_curso?.id : r?.id_curso;

            const fechaClase = r?.fecha
              ? new Date(r.fecha)
              : r?.id_horario?.inicio
              ? new Date(r.id_horario.inicio)
              : null;

            const tieneFecha = !!fechaClase && !Number.isNaN(fechaClase.getTime());

            const fechaTexto = tieneFecha
              ? fechaClase.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
              : null;

            const horaTexto = tieneFecha
              ? fechaClase.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
              : null;

            let estadoEtiqueta = "";
            if (r?.estado === "completada") estadoEtiqueta = "Completados";
            else if (tieneFecha && fechaClase <= ahora && r?.estado !== "cancelada") estadoEtiqueta = "Pendientes de calificar";
            else if (r?.estado === "pendiente" || r?.estado === "confirmada") estadoEtiqueta = "En progreso";

            return {
              reservaId: r?.id || r?._id,
              idCurso: idCurso ? String(idCurso) : null,
              estadoReserva: r?.estado || "pendiente",
              estadoEtiqueta,
              fechaCompleta: tieneFecha ? fechaClase.toISOString() : null,
              fecha: fechaTexto,
              hora: horaTexto,
            };
          })
          .filter((x) => x.idCurso);

        // 2) Deduplicar por curso (prioridad de estados)
        const prioridad = { completada: 3, confirmada: 2, pendiente: 1, cancelada: 0 };

        const porCurso = baseItems.reduce((acc, item) => {
          const key = item.idCurso;
          const actual = acc[key];

          if (!actual) {
            acc[key] = item;
            return acc;
          }

          const pNuevo = prioridad[item.estadoReserva] ?? 0;
          const pActual = prioridad[actual.estadoReserva] ?? 0;

          if (pNuevo > pActual) {
            acc[key] = item;
            return acc;
          }

          if (pNuevo === pActual) {
            const fNuevo = item.fechaCompleta ? new Date(item.fechaCompleta) : null;
            const fActual = actual.fechaCompleta ? new Date(actual.fechaCompleta) : null;
            if (fNuevo && (!fActual || fNuevo > fActual)) acc[key] = item;
          }

          return acc;
        }, {});

        const dedup = Object.values(porCurso);

        // 3) Hidratar cursos por idCurso
        const idsUnicos = [...new Set(dedup.map((x) => x.idCurso))];

        const cursosResults = await Promise.allSettled(
          idsUnicos.map(async (idCurso) => {
            const resp = await cursosAPI.getCurso(idCurso);
            const curso = normalizeCursoData(resp?.data);
            return { idCurso, curso };
          })
        );

        // Debug de fallos (si alguno no se puede traer)
        const rejected = cursosResults.filter((r) => r.status === "rejected");
        if (rejected.length) {
          console.warn(
            "❌ No se pudieron hidratar cursos:",
            rejected.map((r) => r.reason?.message || r.reason)
          );
        }

        const cursosById = {};
        for (const r of cursosResults) {
          if (r.status === "fulfilled" && r.value?.idCurso) {
            cursosById[r.value.idCurso] = r.value.curso || {};
          }
        }

        // 4) Armar cards finales con detalles reales
        const mapped = dedup.map((res) => {
          const c = cursosById[res.idCurso] || {};

          const categoriasNombres = normalizeCategorias(c?.categorias);
          const tag = (Array.isArray(c?.tags) && c.tags[0]) || categoriasNombres[0] || "Curso";

          return {
            // ✅ IMPORTANTE: el link debe usar el ID del curso
            idCurso: res.idCurso,
            reservaId: res.reservaId,

            titulo: c?.nombre || "Curso",
            tag,
            categoriasNombres,
            descripcion: c?.descripcion || "",

            nivel: "",
            duracion: "",

            estadoReserva: res.estadoReserva,
            estadoEtiqueta: res.estadoEtiqueta,

            fechaCompleta: res.fechaCompleta,
            fecha: res.fecha,
            hora: res.hora,

            portada: c?.portada_url || "",
          };
        });

        if (!cancelled) setCursosReservados(mapped);
      } catch (err) {
        console.error("Error obteniendo reservas/cursos:", err);
        if (!cancelled) {
          setError("No se pudieron cargar tus cursos reservados.");
          setCursosReservados([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReservasYCurso();
    return () => {
      cancelled = true;
    };
  }, []);

  const cursosFiltrados = useMemo(() => {
    return cursosReservados.filter((curso) => {
      const textMatch =
        searchTerm.trim() === "" ||
        safeLower(curso.titulo).includes(safeLower(searchTerm)) ||
        safeLower(curso.descripcion).includes(safeLower(searchTerm)) ||
        safeLower(curso.tag).includes(safeLower(searchTerm));

      const tagsMatch =
        activeTags.length === 0 || (curso.estadoEtiqueta && activeTags.includes(curso.estadoEtiqueta));

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
          {loading && <p className="miscursos-empty">Cargando tus cursos...</p>}

          {!loading && error && <p className="miscursos-empty">{error}</p>}

          {!loading && !error && cursosFiltrados.length > 0 &&
            cursosFiltrados.map((curso) => (
              <MisCursoCard key={`${curso.idCurso}-${curso.reservaId || "r"}`} {...curso} />
            ))}

          {!loading && !error && cursosFiltrados.length === 0 && (
            <p className="miscursos-empty">Aún no tienes cursos en esta sección.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default MisCursos;
