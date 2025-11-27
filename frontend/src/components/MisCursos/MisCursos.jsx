import { useState, useMemo } from "react";
import Buscador from "../Explorar/Buscador";
import MisCursoCard from "./MisCursoCard";
import "../../styles/MisCursos/misCursos.css";

const misCursosMock = [
  {
    id: 101,
    titulo: "Python para principiantes",
    tag: "Programación",
    descripcion:
      "Aprende los fundamentos de Python",
    nivel: "Inicial",
    duracion: "8 horas",
    estado: "calificar", 
  },
  {
    id: 102,
    titulo: "Organiza tu estudio con Notion",
    tag: "Productividad",
    descripcion:
      "Crea tu sistema personal de organización ",
    nivel: "Todos los niveles",
    duracion: "3 horas",
    estado: "programado", 
    fecha: "Abr 1, 2025",
    hora: "9:41 AM",
  },
  {
    id: 103,
    titulo: "Marketing en redes sociales",
    tag: "Marketing",
    descripcion:
      "Estrategias para crecer tu audiencia en redes sociales.",
    nivel: "Intermedio",
    duracion: "5 horas",
    estado: "calificar",
  },
];

const tagsMock = ["En progreso", "Pendientes de calificar", "Completados"];

const MisCursos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);

  const toggleTag = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };


  const cursosFiltrados = useMemo(() => {
    return misCursosMock.filter((curso) => {
      const textMatch =
        searchTerm.trim() === "" ||
        curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.tag.toLowerCase().includes(searchTerm.toLowerCase());
      const tagsMatch = activeTags.length === 0 || true;

      return textMatch && tagsMatch;
    });
  }, [searchTerm, activeTags]);

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
          {cursosFiltrados.length > 0 ? (
            cursosFiltrados.map((curso) => (
              <MisCursoCard key={curso.id} {...curso} />
            ))
          ) : (
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
