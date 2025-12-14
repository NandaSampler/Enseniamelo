// frontend/src/components/Pagos/Planes.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { planesAPI } from "../../api/planes";
import api from "../../api/config";
import { useNotification } from "../NotificationProvider";
import "../../styles/Explorar/explorar.css";

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suscripcionActiva, setSuscripcionActiva] = useState(null);
  const [mongoId, setMongoId] = useState(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      try {
        // 1) Usuario actual (usuarios-service via gateway)
        const meRes = await api.get("/v1/auth/me");
        const me = meRes.data;
        if (!me?.id) throw new Error("No se pudo obtener el id del usuario.");
        setMongoId(me.id);

        // 2) Planes (payments-service via gateway)
        const plansRes = await planesAPI.getPlanes();
        setPlanes(Array.isArray(plansRes.data) ? plansRes.data : []);

        // 3) Suscripciones del usuario (payments-service via gateway)
        const subsRes = await planesAPI.getSuscripciones(me.id);
        const subs = Array.isArray(subsRes.data) ? subsRes.data : [];

        // Preferimos activa, si no, pendiente
        const found =
          subs.find((s) => s.estado === "activa") ||
          subs.find((s) => s.estado === "pendiente") ||
          null;

        setSuscripcionActiva(found);
      } catch (err) {
        console.error(err);
        showNotification({
          type: "error",
          title: "Error cargando planes",
          message: err?.message || "No se pudo cargar la información.",
        });
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  const handleElegirPlan = async (id_plan) => {
    if (!mongoId) return;

    if (suscripcionActiva) {
      showNotification({
        type: "warning",
        title: "Ya tienes una suscripción",
        message: `Ya tienes una suscripción en estado "${suscripcionActiva.estado}".`,
      });
      return;
    }

    try {
      // El backend espera "YYYY-MM-DDTHH:MM:SS"
      const inicio = new Date().toISOString().slice(0, 19);

      const payload = { id_usuario: mongoId, id_plan, inicio };
      const { data } = await planesAPI.crearSuscripcion(payload);

      showNotification({
        type: "success",
        title: "Suscripción creada",
        message: `Se creó tu suscripción (estado: "${data.estado}").`,
      });

      setSuscripcionActiva(data);

      // Si quieres redirigir al perfil tutor al crear suscripción:
      // navigate("/tutor/perfil");
    } catch (err) {
      console.error("Error creando suscripción:", err);
      showNotification({
        type: "error",
        title: "No se pudo crear la suscripción",
        message: err?.response?.data?.error?.message || err.message || "Error desconocido",
      });
    }
  };

  return (
    <div className="explorar-page">
      <main className="explorar-main">
        <h2 className="explorar-title">Planes para tutores</h2>

        {loading && <p className="explorar-empty">Cargando...</p>}

        {!loading && suscripcionActiva && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <strong className="font-medium">Suscripción:</strong>{" "}
            Estado: {suscripcionActiva.estado} — válida hasta{" "}
            {new Date(suscripcionActiva.fin).toLocaleDateString()}
          </div>
        )}

        {!loading && (
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
                        className={`infocurso-reserve-btn w-auto px-4 py-2 text-sm ${
                          suscripcionActiva ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => handleElegirPlan(plan.id)}
                        disabled={!!suscripcionActiva}
                      >
                        {suscripcionActiva ? "Ya suscrito" : "Elegir plan"}
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
