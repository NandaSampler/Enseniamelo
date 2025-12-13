import { useState } from "react";
import { verificarAPI } from "../../api/verificar";
import "../../styles/Tutor/formularioCurso.css";

const FormularioCurso = ({ open, onClose, onSuccess, cursoId }) => {
  const [comentario, setComentario] = useState("");
  const [fotoCi, setFotoCi] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fotoCi) {
      setError("Debes adjuntar al menos la foto o PDF de tu CI.");
      return;
    }

    const formData = new FormData();
    if (comentario.trim()) {
      formData.append("comentario", comentario.trim());
    }
    if (cursoId) {
      formData.append("cursoId", cursoId);
    }
    formData.append("foto_ci", fotoCi);
    archivos.forEach((file) => {
      formData.append("archivos", file);
    });

    try {
      setLoading(true);
      const { data } = await verificarAPI.crearSolicitud(formData);
      if (data?.success) {
        if (onSuccess) {
          onSuccess(data.solicitud);
        } else if (onClose) {
          onClose();
        }
      } else {
        setError("No se pudo enviar la solicitud. Intenta nuevamente.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Error al enviar la solicitud de verificación."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeFotoCi = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoCi(file);
  };

  const handleChangeArchivos = (e) => {
    const files = Array.from(e.target.files || []);
    setArchivos(files);
  };

  return (
    <div className="form-curso-modal-overlay">
      <div className="form-curso-modal">
        <div className="form-curso-header">
          <h2 className="form-curso-title">Verificación de tutor</h2>
          <button
            type="button"
            className="form-curso-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="form-curso-subtitle">
          Sube la foto o PDF de tu documento de identidad y cualquier
          documentación adicional que respalde tu experiencia como tutor.
        </p>

        {error && <p className="form-curso-error">{error}</p>}

        <form onSubmit={handleSubmit} className="form-curso-form">
          <div className="form-curso-field">
            <label className="form-curso-label" htmlFor="comentario">
              Comentario para el administrador (opcional)
            </label>
            <textarea
              id="comentario"
              className="form-curso-textarea"
              rows={4}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Describe brevemente tu experiencia o cualquier información relevante."
            />
          </div>

          <div className="form-curso-field">
            <label className="form-curso-label" htmlFor="foto_ci">
              CI (imagen o PDF) *
            </label>
            <input
              id="foto_ci"
              type="file"
              accept="image/*,application/pdf"
              className="form-curso-input-file"
              onChange={handleChangeFotoCi}
            />
            <p className="form-curso-hint">
              Formatos permitidos: JPG, PNG, WEBP o PDF. Máx. 10 MB.
            </p>
          </div>

          <div className="form-curso-field">
            <label className="form-curso-label" htmlFor="archivos">
              Documentos adicionales (imágenes o PDF)
            </label>
            <input
              id="archivos"
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="form-curso-input-file"
              onChange={handleChangeArchivos}
            />
            <p className="form-curso-hint">
              Puedes subir certificados, títulos u otra documentación relevante.
            </p>
          </div>

          <div className="form-curso-actions">
            <button
              type="button"
              className="form-curso-btn form-curso-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="form-curso-btn form-curso-btn-primary"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCurso;
