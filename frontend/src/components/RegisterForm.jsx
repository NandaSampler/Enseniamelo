import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { authAPI } from "../api/auth";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState("student");
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
        const nombre = formData.get("nombre");
        const apellido = formData.get("apellido");
        const telefono = formData.get("telefono");

        // Si eligió rol tutor, redirigimos al flujo de registro de tutor
        if (role === "tutor") {
            setLoading(false);
            navigate("/registro-tutor", { replace: false });
            return;
        }

        // Mapear roles del formulario a código numérico para estudiante
        // cliente/estudiante = 1, admin = 3 (admin se gestionará desde Mongo)
        const rolCodigo = 1;

        try {
            const { data } = await authAPI.register({
                email,
                password,
                rolCodigo,
                nombre,
                apellido,
                telefono,
            });

            if (data?.success) {
                navigate("/login", { replace: true });
            } else {
                setError("No se pudo completar el registro. Intenta nuevamente.");
            }
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Error al registrarse. Verifica los datos ingresados.";
            setError(message);
        } finally {
            setLoading(false);
        }
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
                        <label className="register-label" htmlFor="nombre">
                            Nombre
                        </label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            className="register-input"
                            placeholder="Tu nombre"
                            required
                        />
                    </div>

                    <div>
                        <label className="register-label" htmlFor="apellido">
                            Apellido
                        </label>
                        <input
                            id="apellido"
                            name="apellido"
                            type="text"
                            className="register-input"
                            placeholder="Tu apellido"
                            required
                        />
                    </div>

                    <div>
                        <label className="register-label" htmlFor="email">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
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
                                name="password"
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
                        <label className="register-label" htmlFor="telefono">
                            Teléfono
                        </label>
                        <input
                            id="telefono"
                            name="telefono"
                            type="tel"
                            className="register-input"
                            placeholder="Ej: 999999999"
                            required
                        />
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
                                    onChange={() => {
                                        setRole("tutor");
                                        navigate("/registro-tutor");
                                    }}
                                />
                                <span className="register-role-label">Docente / Tutor</span>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 mb-2 text-center">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="register-submit" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Registrarse"}
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
