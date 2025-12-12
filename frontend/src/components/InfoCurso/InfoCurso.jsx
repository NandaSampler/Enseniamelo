import "../../styles/InfoCurso/infoCurso.css";
import "../../styles/InfoCurso/reviewCard.css";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/config";
import { cursosAPI } from "../../api/cursos";
import { chatsAPI } from "../../api/chats";
import { reservasAPI } from "../../api/reservas";
import { useNotification } from "../NotificationProvider";

// 🔹 Mock de datos del curso
const cursoMock = {
    titulo: "Título del curso",
    tag: "Programación",
    precio: "25 Bs/hora",
    resumen:
        "Texto cualquiera para poder poner información del curso en una línea corta.",
    descripcionLarga:
        "Aquí irá una descripción más extensa del curso. Puedes explicar qué aprenderá el estudiante, qué temas se cubren y cómo se organiza el contenido.",
    tutor: {
        nombre: "Nombre del tutor",
        descripcion: "Soy un tutor nuevo",
        avatar:
            "https://ui-avatars.com/api/?name=Tutor&background=0EA5E9&color=0F172A",
    },
};

// 🔹 Mock de reseñas
const reseñasMock = [
    {
        id: 1,
        titulo: "Título reseña",
        cuerpo:
            "Cuerpo de la reseña. Aquí va la opinión del estudiante sobre el curso.",
        usuario: "Nombre usuario reseña",
        fecha: "Mar 20, 2025",
        rating: 4,
    },
    {
        id: 2,
        titulo: "Excelente tutor",
        cuerpo:
            "Explica con claridad y responde rápido a las dudas. Muy recomendable.",
        usuario: "Ana López",
        fecha: "Mar 18, 2025",
        rating: 5,
    },
    {
        id: 3,
        titulo: "Buen contenido",
        cuerpo:
            "El curso cubre justo lo que necesitaba para empezar en este tema.",
        usuario: "Carlos Pérez",
        fecha: "Mar 10, 2025",
        rating: 4,
    },
];


const resolvePortadaUrl = (portada) => {
    if (!portada) return "";

    if (portada.startsWith("data:")) return portada;
    if (portada.startsWith("http://") || portada.startsWith("https://")) return portada;

    if (portada.startsWith("/")) {
        const baseApi = api.defaults.baseURL || ""; // ej: http://localhost:3000/api
        const root = baseApi.replace(/\/+api\/?$/, ""); // -> http://localhost:3000
        return root + portada;
    }

    return portada;
};

