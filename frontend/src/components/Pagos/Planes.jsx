// frontend/src/components/Pagos/Planes.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { planesAPI } from "../../api/planes";
import { useNotification } from "../NotificationProvider";
import "../../styles/Explorar/explorar.css";

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [suscripcionActiva, setSuscripcionActiva] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (location.pathname.endsWith("/success")) {
      setMensaje("Pago realizado con éxito. Tu suscripción será activada en segundos.");
    } else if (location.pathname.endsWith("/cancel")) {
      setMensaje("El pago fue cancelado. Puedes intentar nuevamente cuando desees.");
    } else {
      setMensaje("");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchPlanes = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await planesAPI.getPlanes();
        // tu FastAPI devuelve lista directa
        if (Array.isArray(data)) setPlanes(data);
        else setError("No se pudieron cargar los planes.");
      } catch (err) {
        console.error("Error obteniendo planes:", err);
        setError("Error al obtener los planes. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, []);

  const handleElegirPlan = async (planId) => {
    try {
      // inicio: ahora (ISO sin ms, como vienes usando)
      const inicio = new Date().toISOString().slice(0, 19);

      const { data } = await planesAPI.crearCheckoutStripe({
        id_plan: planId,
        inicio,
      });

      if (data?.url) {
        window.location.href = data.url; // ✅ Stripe Checkout
        return;
      }

      showNotification({
        type: "error",
        title: "Error al iniciar pago",
        message: "No se pudo iniciar el pago. Intenta nuevamente.",
      });
    } catch (error) {
      console.error("Error creando checkout:", error);
      showNotification({
        type: "error",
        title: "Error al iniciar pago",
        message: "Ocurrió un error al iniciar el pago.",
      });
    }
  };

  const volverAPlanes = () => navigate("/planes", { replace: true });

  return (
    <div className="explorar-page">
      <main className="explorar-main">
        <h2 className="explorar-title">Planes para tutores</h2>

        {mensaje && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex items-center justify-between">
            <span>{mensaje}</span>
            {location.pathname !== "/planes" && (
              <button
                type="button"
                className="text-xs font-medium text-emerald-800 hover:underline ml-4"
                onClick={volverAPlanes}
              >
                Ver planes
              </button>
            )}
          </div>
        )}

        {loading && <p className="explorar-empty">Cargando planes...</p>}
        {!loading && error && <p className="explorar-empty text-red-500">{error}</p>}

        {!loading && !error && (
          <section className="explorar-grid">
            {planes.length > 0 ? (
              planes.map((plan) => (
                <article key={plan.id} className="curso-card hover:shadow-md transition-shadow">
                  <div className="curso-content">
                    <div>
                      <div className="curso-title-row">
                        <h3 className="curso-title">{plan.nombre}</h3>
                      </div>
                      <p className="curso-description mt-2">{plan.descripcion}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-slate-700">
                        <div className="text-lg font-semibold text-slate-900">
                          {Number(plan.precio).toFixed(2)} USD
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Duración: {plan.duracionDias} días
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Cursos permitidos: {plan.cantidadCursos}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="infocurso-reserve-btn w-auto px-4 py-2 text-sm"
                        onClick={() => handleElegirPlan(plan.id)}
                      >
                        Suscribirse
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="explorar-empty">No hay planes disponibles por el momento.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Planes;
