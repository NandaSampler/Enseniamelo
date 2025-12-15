import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import "../styles/login.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("client_id", "react-web-client");
      params.append("username", email);
      params.append("password", password);

      const tokenResponse = await fetch(
        "http://localhost:8080/realms/enseniamelo-realm/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(
          errorData.error_description || "Credenciales incorrectas"
        );
      }

      const tokenData = await tokenResponse.json();
      localStorage.setItem("token", tokenData.access_token);
      localStorage.setItem("access_token", tokenData.access_token);
      localStorage.setItem("refresh_token", tokenData.refresh_token);
      const userResponse = await fetch("https://localhost:8443/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(userData));
        const esAdmin = userData.rol === "ADMIN" || userData.rolCodigo === 3;
        const esDocente =
          userData.rol === "TUTOR" ||
          userData.rol === "DOCENTE" ||
          userData.rolCodigo === 2;

        if (esAdmin) {
          navigate("/admin/solicitudes-tutores");
        } else if (esDocente) {
          navigate("/panel-tutor");
        } else {
          navigate("/explorar");
        }
      } else {
        navigate("/explorar");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="login-glow" />
        <div className="login-header">
          <div className="login-logo-icon">E</div>
          <div>
            <p className="login-logo-text">Enseñamelo</p>
            <p className="text-xs text-sky-900/80">
              Ingresa para continuar con tus cursos y clases.
            </p>
          </div>
        </div>

        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle">
          Usa tu correo y contraseña para acceder.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="login-label" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="login-input"
              placeholder="ejemplo@correo.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="login-label" htmlFor="password">
              Contraseña
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="login-input pr-12"
                placeholder="••••••••"
                required
                disabled={loading}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="login-footer-text">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/register" className="login-footer-link">
            Regístrate
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LoginForm;
