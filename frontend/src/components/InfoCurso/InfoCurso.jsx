import "../../styles/InfoCurso/infoCurso.css";
import "../../styles/InfoCurso/reviewCard.css";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";


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
        descripcion: "Descripción corta del tutor",
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


const CourseInfoSection = () => {
    const { titulo, tag, precio, resumen, descripcionLarga, tutor } = cursoMock;

    return (
        <section className="infocurso-layout">
            <div className="infocurso-left">
                <div className="infocurso-media-wrapper">
                    <div className="infocurso-media-placeholder" />

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

                {tag && <span className="infocurso-tag">{tag}</span>}

                <div className="infocurso-price-row">
                    <span className="infocurso-arrow">→</span>
                    <p className="infocurso-price">{precio}</p>
                </div>

                <p className="infocurso-summary">{resumen}</p>

                <button type="button" className="infocurso-reserve-btn">
                    Reservar
                </button>

                <div className="infocurso-description-block">
                    <h2 className="infocurso-description-title">
                        Descripción del curso
                    </h2>
                    <p className="infocurso-description-text">{descripcionLarga}</p>
                </div>
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

const ReviewsSection = () => {
    return (
        <section className="infocurso-reviews-section">
            <h2 className="infocurso-reviews-title">Reseñas</h2>

            <div className="infocurso-reviews-grid">
                {reseñasMock.map((r) => (
                    <ReviewCard key={r.id} {...r} />
                ))}
            </div>
        </section>
    );
};

const InfoCurso = () => {
    return (
        <div className="infocurso-page">
            <main className="infocurso-main">
                <CourseInfoSection />
                <ReviewsSection />
            </main>
        </div>
    );
};

export default InfoCurso;
