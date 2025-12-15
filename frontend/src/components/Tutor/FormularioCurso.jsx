import { useState } from "react";
import { verificarAPI } from "../../api/verificar";
import { uploadsAPI } from "../../api/uploads";
import { usuariosAPI } from "../../api/usuarios";
import "../../styles/Tutor/formularioCurso.css";
import "../../styles/Tutor/successPopup.css";

const FormularioCurso = ({ open, onClose, onSuccess, cursoId }) => {
  const [comentario, setComentario] = useState("");
  const [fotoCi, setFotoCi] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fotoCi) {
      setError("Debes adjuntar al menos la foto o PDF de tu CI.");
      return;
    }

    // Subir archivos primero y construir payload JSON según DTO esperado por usuarios-service
    try {
      setLoading(true);

      // Subir foto_ci
      let fotoCiUrl = null;
      try {
        const res = await uploadsAPI.uploadImage(fotoCi);
        fotoCiUrl = res?.data?.url || null;
      } catch (upErr) {
        console.error("Error subiendo foto_ci:", upErr);
        throw new Error("No se pudo subir la foto del CI.");
      }

      // Subir archivos adicionales en paralelo
      const archivosUrls = [];
      if (archivos && archivos.length > 0) {
        const uploadPromises = archivos.map((file) => uploadsAPI.uploadImage(file));
        try {
          const results = await Promise.all(uploadPromises);
          results.forEach((r) => {
            if (r?.data?.url) archivosUrls.push(r.data.url);
          });
        } catch (upErr) {
          console.warn("Algunos archivos no se subieron:", upErr);
        }
      }

      // Agregar IDs desde localStorage
      let usuarioId = null;
      let perfilTutorId = null;
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          const idVal = user?._id || user?.id || user?.usuarioId || user?.userId || user?.sub;
          if (idVal) {
            usuarioId = idVal;
            console.log("Usuario ID obtenido de localStorage:", usuarioId);
            
            // Obtener el perfil de tutor del usuario
            try {
              const perfilRes = await usuariosAPI.obtenerPerfilTutorPorUsuario(idVal);
              console.log("Respuesta completa de perfil tutor:", perfilRes);
              
              // La respuesta puede tener la estructura completa (con data, status, etc.)
              // o directamente el objeto del perfil
              const perfilData = perfilRes?.data || perfilRes;
              perfilTutorId = perfilData?._id || perfilData?.id || null;
              
              console.log("Perfil tutor objeto:", perfilData);
              console.log("Perfil tutor ID extraído:", perfilTutorId);
              
              if (!perfilTutorId) {
                console.error("No se pudo extraer el ID del perfil de tutor. Objeto:", perfilData);
              }
            } catch (tutorErr) {
              console.error("Error completo obtieniendo perfil de tutor:", tutorErr);
              console.error("Status:", tutorErr?.response?.status);
              console.error("Data:", tutorErr?.response?.data);
            }
          }
        }
      } catch (err) {
        console.warn("No se pudo parsear localStorage.user:", err);
      }

      if (!perfilTutorId) {
        setError("No se pudo obtener tu perfil de tutor. Por favor, contacta al administrador.");
        return;
      }

      const payload = {
        comentario: comentario?.trim() || null,
        fotoCi: fotoCiUrl,
        archivos: archivosUrls,
        idCurso: cursoId || null,
        idUsuario: usuarioId,
        idPerfilTutor: perfilTutorId,
      };

      console.log("Payload enviado:", payload);
      const { data } = await verificarAPI.crearSolicitudCurso(payload);

      if (data) {
        setShowSuccess(true);
        // Cerrar el formulario después de 2 segundos
        setTimeout(() => {
          setShowSuccess(false);
          if (onSuccess) {
            onSuccess(data);
          } else if (onClose) {
            onClose();
          }
        }, 2000);
      } else {
        setError("No se pudo enviar la solicitud. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error en handleSubmit FormularioCurso:", err);
      setError(
        err?.message || err?.response?.data?.message || "Error al enviar la solicitud de verificación."
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

      {showSuccess && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-popup-icon">✓</div>
            <h3>¡Solicitud enviada con éxito!</h3>
            <p>Tu solicitud de verificación ha sido enviada correctamente.</p>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default FormularioCurso;
