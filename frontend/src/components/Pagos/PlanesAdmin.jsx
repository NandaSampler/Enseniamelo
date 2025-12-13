import { useEffect, useState } from "react";
import { planesAPI } from "../../api/planes";
import "../../styles/Explorar/explorar.css";

const PlanesAdmin = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracionDias: "",
    cantidadCursos: "1"  // Nuevo campo
  });
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCrearPlan = async (e) => {
    e.preventDefault();
    const precioNum = Number(form.precio);
    const duracionNum = Number(form.duracionDias);
    const cantidadCursosNum = Number(form.cantidadCursos);

    if (!form.nombre || !form.descripcion || Number.isNaN(precioNum) || Number.isNaN(duracionNum) || Number.isNaN(cantidadCursosNum)) {
      window.alert("Completa todos los campos con valores válidos.");
      return;
    }

    try {
      setSaving(true);
      const { data } = await planesAPI.crearPlan({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: precioNum,
        duracionDias: duracionNum,
        cantidadCursos: cantidadCursosNum
      });

      if (data?.success && data.plan) {
        setForm({ 
          nombre: "", 
          descripcion: "",
          precio: "", 
          duracionDias: "",
          cantidadCursos: "1"
        });
        await fetchPlanes();
      } else {
        window.alert("No se pudo crear el plan. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error creando plan:", err);
      const msg = err?.response?.data?.message || "Ocurrió un error al crear el plan.";
      window.alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="explorar-main">
      <h2 className="explorar-title">Gestión de planes de suscripción</h2>
      <p className="text-sm text-slate-600 mb-4">
        Crea y administra los planes disponibles para los tutores. Solo los usuarios con rol administrador pueden acceder a esta sección.
      </p>

      <section className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Crear nuevo plan</h3>
        <form
          onSubmit={handleCrearPlan}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre del plan
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
              placeholder="Ej: Plan Pro"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Descripción
            </label>
            <input
              type="text"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
              placeholder="Ej: Plan para tutores profesionales"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Precio
            </label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
              placeholder="Ej: 29.99"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Duración (días)
            </label>
            <input
              type="number"
              name="duracionDias"
              value={form.duracionDias}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
              placeholder="Ej: 30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cantidad de cursos permitidos
            </label>
            <input
              type="number"
              name="cantidadCursos"
              min="1"
              value={form.cantidadCursos}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
              placeholder="Ej: 3"
            />
          </div>

          <div className="flex md:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="infocurso-reserve-btn w-full md:w-auto px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Crear plan"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Planes actuales</h3>

        {loading && <p className="explorar-empty">Cargando planes...</p>}
        {!loading && error && (
          <p className="explorar-empty text-red-500">{error}</p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg shadow-sm">
            {planes.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Nombre
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Descripción
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Precio (USD)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Duración (días)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Cursos permitidos
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planes.map((plan) => (
                    <tr key={plan._id} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-900">{plan.nombre}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{plan.descripcion}</td>
                      <td className="px-4 py-2 text-slate-700">
                        {typeof plan.precio === "number"
                          ? plan.precio.toFixed(2)
                          : plan.precio}
                      </td>
                      <td className="px-4 py-2 text-slate-700">{plan.duracionDias}</td>
                      <td className="px-4 py-2 text-slate-700">{plan.cantidadCursos}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {plan.estado || "activo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="explorar-empty">
                No hay planes configurados todavía. Crea uno usando el formulario de arriba.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default PlanesAdmin;
