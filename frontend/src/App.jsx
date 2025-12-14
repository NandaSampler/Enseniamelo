import { Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./components/NotificationProvider";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Explorar from "./components/Explorar/Explorar";
import MisCursos from "./components/MisCursos/MisCursos";
import InfoCurso from "./components/InfoCurso/InfoCurso";
import Navbar from "./components/Navbar";
import PerfilEstudiante from "./components/Perfiles/PerfilEstudiante";
import EditarPerfilEstudiante from "./components/Perfiles/EditarPerfilEstudiante";
import PanelTutor from "./components/Tutor/PanelTutor";
import ConfigurarCurso from "./components/Tutor/ConfigurarCurso";
import PerfilTutor from "./components/Perfiles/PerfilTutor";
import EditarPerfilTutor from "./components/Perfiles/EditarPerfilTutor";
import PanelAdmin from "./components/Admin/PanelAdmin";
import ChatPage from "./components/Chat/ChatPage";
import Planes from "./components/Pagos/Planes";

function App() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-100">
        <Routes>
          {/* Redirección raíz  */}
          <Route path="/" element={<Navigate to="/explorar" replace />} />

          {/* Login y registro */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Panel admin (solicitudes de tutores) */}
          <Route
            path="/admin/solicitudes-tutores"
            element={
              <>
                <Navbar currentSection="admin" adminMode />
                <PanelAdmin />
              </>
            }
          />

          {/* Chats */}
          <Route
            path="/chats"
            element={
              <>
                <Navbar currentSection="chats" />
                <ChatPage />
              </>
            }
          />
          <Route
            path="/chats/:id"
            element={
              <>
                <Navbar currentSection="chats" />
                <ChatPage />
              </>
            }
          />

          {/* Explorar */}
          <Route
            path="/explorar"
            element={
              <>
                <Navbar currentSection="explore" />
                <Explorar />
              </>
            }
          />

          {/* Mis cursos */}
          <Route
            path="/mis-cursos"
            element={
              <>
                <Navbar currentSection="courses" />
                <MisCursos />
              </>
            }
          />

          {/* Perfil */}
          <Route path="/perfil" element={
            <>
              <Navbar currentSection="profile" />
              <PerfilEstudiante />
            </>
          } />

          {/* Editar Perfil */}
          <Route path="/perfil/editar" element={
            <>
              <Navbar currentSection="profile" />
              <EditarPerfilEstudiante />
            </>
          } />

          {/* Info de curso */}
          <Route path="/curso/:id" element={
            <>
              <Navbar currentSection="courses" />
              <InfoCurso />
            </>
          } />

          {/* Panel tutor */}
          <Route
            path="/panel-tutor"
            element={
              <>
                <Navbar currentSection="tutor-panel" />
                <PanelTutor />
              </>
            }
          />
          <Route
            path="/tutor/curso/nuevo"
            element={
              <>
                <Navbar currentSection="tutor-panel" />
                <ConfigurarCurso />
              </>
            }
          />

          <Route
            path="/planes"
            element={
              <>
                <Navbar currentSection="planes" />
                <Planes />
              </>
            }
          />

          {/* Perfil tutor */}
          <Route path="/tutor/perfil" element={<PerfilTutor />} />
          <Route path="/tutor/perfil/editar" element={<EditarPerfilTutor />} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
}

export default App;