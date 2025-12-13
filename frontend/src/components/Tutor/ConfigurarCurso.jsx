import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/config";
import { cursosAPI } from "../../api/cursos";
import { uploadsAPI } from "../../api/uploads";
import { useNotification } from "../NotificationProvider";
import FormularioCurso from "./FormularioCurso";
import "../../styles/Tutor/configCurso.css";

const ConfigurarCurso = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [previewPortada, setPreviewPortada] = useState("");
  const [previewGaleria, setPreviewGaleria] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    modalidad: "",
    precio_reserva: 0,
    necesita_reserva: true,
    tags: [],
    portada_url: "",
    galeria_urls: [],
    tiene_cupo_limitado: false,
    cupo_maximo: 0,
  });

  const [categorias, setCategorias] = useState([]);
  const [openVerificacion, setOpenVerificacion] = useState(false);
  const [cursoCreadoId, setCursoCreadoId] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data } = await api.get("/categorias");
        if (data?.success && Array.isArray(data.categorias)) {
          setCategorias(data.categorias);
        }
      } catch (error) {
        console.error("Error obteniendo categorías:", error);
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar las categorías'
        });
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleCategoriaTag = (categoriaId) => {
    setForm((prev) => {
      const alreadySelected = prev.tags.includes(categoriaId);

      if (alreadySelected) {
        return {
          ...prev,
          tags: prev.tags.filter((id) => id !== categoriaId),
        };
      }

      if (prev.tags.length >= 3) {
        showNotification({
          type: 'warning',
          title: 'Límite alcanzado',
          message: 'Solo puedes seleccionar hasta 3 categorías'
        });
        return prev;
      }

      return {
        ...prev,
        tags: [...prev.tags, categoriaId],
      };
    });
  };

  const handlePickPortada = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const maxFiles = 4;
    const limitedFiles = files.slice(0, maxFiles);

    try {
      const nuevasUrls = [];
      const nuevasPrevias = [];

      for (let i = 0; i < limitedFiles.length; i += 1) {
        const file = limitedFiles[i];

        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result;
          if (typeof result === "string") {
            nuevasPrevias.push(result);
            if (i === 0) {
              setPreviewPortada(result);
            }
            setPreviewGaleria((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);

        const { data } = await uploadsAPI.uploadImage(file);
        if (data?.success && data.url) {
          nuevasUrls.push(data.url);
        }
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
          type: 'success',
          title: 'Imágenes subidas',
          message: `${nuevasUrls.length} imagen(es) subida(s) correctamente`
        });
      }
    } catch (error) {
      console.error("Error subiendo imágenes del curso:", error);
      showNotification({
        type: 'error',
        title: 'Error al subir imágenes',
        message: 'Usa JPG/PNG/WebP y archivos menores a 5MB'
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.descripcion || !form.modalidad || form.tags.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Campos incompletos',
        message: 'Por favor completa todos los campos requeridos'
      });
      return;
    }
    if (!form.precio_reserva || Number(form.precio_reserva) <= 0) {
      showNotification({
        type: 'warning',
        title: 'Precio inválido',
        message: 'El precio debe ser mayor a 0'
      });
      return;
    }

    try {
      setLoading(true);

      const selectedCategorias = categorias.filter((cat) =>
        form.tags.includes(cat._id)
      );

      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        modalidad: form.modalidad,
        precio_reserva: Number(form.precio_reserva),
        necesita_reserva: form.necesita_reserva,
        categorias: form.tags,
        tags: selectedCategorias.map((cat) => cat.nombre),
        portada_url: form.portada_url || "",
        galeria_urls: Array.isArray(form.galeria_urls) ? form.galeria_urls : [],
        tiene_cupo_limitado: form.tiene_cupo_limitado,
        cupo_maximo: form.tiene_cupo_limitado ? Number(form.cupo_maximo) : 0,
      };

      const { data } = await cursosAPI.createCurso(payload);

      if (data?.success && data.curso?._id) {
        setCursoCreadoId(data.curso._id);
        showNotification({
          type: 'success',
          title: '¡Curso creado!',
          message: 'Tu curso ha sido creado exitosamente. Ahora envía la verificación.',
          duration: 5000
        });
        setOpenVerificacion(true);
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo crear el curso. Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error("Error creando curso:", error);
      showNotification({
        type: 'error',
        title: 'Error al crear curso',
        message: 'Ocurrió un error. Por favor intenta de nuevo.'
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
                        style={{ maxHeight: "100%", maxWidth: "100%", borderRadius: 8 }}
                      />
                    ) : (
                      <div className="image-placeholder">
                        +
                      </div>
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
                    ></textarea>
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
                          const selected = form.tags.includes(cat._id);
                          return (
                            <button
                              key={cat._id}
                              type="button"
                              className={
                                "tag-item " + (selected ? "tag-item-selected" : "")
                              }
                              onClick={() => toggleCategoriaTag(cat._id)}
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
                      <p className="text-sm text-slate-600 mt-1">
                        Número máximo de estudiantes que pueden reservar este curso
                      </p>
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