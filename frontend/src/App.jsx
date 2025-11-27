import { Navigate, Route, Routes } from "react-router-dom";
import Explorar from "./components/Explorar/Explorar";
import InfoCurso from "./components/InfoCurso/InfoCurso";
import LoginForm from "./components/LoginForm";
import MisCursos from "./components/MisCursos/MisCursos";
import MisCursosAdmin from "./components/MisCursos/MisCursosAdmin";
import Navbar from "./components/Navbar";
import RegisterForm from "./components/RegisterForm";


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
        <Route
          path="/mis-cursos-admin"
          element={
            <>
              <Navbar currentSection="courses" />
              <MisCursosAdmin />
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
