// frontend/src/components/Pagos/PlanesAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { planesAPI } from "../../api/planes";
import "../../styles/Pagos/planAdmin.css";

function pickApiErrorMessage(err) {
  const data = err?.response?.data;

  if (data?.detail) {
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      const first = data.detail[0];
      const msg = first?.msg || "Error de validación (422).";
      const loc = Array.isArray(first?.loc) ? first.loc.join(" → ") : "";
      return loc ? `${loc}: ${msg}` : msg;
    }
  }

  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;

  return err?.message || "Ocurrió un error inesperado.";
}

const PlanesAdmin = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracionDias: "",
    cantidadCursos: "1",
    estado: "activo",
  });

  const [saving, setSaving] = useState(false);
  const [estadoDraft, setEstadoDraft] = useState({});
  const [savingRow, setSavingRow] = useState({});

  const fetchPlanes = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await planesAPI.getPlanes();
      const list = Array.isArray(data) ? data : [];
      setPlanes(list);

      const init = {};
      for (const p of list) if (p?.id) init[p.id] = p.estado || "activo";
      setEstadoDraft(init);
    } catch (err) {
      console.error("Error obteniendo planes:", err);
      setError(pickApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parsed = useMemo(() => {
    const precioNum = Number(form.precio);
    const duracionNum = Number(form.duracionDias);
    const cantidadCursosNum = Number(form.cantidadCursos);

    return {
      precioNum,
      duracionNum,
      cantidadCursosNum,
      valid:
        form.nombre.trim().length > 0 &&
        form.descripcion.trim().length > 0 &&
        Number.isFinite(precioNum) &&
        precioNum > 0 &&
        Number.isFinite(duracionNum) &&
        duracionNum > 0 &&
        Number.isFinite(cantidadCursosNum) &&
        cantidadCursosNum > 0,
    };
  }, [form]);

  const handleCrearPlan = async (e) => {
    e.preventDefault();

    if (!parsed.valid) {
      window.alert("Completa todos los campos con valores válidos (mayores a 0).");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: parsed.precioNum,
        duracionDias: parsed.duracionNum,
        cantidadCursos: parsed.cantidadCursosNum,
        estado: form.estado || "activo",
      };

      const resp = await planesAPI.crearPlan(payload);
      const created = resp?.data;

      if (created?.id) {
        setForm({
          nombre: "",
          descripcion: "",
          precio: "",
          duracionDias: "",
          cantidadCursos: "1",
          estado: "activo",
        });
        await fetchPlanes();
      } else {
        window.alert("El plan se creó, pero la respuesta no incluyó un 'id'. Revisa el backend.");
        await fetchPlanes();
      }
    } catch (err) {
      console.error("Error creando plan:", err);
      window.alert(pickApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarEstado = async (planId) => {
    const nuevoEstado = estadoDraft[planId];
    if (!nuevoEstado) return;

    try {
      setSavingRow((prev) => ({ ...prev, [planId]: true }));
      await planesAPI.actualizarPlan(planId, { estado: nuevoEstado });

      setPlanes((prev) => prev.map((p) => (p.id === planId ? { ...p, estado: nuevoEstado } : p)));
    } catch (err) {
      console.error("Error actualizando estado:", err);
      window.alert(pickApiErrorMessage(err));
      const original = planes.find((p) => p.id === planId)?.estado || "activo";
      setEstadoDraft((prev) => ({ ...prev, [planId]: original }));
    } finally {
      setSavingRow((prev) => ({ ...prev, [planId]: false }));
    }
  };

  return (
    <div className="plan-admin">
      <h2 className="plan-admin-title">Gestión de planes de suscripción</h2>
      <p className="plan-admin-subtitle">
        Crea planes y habilita/deshabilita su visibilidad cambiando su estado. (Solo se edita el estado).
      </p>

      <section className="mb-8 plan-admin-card">
        <div className="p-4">
          <h3 className="plan-admin-section-title">Crear nuevo plan</h3>

          <form onSubmit={handleCrearPlan} className="plan-admin-form">
            <div className="md:col-span-1">
              <label className="plan-admin-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="plan-admin-input"
                placeholder="Ej: Plan Pro"
              />
            </div>

            <div className="md:col-span-2">
              <label className="plan-admin-label">Descripción</label>
              <input
                type="text"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="plan-admin-input"
                placeholder="Ej: Para tutores profesionales"
              />
            </div>

            <div className="md:col-span-1">
              <label className="plan-admin-label">Precio (USD)</label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                className="plan-admin-input"
                placeholder="Ej: 29.99"
                step="0.01"
                min="0"
              />
            </div>

            <div className="md:col-span-1">
              <label className="plan-admin-label">Duración (días)</label>
              <input
                type="number"
                name="duracionDias"
                value={form.duracionDias}
                onChange={handleChange}
                className="plan-admin-input"
                placeholder="Ej: 30"
                min="1"
              />
            </div>

            <div className="md:col-span-1">
              <label className="plan-admin-label">Cursos</label>
              <input
                type="number"
                name="cantidadCursos"
                min="1"
                value={form.cantidadCursos}
                onChange={handleChange}
                className="plan-admin-input"
                placeholder="Ej: 3"
              />
            </div>

            <div className="md:col-span-1">
              <label className="plan-admin-label">Estado</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="plan-admin-select w-full"
              >
                <option value="activo">activo</option>
                <option value="inactivo">inactivo</option>
              </select>
            </div>

            <div className="md:col-span-6 flex md:justify-end">
              <button type="submit" disabled={saving} className="plan-admin-btn w-full md:w-auto">
                {saving ? "Guardando..." : "Crear plan"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="plan-admin-card">
        <div className="p-4">
          <h3 className="plan-admin-section-title">Planes actuales</h3>

          {loading && <p className="text-sm text-slate-600">Cargando planes...</p>}
          {!loading && error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="plan-admin-table-wrap">
              {planes.length > 0 ? (
                <table className="plan-admin-table">
                  <thead className="plan-admin-thead">
                    <tr>
                      <th className="plan-admin-th">Nombre</th>
                      <th className="plan-admin-th">Descripción</th>
                      <th className="plan-admin-th">Precio</th>
                      <th className="plan-admin-th">Duración</th>
                      <th className="plan-admin-th">Cursos</th>
                      <th className="plan-admin-th">Estado</th>
                      <th className="plan-admin-th">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {planes.map((plan) => {
                      const precio =
                        typeof plan?.precio === "number"
                          ? plan.precio.toFixed(2)
                          : String(plan?.precio ?? "");

                      const currentDraft = estadoDraft[plan.id] ?? plan.estado ?? "activo";
                      const changed = String(currentDraft) !== String(plan.estado);

                      return (
                        <tr key={plan.id} className="plan-admin-row">
                          <td className="plan-admin-td text-slate-900">{plan.nombre}</td>
                          <td className="plan-admin-td text-slate-600 text-xs">{plan.descripcion}</td>
                          <td className="plan-admin-td text-slate-700">{precio}</td>
                          <td className="plan-admin-td text-slate-700">{plan.duracionDias}</td>
                          <td className="plan-admin-td text-slate-700">{plan.cantidadCursos}</td>

                          <td className="plan-admin-td">
                            <div className="flex items-center gap-2">
                              <select
                                value={currentDraft}
                                onChange={(e) =>
                                  setEstadoDraft((prev) => ({ ...prev, [plan.id]: e.target.value }))
                                }
                                className="plan-admin-select"
                              >
                                <option value="activo">activo</option>
                                <option value="inactivo">inactivo</option>
                              </select>

                              <span
                                className={
                                  "plan-admin-pill " +
                                  (plan.estado === "activo"
                                    ? "plan-admin-pill-activo"
                                    : "plan-admin-pill-inactivo")
                                }
                                title="Estado actual"
                              >
                                {plan.estado}
                              </span>
                            </div>
                          </td>

                          <td className="plan-admin-td">
                            <button
                              type="button"
                              className="plan-admin-btn px-3 py-2 text-sm"
                              disabled={!changed || !!savingRow[plan.id]}
                              onClick={() => handleGuardarEstado(plan.id)}
                              title={!changed ? "No hay cambios" : "Guardar estado"}
                            >
                              {savingRow[plan.id] ? "Guardando..." : "Guardar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-600">
                  No hay planes configurados todavía. Crea uno usando el formulario de arriba.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PlanesAdmin;
