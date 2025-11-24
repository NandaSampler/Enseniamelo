import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Explorar from "./components/Explorar/Explorar";
import MisCursos from "./components/MisCursos/MisCursos";
import InfoCurso from "./components/InfoCurso/InfoCurso"; 
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-slate-100">

      <Routes>
        {/* Login y registro */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

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

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
