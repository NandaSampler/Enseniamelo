import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Explorar from "./components/Explorar/Explorar";
import MisCursos from "./components/MisCursos/MisCursos";
import InfoCurso from "./components/InfoCurso/InfoCurso";
import Navbar from "./components/Navbar";

// PANEL DE PAGOS
import PaymentsDashboard from "./components/Payments-Service/PaymentDashboard";

function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Routes>

        {/* Login y registro */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

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
        <Route path="/curso/:id" element={
          <>
            <Navbar currentSection="courses" />
            <InfoCurso />
          </>
        }/>

        {/* PAYMENTS SERVICE PANEL */}
        <Route
          path="/payments-service-panel"
          element={
            <>
              <Navbar currentSection="payments" />
              <PaymentsDashboard />
            </>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/payments-service-panel" replace />} />
      </Routes>
    </div>
  );
}

export default App;
