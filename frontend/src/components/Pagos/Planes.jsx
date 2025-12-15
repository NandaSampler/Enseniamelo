// frontend/src/components/Pagos/Planes.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/config";
import { useNotification } from "../NotificationProvider";
import "../../styles/Pagos/planes.css";

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

  const isBloqueante = (sub) => {
    if (!sub) return false;

    const ahora = new Date();

    if (sub.estado === "activa" || sub.estado === "pendiente") {
      return true;
    }

    if (sub.estado === "cancelada") {
      if (!sub.fin) return true;
      return new Date(sub.fin) > ahora;
    }

    return false;
  };


  useEffect(() => {
    if (esSuccess) setMensaje("Pago realizado con éxito. Tu suscripción será activada en segundos.");
    else if (esCancel) setMensaje("El pago fue cancelado. Puedes intentar nuevamente cuando desees.");
    else setMensaje("");
  }, [esSuccess, esCancel]);

  const fetchMe = async () => {
    const meRes = await api.get("/v1/auth/me");
    const me = meRes?.data;
    if (!me?.id) throw new Error("No se pudo obtener el id del usuario (/v1/auth/me).");
    setMongoId(me.id);
    return me.id;
  };

  const fetchPlanes = async () => {
    const res = await api.get(`${PAYMENTS_PREFIX}/planes/`);
    const list = Array.isArray(res.data) ? res.data : [];
    return list.filter((p) => (p?.estado || "activo") === "activo");
  };

  const fetchSubsForUser = async (userId) => {
    try {
      const r1 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`, {
        params: { id_usuario: userId },
      });
      const list1 = Array.isArray(r1.data) ? r1.data : [];
      if (list1.length > 0) return list1;
    } catch { }

    const r2 = await api.get(`${PAYMENTS_PREFIX}/suscripciones/`);
    const list2 = Array.isArray(r2.data) ? r2.data : [];
    return list2.filter((s) => String(s?.id_usuario) === String(userId));
  };

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

        const prioridad = ["activa", "pendiente", "cancelada", "expirada"];

        const ordered = prioridad
          .map((estado) => subs.find((s) => s.estado === estado))
          .filter(Boolean);

        const selected = ordered[0] || null;

        setSuscripcionActiva(selected);

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

  useEffect(() => {
    if (!esSuccess) return;
    if (!mongoId) return;

    let tries = 0;
    const maxTries = 10;

    const tick = async () => {
      tries += 1;
      try {
        const subs = await fetchSubsForUser(mongoId);
        const found =
          subs.find((s) => s.estado === "activa") ||
          subs.find((s) => s.estado === "pendiente") ||
          null;

        setSuscripcionActiva(found);
        if (found?.estado === "activa") clearInterval(timer);
      } catch { }

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

      if (isBloqueante(suscripcionActiva)) {
        showNotification({
          type: "warning",
          title: "Suscripción activa",
          message:
            suscripcionActiva.estado === "cancelada"
              ? "Tu suscripción fue cancelada, pero aún no finaliza su período."
              : `Ya tienes una suscripción en estado "${suscripcionActiva.estado}".`,
        });
        return;
      }

      const inicio = new Date().toISOString().slice(0, 19);

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
    <div className="planes-page">
      <main className="planes-main">
        <h2 className="planes-title">Planes para tutores</h2>
        <p className="planes-subtitle">
          Elige el plan que mejor se adapte a tu actividad. El pago se realiza con Stripe y se activa en segundos.
        </p>

        {mensaje && (
          <div className={"planes-alert " + (esSuccess ? "planes-alert-success" : "planes-alert-warning")}>
            <span>{mensaje}</span>

            {location.pathname !== "/planes" && (
              <button type="button" className="planes-alert-action" onClick={volverAPlanes}>
                Ver planes
              </button>
            )}
          </div>
        )}

        {!loading && isBloqueante(suscripcionActiva) && (
          <div className="planes-alert planes-alert-warning">
            {suscripcionActiva.estado === "cancelada"
              ? `Tu suscripción fue cancelada, pero sigue activa hasta el ${new Date(
                suscripcionActiva.fin
              ).toLocaleDateString()}.`
              : `Ya tienes una suscripción ${suscripcionActiva.estado}.`}
          </div>

        )}

        {loading && <p className="planes-empty">Cargando planes...</p>}
        {!loading && error && <p className="planes-empty text-red-500">{error}</p>}

        {!loading && !error && (
          <section className="planes-grid">
            {planes.length > 0 ? (
              planes.map((plan) => (
                <article key={plan.id} className="planes-card">
                  <div className="planes-card-inner">
                    <div className="planes-card-header">
                      <h3 className="planes-card-title">{plan.nombre}</h3>
                      <span className="planes-badge planes-badge-pro">Tutor</span>
                    </div>

                    <p className="planes-desc">{plan.descripcion}</p>

                    <div className="planes-footer">
                      <div>
                        <div className="planes-price">{Number(plan.precio).toFixed(2)} USD</div>
                        <div className="planes-meta">Duración: {plan.duracionDias} días</div>
                        <div className="planes-meta">Cursos permitidos: {plan.cantidadCursos}</div>
                      </div>

                      <button
                        type="button"
                        className="planes-btn"
                        onClick={() => handleElegirPlan(plan.id)}
                        disabled={isBloqueante(suscripcionActiva)}
                      >
                        {isBloqueante(suscripcionActiva) ? "No disponible" : "Suscribirse"}

                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="planes-empty">No hay planes disponibles por el momento.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Planes;
