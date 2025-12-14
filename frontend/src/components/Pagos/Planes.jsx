// frontend/src/components/Pagos/Planes.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/config";
import { useNotification } from "../NotificationProvider";
import "../../styles/Explorar/explorar.css";

const PAYMENTS_PREFIX = "/ms-payments/v1";

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mongoId, setMongoId] = useState(null);
  const [suscripcionActiva, setSuscripcionActiva] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const esSuccess = useMemo(() => location.pathname.endsWith("/success"), [location.pathname]);
  const esCancel = useMemo(() => location.pathname.endsWith("/cancel"), [location.pathname]);

  // Mensajes post-checkout
  useEffect(() => {
    if (esSuccess) {
      setMensaje("Pago realizado con éxito. Tu suscripción será activada en segundos.");
    } else if (esCancel) {
      setMensaje("El pago fue cancelado. Puedes intentar nuevamente cuando desees.");
    } else {
      setMensaje("");
    }
  }, [esSuccess, esCancel]);

  // Helper: trae /me
  const fetchMe = async () => {
    const meRes = await api.get("/v1/auth/me");
    const me = meRes?.data;
    if (!me?.id) throw new Error("No se pudo obtener el id del usuario (/v1/auth/me).");
    setMongoId(me.id);
    return me.id;
  };

  // Helper: trae planes
  const fetchPlanes = async () => {
    const res = await api.get(`${PAYMENTS_PREFIX}/planes/`);
    return Array.isArray(res.data) ? res.data : [];
  };

  // Helper: trae suscripciones con fallback (filtrado backend -> si no, todas y filtrar front)
  const fetchSubsForUser = async (userId) => {
    // 1) Intento filtrado en backend
    try {
      const r1 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`, {
        params: { id_usuario: userId },
      });
      const list1 = Array.isArray(r1.data) ? r1.data : [];
      if (list1.length > 0) return list1;
    } catch (e) {
      // Ignoramos y hacemos fallback
    }

    // 2) Fallback: traer todas y filtrar en frontend
    const r2 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`);
    const list2 = Array.isArray(r2.data) ? r2.data : [];
    return list2.filter((s) => String(s?.id_usuario) === String(userId));
  };

  // Boot inicial (me + planes + suscripción)
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      setLoading(true);
      setError("");

      try {
        const userId = await fetchMe();

        const plans = await fetchPlanes();
        if (!mounted) return;
        setPlanes(plans);

        const subs = await fetchSubsForUser(userId);
        if (!mounted) return;

        const found =
          subs.find((s) => s.estado === "activa") ||
          subs.find((s) => s.estado === "pendiente") ||
          null;

        setSuscripcionActiva(found);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("No se pudo cargar la información.");
        showNotification({
          type: "error",
          title: "Error cargando planes",
          message: err?.message || "No se pudo cargar la información.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    boot();

    return () => {
      mounted = false;
    };
  }, []);

  // Polling luego de /success (por webhook: pendiente -> activa)
  useEffect(() => {
    if (!esSuccess) return;
    if (!mongoId) return;

    let tries = 0;
    const maxTries = 10; // ~20s si intervalo 2s

    const tick = async () => {
      tries += 1;
      try {
        const subs = await fetchSubsForUser(mongoId);
        const found =
          subs.find((s) => s.estado === "activa") ||
          subs.find((s) => s.estado === "pendiente") ||
          null;

        setSuscripcionActiva(found);

        // si ya está activa, paramos
        if (found?.estado === "activa") {
          clearInterval(timer);
        }
      } catch (e) {
        // si falla, seguimos intentando
      }

      if (tries >= maxTries) clearInterval(timer);
    };

    const timer = setInterval(tick, 2000);
    tick();

    return () => clearInterval(timer);
  }, [esSuccess, mongoId]);

  const handleElegirPlan = async (planId) => {
    try {
      if (!mongoId) {
        showNotification({
          type: "error",
          title: "Sesión no disponible",
          message: "No se pudo obtener tu usuario. Vuelve a iniciar sesión.",
        });
        return;
      }

      if (suscripcionActiva) {
        showNotification({
          type: "warning",
          title: "Ya tienes una suscripción",
          message: `Ya tienes una suscripción en estado "${suscripcionActiva.estado}".`,
        });
        return;
      }

      const inicio = new Date().toISOString().slice(0, 19);

      // Stripe checkout (tu backend toma el usuario desde Bearer token)
      const { data } = await api.post(`${PAYMENTS_PREFIX}/stripe/checkout-session`, {
        id_plan: planId,
        inicio,
      });

      if (data?.url) {
        window.location.href = data.url;
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
        message: error?.response?.data?.detail || "Ocurrió un error al iniciar el pago.",
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

        {!loading && suscripcionActiva && (
          <div className="mb-4 text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
            Ya tienes una suscripción <strong>{suscripcionActiva.estado}</strong>. No puedes suscribirte a otro plan.
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
                        <div className="text-[11px] text-slate-500">Duración: {plan.duracionDias} días</div>
                        <div className="text-[11px] text-slate-500">Cursos permitidos: {plan.cantidadCursos}</div>
                      </div>

                      <button
                        type="button"
                        className={`infocurso-reserve-btn w-auto px-4 py-2 text-sm ${
                          suscripcionActiva ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => handleElegirPlan(plan.id)}
                        disabled={!!suscripcionActiva}
                      >
                        {suscripcionActiva ? "Ya suscrito" : "Suscribirse"}
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
