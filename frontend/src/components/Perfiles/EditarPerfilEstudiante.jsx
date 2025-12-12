import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Perfiles/perfilEstudiante.css";
import { authAPI } from "../../api/auth";

const EditarPerfilEstudiante = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    foto: "",
    descripcion: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.data.success) {
          const user = response.data.user;
          setForm((prev) => ({
            ...prev,
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            telefono: user.telefono || "",
            foto: user.foto || "",
            descripcion: user.descripcion || "",
          }));
        }
      } catch (error) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setForm((prev) => ({
          ...prev,
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          email: userData.email || "",
          telefono: userData.telefono || "",
          foto: userData.foto || "",
          descripcion: userData.descripcion || "",
        }));
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, foto: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // ¿El usuario está intentando cambiar la contraseña?
    const isChangingPassword =
      form.currentPassword || form.newPassword || form.confirmPassword;

    if (isChangingPassword) {
      if (!form.currentPassword) {
        alert("Debes ingresar tu contraseña actual para cambiarla");
        return;
      }

      if (!form.newPassword || !form.confirmPassword) {
        alert("Debes completar la nueva contraseña y su confirmación");
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      if (form.newPassword.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    try {
      setLoading(true);

      // Siempre puedes actualizar datos de perfil
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        foto: form.foto,
        descripcion: form.descripcion,
      };

      // Solo añadimos datos de contraseña si realmente la está cambiando
      if (isChangingPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const { data } = await authAPI.updateProfile(payload);

      if (data?.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Perfil actualizado exitosamente");

        // Limpiamos campos de contraseña después de guardar
        setForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));

        navigate("/perfil");
      } else {
        alert("No se pudo actualizar el perfil. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };


  const goBack = () => {
    navigate("/perfil");
  };

  return (
    <div className="edit-perfil-page">
      <div className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>Editar Perfil Estudiante</h1>
              <p className="header-subtitle">Container</p>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="container">
          <div className="edit-form">
            <form onSubmit={handleSave}>
              {/* Información Personal */}
              <div className="form-section">
                <h3 className="section-title">Información Personal</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-input"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      className="form-input"
                      value={form.apellido}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      className="form-input"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Foto de Perfil</label>
                  <div className="photo-upload">
                    <div className="photo-preview">
                      {form.foto ? (
                        <img src={form.foto} alt="Foto de perfil" />
                      ) : (
                        <div className="photo-placeholder">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="file-input"
                    />
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="upload-btn"
                    >
                      Cambiar Foto
                    </button>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="form-section">
                <h3 className="section-title">Descripción</h3>
                <div className="form-group">
                  <label className="form-label">Biografía</label>
                  <textarea
                    name="descripcion"
                    className="form-textarea"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Cuéntanos sobre ti..."
                    rows={4}
                  ></textarea>
                </div>
              </div>

              {/* Cambiar contraseña */}
              <div className="form-section">
                <h3 className="section-title">Cambiar Contraseña</h3>

                <div className="form-group">
                  <label className="form-label">Contraseña Actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-input"
                    value={form.currentPassword}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-input"
                      value={form.newPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={goBack}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilEstudiante;
