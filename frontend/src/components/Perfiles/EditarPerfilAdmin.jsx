// frontend/src/components/Perfiles/EditarPerfilAdmin.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Perfiles/perfilEstudiante.css";
import { authAPI } from "../../api/auth";
import Navbar from "../Navbar";
import ConfirmModal from "../ConfirmModal";
import { useNotification } from "../NotificationProvider";

const EditarPerfilAdmin = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState("ADMIN");
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
      setLoadingData(true);
      
      // 🔍 DEBUG: Verificar token y roles
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log('🔍 Token JWT payload:', payload);
          console.log('🔍 Roles:', payload?.realm_access?.roles);
        } catch (e) {
          console.error('❌ Error parseando token:', e);
        }
      }
      
      try {
        const response = await authAPI.getProfile();
        
        console.log('✅ [EditarPerfilAdmin] Respuesta API:', response);
        
        if (response?.data?.success && response.data.user) {
          const user = response.data.user;
          
          setUserId(user.id || user._id);
          setUserRole(user.rol || "ADMIN");
          
          setForm((prev) => ({
            ...prev,
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
            telefono: user.telefono || user.phone || "",
            foto: user.foto || user.photo || user.picture || "",
            descripcion: user.descripcion || user.biografia || user.bio || "",
          }));
          
          console.log('✅ [EditarPerfilAdmin] Datos cargados desde API:', user);
          setLoadingData(false);
          return;
        }
        
      } catch (error) {
        console.warn('⚠️ [EditarPerfilAdmin] Error desde API:', error?.message);
      }
      
      try {
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('📦 [EditarPerfilAdmin] Datos desde localStorage:', userData);
          
          setUserId(userData.id || userData._id);
          setUserRole(userData.rol || "ADMIN");
          
          setForm((prev) => ({
            ...prev,
            nombre: userData.nombre || "",
            apellido: userData.apellido || "",
            email: userData.email || "",
            telefono: userData.telefono || userData.phone || "",
            foto: userData.foto || userData.photo || userData.picture || "",
            descripcion: userData.descripcion || userData.biografia || userData.bio || "",
          }));
          
          console.log('✅ [EditarPerfilAdmin] Formulario actualizado desde localStorage');
        } else {
          console.error('❌ [EditarPerfilAdmin] No hay datos en localStorage');
        }
      } catch (parseError) {
        console.error('❌ [EditarPerfilAdmin] Error parseando localStorage:', parseError);
      } finally {
        setLoadingData(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const isChangingPassword =
      form.currentPassword || form.newPassword || form.confirmPassword;

    if (isChangingPassword) {
      if (!form.currentPassword) {
        showNotification({
          type: "warning",
          title: "Campo requerido",
          message: "Debes ingresar tu contraseña actual para cambiarla"
        });
        return;
      }

      if (!form.newPassword || !form.confirmPassword) {
        showNotification({
          type: "warning",
          title: "Campos incompletos",
          message: "Debes completar la nueva contraseña y su confirmación"
        });
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        showNotification({
          type: "error",
          title: "Error",
          message: "Las contraseñas no coinciden"
        });
        return;
      }

      if (form.newPassword.length < 6) {
        showNotification({
          type: "warning",
          title: "Contraseña débil",
          message: "La nueva contraseña debe tener al menos 6 caracteres"
        });
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    setShowConfirmModal(false);

    try {
      setLoading(true);

      if (!userId) {
        showNotification({
          type: "error",
          title: "Error",
          message: "No se pudo identificar tu usuario. Intenta cerrar sesión y volver a entrar."
        });
        setLoading(false);
        return;
      }

      const isChangingPassword =
        form.currentPassword || form.newPassword || form.confirmPassword;

      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono.replace(/[^0-9+]/g, '').substring(0, 16),
        foto: form.foto || "",
        rol: userRole,
      };

      if (isChangingPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      console.log('📤 [EditarPerfilAdmin] Enviando payload:', payload);

      const { data } = await authAPI.updateProfile(userId, payload);

      console.log('✅ [EditarPerfilAdmin] Respuesta del servidor:', data);

      if (data) {
        localStorage.setItem("user", JSON.stringify(data));
        console.log('✅ [EditarPerfilAdmin] localStorage actualizado');
        
        showNotification({
          type: "success",
          title: "¡Perfil actualizado!",
          message: "Tu información se ha guardado correctamente"
        });

        setForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));

        setTimeout(() => navigate("/admin/perfil"), 1000);
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: "No se pudo actualizar el perfil. Intenta nuevamente."
        });
      }
    } catch (error) {
      console.error('❌ [EditarPerfilAdmin] Error actualizando:', error);
      showNotification({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Error al actualizar el perfil"
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/admin/perfil");
  };

  if (loadingData) {
    return (
      <>
        <Navbar currentSection="admin" adminMode />
        <div className="edit-perfil-page">
          <div className="header">
            <div className="container">
              <div className="header-content">
                <div className="header-left">
                  <h1>Editar Perfil Administrador</h1>
                  <p className="header-subtitle">Cargando datos...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar currentSection="admin" adminMode />
      <div className="edit-perfil-page">
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleSave}
          title="¿Guardar cambios?"
          message="Se actualizará tu información de perfil. Esta acción no se puede deshacer."
          type="info"
          confirmText="Guardar"
          cancelText="Cancelar"
        />

        <div className="header">
          <div className="container">
            <div className="header-content">
              <div className="header-left">
                <h1>Editar Perfil Administrador</h1>
                <p className="header-subtitle">Actualiza tu información</p>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="container">
            <div className="edit-form">
              <form onSubmit={handleSubmit}>
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

                <div className="form-section">
                  <h3 className="section-title">Descripción</h3>
                  <div className="form-group">
                    <label className="form-label">Biografía</label>
                    <textarea
                      name="descripcion"
                      className="form-textarea"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Cuéntanos sobre tu rol como administrador..."
                      rows={4}
                    ></textarea>
                    <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                      ⚠️ Nota: La biografía aún no se guarda en el backend. Solo se guardan: nombre, apellido, email, teléfono y foto.
                    </small>
                  </div>
                </div>

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
    </>
  );
};

export default EditarPerfilAdmin;