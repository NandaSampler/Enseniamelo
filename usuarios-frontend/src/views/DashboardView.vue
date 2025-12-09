<template>
  <div class="dashboard">
    <nav class="navbar">
      <h1>Dashboard</h1>
      <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
    </nav>
    
    <div class="container">
      <div class="welcome-card">
        <h2>¡Bienvenido! 🎉</h2>
        <p>Has iniciado sesión correctamente.</p>
      </div>
      
      <div class="content-grid">
        <div class="card">
          <h3>Usuarios</h3>
          <p>Gestiona los usuarios del sistema</p>
          <router-link to="/usuarios" class="btn-link">Ver Usuarios</router-link>
        </div>
        
        <div class="card">
          <h3>Perfil</h3>
          <p>Actualiza tu información personal</p>
          <button class="btn-link">Ver Perfil</button>
        </div>
        
        <div class="card">
          <h3>Configuración</h3>
          <p>Ajusta las preferencias del sistema</p>
          <button class="btn-link">Configurar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import authService from '../services/authService';

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      authService.logout();
      router.push('/login');
    };

    return {
      handleLogout
    };
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.navbar {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.btn-logout {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #c0392b;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  margin-bottom: 40px;
  text-align: center;
}

.welcome-card h2 {
  margin: 0 0 10px 0;
  font-size: 32px;
}
</style>