const CourseInfoSection = ({ 
    curso, 
    onReservar, 
    tieneReserva, 
    disponibilidad = {
        tiene_cupo_limitado: false,
        cupos_disponibles: null,
        tiene_disponibilidad: true,
        usuario_tiene_reserva: false
    }
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
    } = data;
    const portadaSrc = resolvePortadaUrl(portada_url);

    const colorClasses = [
        "infocurso-chip-color-1",
        "infocurso-chip-color-2",
        "infocurso-chip-color-3",
        "infocurso-chip-color-4",
    ];

    return (
        <section className="infocurso-layout">
            <div className="infocurso-left">
                <div className="infocurso-media-wrapper">
                    {portadaSrc ? (
                        <img
                            src={portadaSrc}
                            alt={titulo}
                            className="infocurso-media-img"
                        />
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
                        <img
                            src={tutor.avatar}
                            alt={tutor.nombre}
                            className="infocurso-tutor-avatar"
                        />
                        <div>
                            <p className="infocurso-tutor-name">{tutor.nombre}</p>
                            <p className="infocurso-tutor-desc">{tutor.descripcion}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="infocurso-chat-btn"
                        aria-label="Abrir chat con el tutor"
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    </button>

                </div>
            </div>

            <div className="infocurso-info">
                <h1 className="infocurso-title">{titulo}</h1>

                {/* Fila de categorías */}
                <div className="infocurso-chips-row">
                    {Array.isArray(categoriasNombres) && categoriasNombres.length > 0
                        ? categoriasNombres.map((cat, index) => (
                              <span
                                  key={cat}
                                  className={
                                      "infocurso-chip " +
                                      colorClasses[index % colorClasses.length]
                                  }
                              >
                                  {cat}
                              </span>
                          ))
                        : tag && (
                              <span className="infocurso-chip infocurso-chip-color-1">
                                  {tag}
                              </span>
                          )}
                </div>

                {/* Fila de modalidad */}
                {modalidad && (
                    <div className="infocurso-chips-row">
                        <span className="infocurso-chip infocurso-chip-modalidad">
                            {modalidad}
                        </span>
                    </div>
                )}

                <div className="infocurso-price-row">
                    <span className="infocurso-arrow">→</span>
                    <p className="infocurso-price">{precio}</p>
                </div>

                {disponibilidad.tiene_cupo_limitado && (
                    <div className="infocurso-cupos-info">
                        {disponibilidad.tiene_disponibilidad ? (
                            <p className="infocurso-cupos-disponibles">
                                Cupos disponibles: {disponibilidad.cupos_disponibles}
                            </p>
                        ) : (
                            <p className="infocurso-cupos-agotados">
                                ⚠️ Curso lleno - No hay cupos disponibles
                            </p>
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
                {/* La descripción detallada ya se muestra en el resumen para evitar duplicados */}
            </div>
        </section>
    );
};

const ReviewCard = ({ titulo, cuerpo, usuario, fecha, rating }) => {
    const filled = "★".repeat(rating);
    const empty = "☆".repeat(5 - rating);

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

const ReviewsSection = ({ userReviews, onAddReview, puedeResenar, yaReseno }) => {
    const { showNotification } = useNotification();
    const [titulo, setTitulo] = useState("");
    const [cuerpo, setCuerpo] = useState("");
    const [rating, setRating] = useState(5);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!titulo.trim() || !cuerpo.trim()) {
            showNotification({
                type: 'warning',
                title: 'Campos incompletos',
                message: 'Por favor completa el título y el comentario'
            });
            return;
        }
        if (!puedeResenar || yaReseno) {
            showNotification({
                type: 'warning',
                title: 'No puedes reseñar',
                message: 'Solo puedes dejar una reseña por curso después de tomar la clase'
            });
            return;
        }

        const nueva = {
            id: Date.now(),
            titulo: titulo.trim(),
            cuerpo: cuerpo.trim(),
            usuario: "Tú",
            fecha: new Date().toLocaleDateString(),
            rating: Number(rating) || 5,
        };

        onAddReview(nueva);
        showNotification({
            type: 'success',
            title: '¡Reseña publicada!',
            message: 'Tu reseña ha sido publicada exitosamente'
        });
        setTitulo("");
        setCuerpo("");
        setRating(5);
    };

    return (
        <section className="infocurso-reviews-section">
            <h2 className="infocurso-reviews-title">Reseñas</h2>

            <div className="infocurso-reviews-grid">
                {reseñasMock.map((r) => (
                    <ReviewCard key={r.id} {...r} />
                ))}
                {userReviews.map((r) => (
                    <ReviewCard key={r.id} {...r} />
                ))}
            </div>

            {puedeResenar && !yaReseno ? (
                <form className="infocurso-review-form" onSubmit={handleSubmit}>
                    <h3 className="infocurso-review-form-title">Escribe tu reseña</h3>
                    <div className="infocurso-review-form-row">
                        <label>
                            Título
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className="infocurso-review-input"
                            />
                        </label>
                    </div>
                    <div className="infocurso-review-form-row">
                        <label>
                            Comentario
                            <textarea
                                value={cuerpo}
                                onChange={(e) => setCuerpo(e.target.value)}
                                className="infocurso-review-textarea"
                                rows={4}
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
                                    <option key={v} value={v}>{v} estrellas</option>
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
                    Solo puedes dejar una reseña por curso y únicamente cuando tu
                    reserva haya sido confirmada y la fecha de la clase ya haya pasado.
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
    const [userReviews, setUserReviews] = useState([]);
    const [puedeResenar, setPuedeResenar] = useState(false);
    const [tieneReserva, setTieneReserva] = useState(false);

    const [disponibilidad, setDisponibilidad] = useState({
        tiene_cupo_limitado: false,
        cupos_disponibles: null,
        tiene_disponibilidad: true,
        usuario_tiene_reserva: false
    });

    useEffect(() => {
        const fetchCurso = async () => {
            if (!id) return;
            try {
                const { data } = await api.get(`/cursos/${id}`);

                if (data?.success && data.curso) {
                    const c = data.curso;

                    const categoriasNombres = Array.isArray(c.categorias)
                        ? c.categorias
                              .map((cat) => (typeof cat === "string" ? cat : cat.nombre))
                              .filter(Boolean)
                        : [];

                    const mapped = {
                        // Campos que ya usa el layout
                        id: c._id,
                        titulo: c.nombre || cursoMock.titulo,
                        tag:
                            (Array.isArray(c.tags) && c.tags[0]) ||
                            categoriasNombres[0] ||
                            cursoMock.tag,
                        precio:
                            typeof c.precio_reserva === "number"
                                ? `${c.precio_reserva} Bs/hora`
                                : cursoMock.precio,
                        resumen: c.descripcion || cursoMock.resumen,
                        categoriasNombres,
                        modalidad: c.modalidad,
                        portada_url: c.portada_url || "",
                        tutor: {
                            nombre:
                                c.id_tutor?.id_usuario?.nombre && c.id_tutor?.id_usuario?.apellido
                                    ? `${c.id_tutor.id_usuario.nombre} ${c.id_tutor.id_usuario.apellido}`
                                    : cursoMock.tutor.nombre,
                            descripcion: cursoMock.tutor.descripcion,
                            avatar:
                                c.id_tutor?.id_usuario?.foto || cursoMock.tutor.avatar,
                        },
                    };

                    setCurso(mapped);
                }
            } catch {
               console.error("Error cargando curso:", error);
            }
        };

        fetchCurso();
    }, [id]);
    useEffect(() => {
    const fetchDisponibilidad = async () => {
        if (!id) return;
        
        try {
        const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");
        const usuarioId = usuarioActual._id || usuarioActual.id;
        
        const { data } = await api.get(`/reservas/disponibilidad/${id}`, {
            params: { id_usuario: usuarioId }
        });
        
        if (data?.success) {
            setDisponibilidad({
            tiene_cupo_limitado: data.tiene_cupo_limitado,
            cupos_disponibles: data.cupos_disponibles,
            tiene_disponibilidad: data.tiene_disponibilidad,
            usuario_tiene_reserva: data.usuario_tiene_reserva
            });
            setTieneReserva(data.usuario_tiene_reserva);
        }
        } catch (error) {
            console.error("Error verificando disponibilidad:", error);
        }
    };
    
    fetchDisponibilidad();
    }, [id]);


    const handleReservar = async () => {
        try {
            const cursoId = curso?.id || id;
            if (!cursoId) return;

            // ⭐ Verificar disponibilidad antes de reservar
            if (!disponibilidad.tiene_disponibilidad && !tieneReserva) {
                showNotification({
                    type: 'warning',
                    title: 'Curso lleno',
                    message: 'Lo sentimos, este curso no tiene cupos disponibles'
                });
                return;
            }

            if (disponibilidad.usuario_tiene_reserva) {
                showNotification({
                    type: 'info',
                    title: 'Reserva existente',
                    message: 'Ya tienes una reserva activa para este curso'
                });
                const chatResp = await chatsAPI.createChat({ cursoId });
                if (chatResp?.data?.success && chatResp.data.chat?._id) {
                    navigate(`/chats/${chatResp.data.chat._id}`);
                }
                return;
            }

            // Si ya existe alguna reserva para este curso, solo abrimos/creamos chat
            if (tieneReserva) {
                const chatResp = await chatsAPI.createChat({ cursoId });
                if (chatResp?.data?.success && chatResp.data.chat?._id) {
                    navigate(`/chats/${chatResp.data.chat._id}`);
                } else {
                    showNotification({
                        type: 'error',
                        title: 'Error',
                        message: 'No se pudo abrir la conversación para este curso'
                    });
                }
                return;
            }

            // Caso normal: crear reserva pendiente y luego chat
            const reservaResp = await reservasAPI.createReserva({ cursoId });
            
            if (!reservaResp?.data?.success) {
                const mensaje = reservaResp?.data?.message || "No se pudo crear la reserva para este curso.";
                showNotification({
                    type: 'error',
                    title: 'Error al reservar',
                    message: mensaje
                });
                
                if (mensaje.includes("cupos")) {
                    const { data } = await api.get(`/reservas/disponibilidad/${id}`, {
                        params: { id_usuario: JSON.parse(localStorage.getItem("user") || "{}").id }
                    });
                    if (data?.success) {
                        setDisponibilidad(data);
                    }
                }
                return;
            }

             showNotification({
                type: 'success',
                title: '¡Reserva creada!',
                message: 'Tu reserva ha sido creada exitosamente'
            });

            const chatResp = await chatsAPI.createChat({ cursoId });
            if (chatResp?.data?.success && chatResp.data.chat?._id) {
                navigate(`/chats/${chatResp.data.chat._id}`);
            } else {
                showNotification({
                    type: 'warning',
                    title: 'Reserva creada',
                    message: 'La reserva se creó pero no se pudo abrir el chat'
                });
            }
        } catch (error) {
            console.error("Error creando reserva/chat:", error);
            showNotification({
                type: 'error',
                title: 'Error',
                message: 'Ocurrió un error al crear la reserva. Intenta nuevamente.'
            });
        }
    };

    // Cargar reseñas guardadas en localStorage para este curso
    useEffect(() => {
        if (!id) return;
        try {
            const raw = localStorage.getItem(`cursoReviews:${id}`);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setUserReviews(parsed);
                }
            }
        } catch {
            // ignorar errores de parseo
        }
    }, [id]);

    // Verificar si el usuario puede dejar reseña: debe tener una reserva
    // confirmada o completada para este curso, y la fecha de la clase debe
    // haber pasado.
    useEffect(() => {
        const checkReservaParaResena = async () => {
            if (!id) return;
            try {
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

                        if (r.estado !== "confirmada" && r.estado !== "completada") {
                            return false;
                        }

                        const fechaClase = r.fecha
                            ? new Date(r.fecha)
                            : r.id_horario?.inicio
                            ? new Date(r.id_horario.inicio)
                            : null;

                        return fechaClase && fechaClase <= ahora;
                    });
                    setTieneReserva(tieneReservaCurso);
                    setPuedeResenar(tieneReservaValida);
                } else {
                    setPuedeResenar(false);
                    setTieneReserva(false);
                }
            } catch {
                setPuedeResenar(false);
                setTieneReserva(false);
            }
        };

        checkReservaParaResena();
    }, [id]);

    const handleAddReview = async (review) => {
        setUserReviews((prev) => {
            const updated = [review, ...prev];
            if (id) {
                try {
                    localStorage.setItem(`cursoReviews:${id}`, JSON.stringify(updated));
                } catch {
                    // ignorar errores de almacenamiento
                }
            }
            return updated;
        });

        // Marcar la reserva como completada para este curso (si existe)
        try {
            const cursoId = curso?.id || id;
            if (cursoId) {
                await reservasAPI.marcarReservaCompletada({ cursoId });
            }
        } catch (error) {
            console.error("Error marcando reserva como completada tras reseña:", error);
        }
    };

    return (
        <div className="infocurso-page">
            <main className="infocurso-main">
                <CourseInfoSection
                    curso={curso}
                    onReservar={handleReservar}
                    tieneReserva={tieneReserva}
                    disponibilidad={disponibilidad}
                />
                <ReviewsSection
                    userReviews={userReviews}
                    onAddReview={handleAddReview}
                    puedeResenar={puedeResenar}
                    yaReseno={userReviews.length > 0}
                />
            </main>
        </div>
    );
};

export default InfoCurso;
