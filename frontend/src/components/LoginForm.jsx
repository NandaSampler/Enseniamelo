import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import "../styles/login.css";

const LoginForm = () => {

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");
        console.log("Login:", { email, password });
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

                    <button type="submit" className="login-submit">
                        Iniciar sesión
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
