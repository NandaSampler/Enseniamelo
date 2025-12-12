import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import "../styles/login.css";
import { authAPI } from "../api/auth";

const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const { data } = await authAPI.login(email, password);

            if (data?.success && data?.token) {
                localStorage.setItem("token", data.token);
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }

                const rolCodigo = data.user?.rolCodigo;
                const rol = data.user?.rol;

                let targetPath = "/mis-cursos";
                if (rolCodigo === 2 || rol === "docente") {
                    targetPath = "/panel-tutor";
                } else if (rolCodigo === 3 || rol === "admin") {
                    targetPath = "/admin/solicitudes-tutores";
                }

                navigate(targetPath, { replace: true });
            } else {
                setError("No se pudo iniciar sesión. Intenta nuevamente.");
            }
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Error al iniciar sesión. Verifica tus credenciales.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="login-container">
            <div className="login-card">
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

                    {error && (
                        <p className="text-sm text-red-600 mb-2 text-center">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="login-submit" disabled={loading}>
                        {loading ? "Ingresando..." : "Iniciar sesión"}
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
