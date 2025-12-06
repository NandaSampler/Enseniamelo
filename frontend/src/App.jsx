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

function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Routes>

        {/* Login y registro */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/payments-service-panel" element={<PaymentsDashboard />} />

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
        <Route path="/curso/:id" element={
          <>
            <Navbar currentSection="courses" />
            <InfoCurso />
          </>
        }/>

        {/* PAYMENTS SERVICE PANEL */}
        <Route path="/payments-service-panel" element={<PaymentsDashboard />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/payments-service-panel" replace />} />
      </Routes>
    </div>
  );
}

export default App;
