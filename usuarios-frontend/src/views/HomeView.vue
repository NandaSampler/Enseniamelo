<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1>Bienvenido a Enseñamelo</h1>
        <p>Plataforma de gestión de usuarios</p>
        <div class="cta-buttons">
          <router-link to="/login" class="btn btn-primary">Iniciar Sesión</router-link>
          <router-link to="/register" class="btn btn-secondary">Crear Cuenta</router-link>
        </div>
      </div>
      
      <div class="features">
        <div class="feature-card">
          <div class="icon">👤</div>
          <h3>Gestión de Usuarios</h3>
          <p>Administra perfiles de estudiantes y docentes</p>
        </div>
        
        <div class="feature-card">
          <div class="icon">🔒</div>
          <h3>Seguro</h3>
          <p>Autenticación segura con encriptación</p>
        </div>
        
        <div class="feature-card">
          <div class="icon">⚡</div>
          <h3>Rápido</h3>
          <p>Tecnología reactiva de última generación</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  text-align: center;
  color: white;
  margin-bottom: 60px;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
  animation: fadeIn 0.8s ease-out;
}

.hero-content p {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
  animation: fadeIn 1s ease-out;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  animation: fadeIn 1.2s ease-out;
}

.btn {
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  animation: fadeIn 1.4s ease-out;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 22px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 32px;
  }
  
  .hero-content p {
    font-size: 16px;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>