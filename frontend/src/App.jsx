<<<<<<< HEAD
import { Navigate, Route, Routes } from "react-router-dom";
import Explorar from "./components/Explorar/Explorar";
import InfoCurso from "./components/InfoCurso/InfoCurso";
import LoginForm from "./components/LoginForm";
import MisCursos from "./components/MisCursos/MisCursos";
import MisCursosAdmin from "./components/MisCursos/MisCursosAdmin";
import Navbar from "./components/Navbar";
import RegisterForm from "./components/RegisterForm";


// PANEL DE PAGOS
import PaymentsDashboard from "./components/Payments-Service/PaymentDashboard";
=======
import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Explorar from "./components/Explorar/Explorar";
import MisCursos from "./components/MisCursos/MisCursos";
import InfoCurso from "./components/InfoCurso/InfoCurso";
import Navbar from "./components/Navbar";

import UsersDashboard from "./components/Usuarios-Service/UsuariosDashboard";
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662

function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Routes>

        {/* Login y registro */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
<<<<<<< HEAD
        <Route path="/payments-service-panel" element={<PaymentsDashboard />} />
=======
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662

        {/* Explorar */}
        <Route path="/explorar" element={
          <>
            <Navbar currentSection="explore" />
            <Explorar />
          </>
        }/>

        {/* Mis cursos */}
        <Route path="/mis-cursos" element={
          <>
            <Navbar currentSection="courses" />
            <MisCursos />
          </>
        }/>

        {/* Info de curso */}
<<<<<<< HEAD
        <Route
          path="/curso/:id"
          element={
            <>
              <Navbar currentSection="courses" />  
              <InfoCurso />
            </>
          }
        />
        <Route
          path="/mis-cursos-admin"
          element={
            <>
              <Navbar currentSection="courses" />
              <MisCursosAdmin />
            </>
          }
        />
=======
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
        <Route path="/curso/:id" element={
          <>
            <Navbar currentSection="courses" />
            <InfoCurso />
          </>
        }/>

<<<<<<< HEAD
        {/* PAYMENTS SERVICE PANEL */}
        <Route path="/payments-service-panel" element={<PaymentsDashboard />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/payments-service-panel" replace />} />
=======
        {/* USERS SERVICE PANEL */}
        <Route
          path="/users-service-panel"
          element={
            <>
              <Navbar currentSection="users" />
              <UsersDashboard />
            </>
          }
        />

        {/* Default - redirige al panel de usuarios */}
        <Route path="*" element={<Navigate to="/users-service-panel" replace />} />
>>>>>>> 3ab44bd0dbc43443ab5865f44b5861d58886c662
      </Routes>
    </div>
  );
}

export default App;
