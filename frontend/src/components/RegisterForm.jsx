import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/register.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";


const RegisterForm = () => {
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Registro:", { role });
    };

    return (
        <section className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <div className="register-logo-icon">E</div>
                    <div>
                        <p className="register-logo-text">Enseñamelo</p>
                        <p className="text-xs text-sky-900/80">
                            Crea tu cuenta para empezar a aprender o enseñar.
                        </p>
                    </div>
                </div>

                <h2 className="register-title">Registrarse</h2>
                <p className="register-subtitle">
                    Completa tus datos para continuar.
                </p>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div>
                        <label className="register-label" htmlFor="email">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="register-input"
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="register-label" htmlFor="password">
                            Contraseña
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="register-input pr-12"
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

                    <div>
                        <span className="register-label">¿Cómo usarás Enseñamelo?</span>
                        <div className="register-role-group">
                            <label className="register-role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    className="register-role-input"
                                    checked={role === "student"}
                                    onChange={() => setRole("student")}
                                />
                                <span className="register-role-label">Estudiante</span>
                            </label>
                            <label className="register-role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="tutor"
                                    className="register-role-input"
                                    checked={role === "tutor"}
                                    onChange={() => setRole("tutor")}
                                />
                                <span className="register-role-label">Docente / Tutor</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="register-submit">
                        Registrarse
                    </button>
                </form>

                <p className="text-center text-xs text-sky-900/80 mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-sky-800 hover:text-sky-900 cursor-pointer"
                    >
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default RegisterForm;
