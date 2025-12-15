import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/config";
import { cursosAPI } from "../../api/cursos";
import { uploadsAPI } from "../../api/uploads";
import "../../styles/Tutor/configCurso.css";
import { useNotification } from "../NotificationProvider";
import FormularioCurso from "./FormularioCurso";

const modalidadMap = {
  virtual: "online",
  presencial: "presencial",
  hibrida: "mixto",
};

const normalizeCategorias = (data) => {
  if (data?.success && Array.isArray(data.categorias)) return data.categorias;
  if (Array.isArray(data)) return data;
  return [];
};

const isAbortError = (controller, error) =>
  controller?.signal?.aborted ||
  error?.code === "ERR_CANCELED" ||
  error?.name === "CanceledError";

const parseFastApiDetail = (detail) => {
  if (!detail) return null;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const first = detail[0];
    if (!first) return "Error de validación (422).";
    const loc = Array.isArray(first.loc) ? first.loc.join(" → ") : "";
    const msg = first.msg || "Error de validación.";
    return loc ? `${loc}: ${msg}` : msg;
  }

  if (typeof detail === "object") {
    return detail.message || JSON.stringify(detail);
  }

  return "Error de validación (422).";
};

const toMoney2 = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};

const ConfigurarCurso = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();

  const notifiedCategoriasErrorRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [previewPortada, setPreviewPortada] = useState("");
  const [previewGaleria, setPreviewGaleria] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    modalidad: "",
    precio_reserva: 0,
    necesita_reserva: true,
    tags: [], // ids categorias
    portada_url: "",
    galeria_urls: [],
    tiene_cupo_limitado: false,
    cupo_maximo: 0,
  });

  const [categorias, setCategorias] = useState([]);
  const [openVerificacion, setOpenVerificacion] = useState(false);
  const [cursoCreadoId, setCursoCreadoId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategorias = async () => {
      try {
        // ✅ endpoint con slash final
        const { data } = await api.get("/curso/api/v1/categorias/", {
          signal: controller.signal,
        });

        // ✅ NORMALIZAR: asegurar que cada categoría tenga _id
        const catsRaw = normalizeCategorias(data);
        const cats = catsRaw
          .map((c) => ({
            ...c,
            _id: c?._id || c?.id, // <-- clave
          }))
          .filter((c) => Boolean(c?._id)); // descarta categorías sin id

        setCategorias(cats);
      } catch (error) {
        if (isAbortError(controller, error)) return;

        if (!notifiedCategoriasErrorRef.current) {
          notifiedCategoriasErrorRef.current = true;

          if (error?.code === "ERR_NETWORK") {
            showNotification({
              type: "error",
              title: "Network Error",
              message:
                "No se pudo conectar al gateway. En DEV usa el proxy de Vite (baseURL '/api'). Revisa que gateway esté arriba.",
              duration: 7000,
            });
          } else {
            showNotification({
              type: "error",
              title: "Error",
              message: "No se pudieron cargar las categorías",
              duration: 5000,
            });
          }
        }

        console.error("Error obteniendo categorías:", error);
      }
    };

    fetchCategorias();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleCategoriaTag = (categoriaId) => {
    if (!categoriaId) return; // ✅ evita meter undefined

    setForm((prev) => {
      const alreadySelected = prev.tags.includes(categoriaId);

      if (alreadySelected) {
        return { ...prev, tags: prev.tags.filter((id) => id !== categoriaId) };
      }

      if (prev.tags.length >= 3) {
        showNotification({
          type: "warning",
          title: "Límite alcanzado",
          message: "Solo puedes seleccionar hasta 3 categorías",
        });
        return prev;
      }

      return { ...prev, tags: [...prev.tags, categoriaId] };
    });
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handlePickPortada = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const maxFiles = 4;
    const limitedFiles = files.slice(0, maxFiles);

    try {
      const nuevasUrls = [];

      for (let i = 0; i < limitedFiles.length; i += 1) {
        const file = limitedFiles[i];

        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result;
          if (typeof result === "string") {
            if (i === 0) setPreviewPortada(result);
            setPreviewGaleria((prev) => [...prev, result].slice(0, maxFiles));
          }
        };
        reader.readAsDataURL(file);

        const { data } = await uploadsAPI.uploadImage(file);
        const url = data?.url;
        if (url) nuevasUrls.push(url);
      }

      if (nuevasUrls.length > 0) {
        setForm((prev) => ({
          ...prev,
          portada_url: prev.portada_url || nuevasUrls[0],
          galeria_urls: [...(prev.galeria_urls || []), ...nuevasUrls].slice(
            0,
            maxFiles
          ),
        }));

        showNotification({
          type: "success",
          title: "Imágenes subidas",
          message: `${nuevasUrls.length} imagen(es) subida(s) correctamente`,
        });
      }
    } catch (error) {
      console.error("Error subiendo imágenes del curso:", {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data,
        url: `${error?.config?.baseURL || ""}${error?.config?.url || ""}`,
      });

      showNotification({
        type: "error",
        title: "Error al subir imágenes",
        message:
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Upload falló. Revisa consola para ver status y ruta.",
      });
    } finally {
      e.target.value = "";
    }
  };

  const buildPayload = () => {
    const selectedCategorias = categorias.filter((cat) =>
      (form.tags || []).includes(cat._id)
    );

    const galeria = Array.isArray(form.galeria_urls) ? form.galeria_urls : [];

    const necesita = Boolean(form.necesita_reserva);
    const precio = toMoney2(form.precio_reserva);

    const tieneCupo = Boolean(form.tiene_cupo_limitado);
    const cupoVal = tieneCupo ? Number(form.cupo_maximo) : null;

    // ✅ SUPER IMPORTANTE: nunca mandes undefined
    const categoriasIds = Array.isArray(form.tags)
      ? form.tags.filter(Boolean)
      : [];

    return {
      nombre: String(form.nombre || "").trim(),
      descripcion: String(form.descripcion || "").trim(),
      modalidad: modalidadMap[form.modalidad],

      necesita_reserva: necesita,
      precio_reserva: necesita ? precio : "0.00",

      portada_url: form.portada_url ? String(form.portada_url) : null,
      galeria_urls: galeria,

      tiene_cupo: tieneCupo,
      cupo: tieneCupo ? (Number.isFinite(cupoVal) ? cupoVal : null) : null,

      categorias: categoriasIds,
      tags: selectedCategorias.map((cat) => cat.nombre),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.nombre?.trim() ||
      !form.descripcion?.trim() ||
      !form.modalidad ||
      (form.tags || []).filter(Boolean).length === 0
    ) {
      showNotification({
        type: "warning",
        title: "Campos incompletos",
        message: "Por favor completa todos los campos requeridos",
      });
      return;
    }

    if (!form.precio_reserva || Number(form.precio_reserva) <= 0) {
      showNotification({
        type: "warning",
        title: "Precio inválido",
        message: "El precio debe ser mayor a 0",
      });
      return;
    }

    if (
      form.tiene_cupo_limitado &&
      (!form.cupo_maximo || Number(form.cupo_maximo) <= 0)
    ) {
      showNotification({
        type: "warning",
        title: "Cupo inválido",
        message: "Si limitas cupos, el cupo máximo debe ser mayor a 0",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = buildPayload();
      console.log("🚀 Payload enviado a /cursos:", payload);

      const { data } = await cursosAPI.createCurso(payload);

      const id = data?._id || data?.id;

      if (id) {
        setCursoCreadoId(id);
        showNotification({
          type: "success",
          title: "¡Curso creado!",
          message:
            "Tu curso ha sido creado exitosamente. Ahora envía la verificación.",
          duration: 5000,
        });
        setOpenVerificacion(true);
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message:
            "El curso se creó pero no se recibió el ID. Revisa la respuesta del backend.",
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      console.error("❌ Error creando curso (FULL):", error);
      console.error("❌ status:", status);
      console.error("❌ response.data:", data);
      console.error("❌ response.data.detail:", data?.detail);

      const msg =
        parseFastApiDetail(data?.detail) ||
        data?.message ||
        "Ocurrió un error. Por favor intenta de nuevo.";

      if (status === 403) {
        showNotification({
          type: "warning",
          title: "Límite de cursos alcanzado",
          message: msg,
          duration: 7000,
        });
        navigate("/planes");
        return;
      }
      
      showNotification({
        type: "error",
        title: `Error al crear curso${status ? ` (${status})` : ""}`,
        message: msg,
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate("/panel-tutor");

  return (
    <div className="config-curso-page">
      <div className="main-content">
        <div className="container">
          <div className="config-curso-header-simple">
            <h1>Configuración Curso (Docente)</h1>
            <button
              type="button"
              className="verificacion-btn"
              onClick={() => setOpenVerificacion(true)}
            >
              Verificar cuenta de tutor
            </button>
          </div>

          <div className="form-container">
            <form onSubmit={handleSubmit} className="config-curso-form">
              <div className="form-layout">
                <div className="left-section">
                  <button type="button" onClick={goBack} className="back-btn">
                    ← Volver
                  </button>

                  <div className="image-upload-large" onClick={triggerFileInput}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handlePickPortada}
                    />
                    {previewPortada ? (
                      <img
                        src={previewPortada}
                        alt="Portada"
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">+</div>
                    )}
                  </div>

                  <div className="description-section">
                    <h3>DESCRIPCIÓN DEL CURSO</h3>
                    <textarea
                      className="description-textarea"
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Describe el contenido del curso, objetivos, metodología..."
                      rows={8}
                      required
                    />
                  </div>
                </div>

                <div className="right-section">
                  <div className="form-group">
                    <label className="form-label">Título curso</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-input"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Nombre del curso"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Categorías (hasta 3)</label>
                    <div className="tag-container">
                      <div className="tags-list">
                        {categorias.map((cat) => {
                          const catId = cat._id; // ya normalizado
                          const selected = form.tags.includes(catId);

                          return (
                            <button
                              key={catId}
                              type="button"
                              className={
                                "tag-item " + (selected ? "tag-item-selected" : "")
                              }
                              onClick={() => toggleCategoriaTag(catId)}
                            >
                              {cat.nombre}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bs/hora</label>
                    <div className="price-container">
                      <input
                        type="number"
                        name="precio_reserva"
                        className="form-input price-input"
                        value={form.precio_reserva}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                      <div className="toggle-container">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            name="necesita_reserva"
                            className="toggle-input"
                            checked={form.necesita_reserva}
                            onChange={handleChange}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                    <p className="price-hint">Define el precio por hora.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modalidad</label>
                    <select
                      className="form-select"
                      name="modalidad"
                      value={form.modalidad}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar modalidad</option>
                      <option value="presencial">Presencial</option>
                      <option value="virtual">Virtual</option>
                      <option value="hibrida">Híbrida</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <input
                        type="checkbox"
                        name="tiene_cupo_limitado"
                        checked={form.tiene_cupo_limitado}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Limitar cupos disponibles
                    </label>
                  </div>

                  {form.tiene_cupo_limitado && (
                    <div className="form-group">
                      <label className="form-label">Cupo máximo</label>
                      <input
                        type="number"
                        name="cupo_maximo"
                        className="form-input"
                        value={form.cupo_maximo}
                        onChange={handleChange}
                        placeholder="Ej: 20"
                        min="1"
                        required={form.tiene_cupo_limitado}
                      />
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" onClick={goBack} className="cancel-btn">
                      Cancelar
                    </button>
                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar Curso"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <FormularioCurso
        open={openVerificacion}
        onClose={() => {
          setOpenVerificacion(false);
          navigate("/panel-tutor");
        }}
        onSuccess={() => {
          setOpenVerificacion(false);
          navigate("/panel-tutor");
        }}
        cursoId={cursoCreadoId}
      />
    </div>
  );
};

export default ConfigurarCurso;
