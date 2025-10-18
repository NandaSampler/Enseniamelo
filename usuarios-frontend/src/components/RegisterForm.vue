<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Crear Cuenta</h2>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="nombre">Nombre completo</label>
          <input
            id="nombre"
            v-model="userData.nombre"
            type="text"
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div class="form-group">
          <label for="apellido">Apellido</label>
          <input
            id="apellido"
            v-model="userData.apellido"
            type="text"
            placeholder="Pérez"
            required
          />
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono</label>
          <input
            id="telefono"
            v-model="userData.telefono"
            type="text"
            placeholder="Ej. +591 70000000"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="userData.email"
            type="email"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="userData.password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            required
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "Registrando..." : "Crear Cuenta" }}
        </button>
      </form>

      <div class="auth-footer">
        <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "../services/authService";

export default {
  name: "RegisterForm",
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const error = ref(null);
    const success = ref(null);
    const userData = ref({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
    });
    const confirmPassword = ref("");

    const handleRegister = async () => {
      try {
        loading.value = true;
        error.value = null;
        success.value = null;
        if (userData.value.password !== confirmPassword.value) {
          error.value = "Las contraseñas no coinciden";
          loading.value = false;
          return;
        }
        if (userData.value.password.length < 6) {
          error.value = "La contraseña debe tener al menos 6 caracteres";
          loading.value = false;
          return;
        }

        const response = await authService.register({
          nombre: userData.value.nombre,
          apellido: userData.value.apellido,
          email: userData.value.email,
          telefono: userData.value.telefono,
          password: userData.value.password,
        });

        if (response.data && response.data.id) {
          success.value = "¡Cuenta creada exitosamente! Redirigiendo...";
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (err) {
        error.value =
          err.response?.data?.message || "Error al crear la cuenta. El email podría estar en uso.";
        console.error("Error en registro:", err);
      } finally {
        loading.value = false;
      }
    };

    return {
      userData,
      confirmPassword,
      loading,
      error,
      success,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin: 0 0 30px 0;
  color: #2c3e50;
  text-align: center;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #c33;
}

.success-message {
  background: #efe;
  color: #2a2;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #2a2;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
}

.auth-footer p {
  color: #666;
  font-size: 14px;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
