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
      setMensaje("Pago realizado con éxito. Tu suscripción ha sido activada.");
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
        if (data?.success && Array.isArray(data.planes)) {
          setPlanes(data.planes);
        } else {
          setError("No se pudieron cargar los planes.");
        }
      } catch (err) {
        console.error("Error obteniendo planes:", err);
        setError("Error al obtener los planes. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSuscripcion = async () => {
      try {
        const { data } = await planesAPI.getMiSuscripcion();
        if (data?.success && data.suscripcion) {
          setSuscripcionActiva(data.suscripcion);
        }
      } catch (err) {
        // No hay suscripción activa, no es un error
        setSuscripcionActiva(null);
      }
    };

    fetchPlanes();
    fetchSuscripcion();
  }, []);

  const handleElegirPlan = async (planId) => {
    if (suscripcionActiva) {
      showNotification({
        type: 'warning',
        title: 'Ya tienes una suscripción activa',
        message: `Ya estás suscrito al plan "${suscripcionActiva.id_plan.nombre}". Para cambiar de plan, contacta al soporte.`
      });
      return;
    }

    try {
      const { data } = await planesAPI.crearSesionPago(planId);
      if (data?.success && data.url) {
        window.location.href = data.url;
      } else {
        showNotification({
          type: 'error',
          title: 'Error al iniciar pago',
          message: 'No se pudo iniciar el pago. Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error("Error creando sesión de pago:", error);
      showNotification({
        type: 'error',
        title: 'Error al iniciar pago',
        message: 'Ocurrió un error al iniciar el pago.'
      });
    }
  };

  const volverAPlanes = () => {
    navigate("/planes", { replace: true });
  };

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
        {!loading && error && (
          <p className="explorar-empty text-red-500">{error}</p>
        )}

        {!loading && !error && suscripcionActiva && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="font-medium">Plan activo:</strong> {suscripcionActiva.id_plan.nombre}
                <span className="ml-2 text-xs text-emerald-600">
                  (Válido hasta: {new Date(suscripcionActiva.fin).toLocaleDateString()})
                </span>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <section className="explorar-grid">
            {planes.length > 0 ? (
              planes.map((plan) => (
                <article key={plan._id} className="curso-card hover:shadow-md transition-shadow">
                  <div className="curso-content">
                    <div>
                      <div className="curso-title-row">
                        <h3 className="curso-title">{plan.nombre}</h3>
                      </div>
                      <p className="curso-description mt-2">
                        Accede a más creación de cursos y beneficios para tus estudiantes.
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-slate-700">
                        <div className="text-lg font-semibold text-slate-900">
                          {plan.precio.toFixed(2)} USD
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
                        className={`infocurso-reserve-btn w-auto px-4 py-2 text-sm ${
                          suscripcionActiva ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleElegirPlan(plan._id)}
                        disabled={suscripcionActiva}
                      >
                        {suscripcionActiva ? 'Ya suscrito' : 'Elegir plan'}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="explorar-empty">
                No hay planes disponibles por el momento.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Planes;
