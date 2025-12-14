import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatsAPI } from "../../api/chats";
import { comentariosAPI } from "../../api/comentarios";
import api from "../../api/config";
import { cursosAPI } from "../../api/cursos";
import { reservasAPI } from "../../api/reservas";
import "../../styles/InfoCurso/infoCurso.css";
import "../../styles/InfoCurso/reviewCard.css";
import { useNotification } from "../NotificationProvider";

// 🔹 Fallback
const cursoMock = {
  titulo: "Título del curso",
  tag: "General",
  precio: "0 Bs/hora",
  resumen: "Descripción del curso.",
  portada_url: "",
  categoriasNombres: [],
  modalidad: "",
  tieneCupo: false,
  cupoTotal: null,
  cupoOcupado: 0,
  tutor: {
    nombre: "Tutor",
    avatar: "https://ui-avatars.com/api/?name=Tutor&background=0EA5E9&color=0F172A",
  },
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

  if (portada.startsWith("/")) {
    const base = api.defaults.baseURL || ""; // "/api" en dev
    return joinUrl(base, portada); // => "/api/curso/uploads/xxx.jpg"
  }

  return portada;
};

const formatPrecioReserva = (c) => {
  const raw = c?.precio_reserva ?? c?.precioReserva ?? c?.precio ?? c?.precio_hora ?? null;
  if (raw === null || raw === undefined || raw === "") return "Sin precio";

  const n = typeof raw === "string" ? Number(raw) : raw;
  if (typeof n === "number" && Number.isFinite(n)) return `${n} Bs/hora`;

  return "Sin precio";
};

const toIntOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const CourseInfoSection = ({
  curso,
  onReservar,
  tieneReserva,
  disponibilidad = {
    tiene_cupo_limitado: false,
    cupos_disponibles: null,
    tiene_disponibilidad: true,
    usuario_tiene_reserva: false,
  },
  onOpenChat,
}) => {
  const data = curso || cursoMock;
  const {
    titulo,
    tag,
    precio,
    resumen,
    tutor,
    portada_url,
    categoriasNombres = [],
    modalidad,
    tieneCupo,
    cupoTotal,
    cupoOcupado,
  } = data;

  const portadaSrc = resolvePortadaUrl(portada_url);

  const colorClasses = [
    "infocurso-chip-color-1",
    "infocurso-chip-color-2",
    "infocurso-chip-color-3",
    "infocurso-chip-color-4",
  ];

  const tutorName = tutor?.nombre || "Tutor";
  const tutorAvatar =
    tutor?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=0EA5E9&color=0F172A`;

  // ✅ Cupos (si se puede calcular)
  const cupoTotalInt = toIntOrNull(cupoTotal);
  const cupoOcupadoInt = toIntOrNull(cupoOcupado) ?? 0;
  const cuposDisponiblesCalc =
    cupoTotalInt !== null ? Math.max(0, cupoTotalInt - cupoOcupadoInt) : null;

  return (
    <section className="infocurso-layout">
      <div className="infocurso-left">
        <div className="infocurso-media-wrapper">
          {portadaSrc ? (
            <img src={portadaSrc} alt={titulo} className="infocurso-media-img" />
          ) : (
            <div className="infocurso-media-placeholder" />
          )}

          <button
            type="button"
            className="infocurso-media-arrow infocurso-media-arrow-left"
            aria-label="Anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className="infocurso-media-arrow infocurso-media-arrow-right"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>

        <div className="infocurso-tutor-row">
          <div className="infocurso-tutor-info">
            <img src={tutorAvatar} alt={tutorName} className="infocurso-tutor-avatar" />
            <div>
              <p className="infocurso-tutor-name">{tutorName}</p>
            </div>
          </div>

          <button
            type="button"
            className="infocurso-chat-btn"
            aria-label="Abrir chat con el tutor"
            onClick={onOpenChat}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="infocurso-info">
        <h1 className="infocurso-title">{titulo}</h1>

        <div className="infocurso-chips-row">
          {Array.isArray(categoriasNombres) && categoriasNombres.length > 0 ? (
            categoriasNombres.map((cat, index) => (
              <span
                key={`${cat}-${index}`}
                className={"infocurso-chip " + colorClasses[index % colorClasses.length]}
              >
                {cat}
              </span>
            ))
          ) : tag ? (
            <span className="infocurso-chip infocurso-chip-color-1">{tag}</span>
          ) : null}
        </div>

        {modalidad && (
          <div className="infocurso-chips-row">
            <span className="infocurso-chip infocurso-chip-modalidad">{modalidad}</span>
          </div>
        )}

        <div className="infocurso-price-row">
          <span className="infocurso-arrow">→</span>
          <p className="infocurso-price">{precio}</p>
        </div>

        {/* ✅ Cupo total del curso (desde el curso mismo) */}
        {tieneCupo && cupoTotalInt !== null && (
          <div className="infocurso-cupos-info">
            <p className="infocurso-cupos-disponibles">
              Cupo total: {cupoTotalInt} · Ocupados: {cupoOcupadoInt}
              {cuposDisponiblesCalc !== null ? ` · Disponibles: ${cuposDisponiblesCalc}` : ""}
            </p>
          </div>
        )}

        {/* ✅ Disponibilidad (la que ya venía desde /reservas/disponibilidad/:id) */}
        {disponibilidad.tiene_cupo_limitado && (
          <div className="infocurso-cupos-info">
            {disponibilidad.tiene_disponibilidad ? (
              <p className="infocurso-cupos-disponibles">
                Cupos disponibles: {disponibilidad.cupos_disponibles}
              </p>
            ) : (
              <p className="infocurso-cupos-agotados">⚠️ Curso lleno - No hay cupos disponibles</p>
            )}
          </div>
        )}

        <p className="infocurso-summary">{resumen}</p>

        <button
          type="button"
          className="infocurso-reserve-btn"
          onClick={onReservar}
          disabled={!disponibilidad.tiene_disponibilidad && !tieneReserva}
        >
          {tieneReserva
            ? "Ver conversación"
            : disponibilidad.tiene_disponibilidad
            ? "Reservar"
            : "Curso lleno"}
        </button>
      </div>
    </section>
  );
};

const ReviewCard = ({ titulo, cuerpo, usuario, fecha, rating }) => {
  const safeRating = Math.max(1, Math.min(5, Number(rating || 5)));
  const filled = "★".repeat(safeRating);
  const empty = "☆".repeat(5 - safeRating);

  return (
    <article className="review-card">
      <div className="review-stars">
        <span className="review-stars-filled">{filled}</span>
        <span className="review-stars-empty">{empty}</span>
      </div>

      <h3 className="review-title">{titulo}</h3>
      <p className="review-body">{cuerpo}</p>

      <div className="review-footer">
        <img
          src="https://ui-avatars.com/api/?name=User&background=CBD5F5&color=0F172A"
          alt={usuario}
          className="review-avatar"
        />
        <div>
          <p className="review-user-name">{usuario}</p>
          <p className="review-date">{fecha}</p>
        </div>
      </div>
    </article>
  );
};

const ReviewsSection = ({
  comentarios,
  onAddReview,
  puedeResenar,
  yaReseno,
  loadingComentarios,
  promedioClasificacion,
}) => {
  const { showNotification } = useNotification();
  const [cuerpo, setCuerpo] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cuerpo.trim()) {
      showNotification({
        type: "warning",
        title: "Campos incompletos",
        message: "Por favor completa el comentario",
      });
      return;
    }

    if (!puedeResenar || yaReseno) {
      showNotification({
        type: "warning",
        title: "No puedes reseñar",
        message: "Solo puedes dejar una reseña por curso después de tomar la clase",
      });
      return;
    }

    await onAddReview({
      comentario: cuerpo.trim(),
      clasificacion: Number(rating) || 5,
    });

    setCuerpo("");
    setRating(5);
  };

  return (
    <section className="infocurso-reviews-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="infocurso-reviews-title">Reseñas</h2>
        {promedioClasificacion !== null && (
          <div className="text-sm text-slate-600">
            Promedio:{" "}
            <span className="font-semibold text-slate-900">
              {promedioClasificacion.toFixed(1)} ★
            </span>
          </div>
        )}
      </div>

      {loadingComentarios && (
        <p className="text-center text-sm text-slate-500 py-6">Cargando comentarios...</p>
      )}

      {!loadingComentarios && (
        <>
          {comentarios.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">
              Aún no hay reseñas para este curso. ¡Sé el primero en comentar!
            </p>
          ) : (
            <div className="infocurso-reviews-grid">
              {comentarios.map((comentario) => (
                <ReviewCard
                  key={comentario.idComentario || comentario._id}
                  titulo={`Comentario de ${comentario.usuario || "Usuario"}`}
                  cuerpo={comentario.comentario}
                  usuario={comentario.usuario || "Usuario"}
                  fecha={
                    comentario.fechaCreacion
                      ? new Date(comentario.fechaCreacion).toLocaleDateString()
                      : ""
                  }
                  rating={comentario.clasificacion}
                />
              ))}
            </div>
          )}
        </>
      )}

      {puedeResenar && !yaReseno ? (
        <form className="infocurso-review-form" onSubmit={handleSubmit}>
          <h3 className="infocurso-review-form-title">Escribe tu reseña</h3>

          <div className="infocurso-review-form-row">
            <label>
              Comentario
              <textarea
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                className="infocurso-review-textarea"
                rows={4}
                placeholder="Comparte tu experiencia con este curso..."
              />
            </label>
          </div>

          <div className="infocurso-review-form-row">
            <label>
              Calificación
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="infocurso-review-select"
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v} estrellas
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="infocurso-review-submit">
            Publicar reseña
          </button>
        </form>
      ) : (
        <p className="infocurso-review-hint">
          Solo puedes dejar una reseña por curso y únicamente cuando tu reserva haya sido confirmada
          y la fecha de la clase ya haya pasado.
        </p>
      )}
    </section>
  );
};

const InfoCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [curso, setCurso] = useState(null);
  const [loadingCurso, setLoadingCurso] = useState(false);

  const [comentarios, setComentarios] = useState([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);

  const [promedioClasificacion, setPromedioClasificacion] = useState(null);
  const [puedeResenar, setPuedeResenar] = useState(false);
  const [tieneReserva, setTieneReserva] = useState(false);
  const [yaReseno, setYaReseno] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState({
    tiene_cupo_limitado: false,
    cupos_disponibles: null,
    tiene_disponibilidad: true,
    usuario_tiene_reserva: false,
  });

  useEffect(() => {
    const fetchCurso = async () => {
      if (!id) return;

      setLoadingCurso(true);
      try {
        const { data: c } = await cursosAPI.getCurso(id);
        console.log("✅ curso raw:", c);

        const categoriasNombres = Array.isArray(c?.categorias)
          ? c.categorias
              .map((cat) => (typeof cat === "string" ? cat : cat?.nombre))
              .filter(Boolean)
          : [];

        const tieneCupo = c?.tiene_cupo ?? c?.tieneCupo ?? false;
        const cupoTotal = c?.cupo ?? c?.cupo_maximo ?? c?.cupoTotal ?? null;
        const cupoOcupado = c?.cupo_ocupado ?? c?.cupoOcupado ?? 0;

        const mapped = {
          id: c?.id || c?._id,
          titulo: c?.nombre || cursoMock.titulo,
          tag: (Array.isArray(c?.tags) && c.tags[0]) || categoriasNombres[0] || cursoMock.tag,
          precio: formatPrecioReserva(c),
          resumen: c?.descripcion || cursoMock.resumen,
          categoriasNombres,
          modalidad: c?.modalidad || "",
          portada_url: c?.portada_url || "",
          tieneCupo,
          cupoTotal,
          cupoOcupado,
          tutor: {
            nombre: "Tutor",
            avatar: `https://ui-avatars.com/api/?name=Tutor&background=0EA5E9&color=0F172A`,
          },
        };

        setCurso(mapped);
      } catch (error) {
        console.error("Error cargando curso:", {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        });

        showNotification({
          type: "error",
          title: "Error",
          message: "No se pudo cargar el curso.",
        });
      } finally {
        setLoadingCurso(false);
      }
    };

    fetchCurso();
  }, [id, showNotification]);

  useEffect(() => {
    const fetchComentarios = async () => {
      if (!id) return;

      setLoadingComentarios(true);
      try {
        const { data } = await comentariosAPI.getComentariosByCurso(id);
        if (Array.isArray(data)) setComentarios(data);
        else setComentarios([]);
      } catch (error) {
        console.error("Error obteniendo comentarios:", error);
        setComentarios([]);
      } finally {
        setLoadingComentarios(false);
      }
    };

    fetchComentarios();
  }, [id]);

  useEffect(() => {
    const fetchPromedio = async () => {
      if (!id) return;
      try {
        const promedio = await comentariosAPI.getPromedioClasificacion(id);
        if (typeof promedio === "number") setPromedioClasificacion(promedio);
      } catch (error) {
        console.error("Error obteniendo promedio:", error);
      }
    };

    fetchPromedio();
  }, [id, comentarios]);

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      if (!id) return;

      try {
        const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");
        const usuarioId = usuarioActual._id || usuarioActual.id;

        const { data } = await api.get(`/reservas/disponibilidad/${id}`, {
          params: { id_usuario: usuarioId },
        });

        if (data?.success) {
          setDisponibilidad({
            tiene_cupo_limitado: data.tiene_cupo_limitado,
            cupos_disponibles: data.cupos_disponibles,
            tiene_disponibilidad: data.tiene_disponibilidad,
            usuario_tiene_reserva: data.usuario_tiene_reserva,
          });
          setTieneReserva(data.usuario_tiene_reserva);
        }
      } catch (error) {
        console.error("Error verificando disponibilidad:", error);
      }
    };

    fetchDisponibilidad();
  }, [id]);

  useEffect(() => {
    const checkReservaParaResena = async () => {
      if (!id) return;

      try {
        const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");
        const usuarioId = usuarioActual._id || usuarioActual.id;

        const { data } = await reservasAPI.getMisReservasEstudiante();
        if (data?.success && Array.isArray(data.reservas)) {
          const ahora = new Date();

          const tieneReservaCurso = data.reservas.some((r) => {
            if (!r.id_curso) return false;
            return String(r.id_curso._id) === String(id) && r.estado !== "cancelada";
          });

          const tieneReservaValida = data.reservas.some((r) => {
            if (!r.id_curso) return false;
            if (String(r.id_curso._id) !== String(id)) return false;
            if (r.estado !== "confirmada" && r.estado !== "completada") return false;

            const fechaClase = r.fecha
              ? new Date(r.fecha)
              : r.id_horario?.inicio
              ? new Date(r.id_horario.inicio)
              : null;

            return fechaClase && fechaClase <= ahora;
          });

          setTieneReserva(tieneReservaCurso);
          setPuedeResenar(tieneReservaValida);

          const yaComentado = comentarios.some((c) => String(c.id_usuario) === String(usuarioId));
          setYaReseno(yaComentado);
        }
      } catch (error) {
        console.error("Error verificando permisos de reseña:", error);
        setPuedeResenar(false);
        setTieneReserva(false);
      }
    };

    checkReservaParaResena();
  }, [id, comentarios]);

  const handleOpenChat = async () => {
    try {
      const cursoId = curso?.id || id;
      if (!cursoId) return;

      const chatResp = await chatsAPI.createChat({ cursoId });
      if (chatResp?.data?.success && chatResp.data.chat?._id) {
        navigate(`/chats/${chatResp.data.chat._id}`);
      } else {
        showNotification({ type: "error", title: "Error", message: "No se pudo abrir el chat" });
      }
    } catch (error) {
      console.error("Error abriendo chat:", error);
      showNotification({ type: "error", title: "Error", message: "No se pudo abrir el chat" });
    }
  };

  const handleReservar = async () => {
    try {
      const cursoId = curso?.id || id;
      if (!cursoId) return;

      if (!disponibilidad.tiene_disponibilidad && !tieneReserva) {
        showNotification({
          type: "warning",
          title: "Curso lleno",
          message: "Lo sentimos, este curso no tiene cupos disponibles",
        });
        return;
      }

      if (disponibilidad.usuario_tiene_reserva || tieneReserva) {
        await handleOpenChat();
        return;
      }

      const reservaResp = await reservasAPI.createReserva({ cursoId });

      if (!reservaResp?.data?.success) {
        const mensaje = reservaResp?.data?.message || "No se pudo crear la reserva para este curso.";
        showNotification({ type: "error", title: "Error al reservar", message: mensaje });
        return;
      }

      showNotification({ type: "success", title: "¡Reserva creada!", message: "Tu reserva ha sido creada exitosamente" });
      await handleOpenChat();
    } catch (error) {
      console.error("Error creando reserva/chat:", error);
      showNotification({ type: "error", title: "Error", message: "Ocurrió un error al crear la reserva. Intenta nuevamente." });
    }
  };

  const handleAddReview = async (reviewData) => {
    try {
      const cursoId = curso?.id || id;
      if (!cursoId) return;

      const payload = {
        id_curso: cursoId,
        comentario: reviewData.comentario,
        clasificacion: reviewData.clasificacion,
      };

      const { data } = await comentariosAPI.createComentario(payload);

      if (data) {
        setComentarios((prev) => [data, ...prev]);
        showNotification({ type: "success", title: "¡Reseña publicada!", message: "Tu reseña ha sido publicada exitosamente" });

        try {
          await reservasAPI.marcarReservaCompletada({ cursoId });
        } catch (error) {
          console.error("Error marcando reserva como completada:", error);
        }
      }
    } catch (error) {
      console.error("Error creando comentario:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "No se pudo publicar la reseña",
      });
    }
  };

  return (
    <div className="infocurso-page">
      <main className="infocurso-main">
        {loadingCurso && <p className="text-center text-sm text-slate-500 py-6">Cargando curso...</p>}

        {!loadingCurso && (
          <>
            <CourseInfoSection
              curso={curso || cursoMock}
              onReservar={handleReservar}
              tieneReserva={tieneReserva}
              disponibilidad={disponibilidad}
              onOpenChat={handleOpenChat}
            />

            <ReviewsSection
              comentarios={comentarios}
              onAddReview={handleAddReview}
              puedeResenar={puedeResenar}
              yaReseno={yaReseno}
              loadingComentarios={loadingComentarios}
              promedioClasificacion={promedioClasificacion}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default InfoCurso;