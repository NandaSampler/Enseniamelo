import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/register.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState("ESTUDIANTE");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const nombre = formData.get("nombre");
        const apellido = formData.get("apellido");
        const email = formData.get("email");
        const telefono = formData.get("telefono");
        const password = formData.get("password");

        try {
            const registerResponse = await fetch('https://localhost:8443/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    email,
                    telefono,
                    contrasenia: password,
                    rol: role 
                }),
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                throw new Error(errorData.message || 'Error al registrar usuario');
            }

            const userData = await registerResponse.json();
            await new Promise(resolve => setTimeout(resolve, 1000));
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', 'react-web-client');
            params.append('username', email); 
            params.append('password', password);

            const tokenResponse = await fetch(
                'http://localhost:8080/realms/enseniamelo-realm/protocol/openid-connect/token',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params,
                }
            );

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                console.error('Error de login:', errorData);
                throw new Error(errorData.error_description || 'Error al iniciar sesión después del registro');
            }

            const tokenData = await tokenResponse.json();
        
            localStorage.setItem('access_token', tokenData.access_token);
            localStorage.setItem('refresh_token', tokenData.refresh_token);
            localStorage.setItem('user', JSON.stringify(userData));
            if (role === 'DOCENTE') {
                navigate('/panel-tutor');
            } else {
                navigate('/explorar');
            }
            
        } catch (err) {
            console.error('Error en registro:', err);
            setError(err.message || 'Error al registrar usuario');
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

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

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
                            placeholder="Juan"
                            required
                            disabled={loading}
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
                            placeholder="Pérez"
                            required
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="register-label" htmlFor="telefono">
                            Teléfono (opcional)
                        </label>
                        <input
                            id="telefono"
                            name="telefono"
                            type="tel"
                            className="register-input"
                            placeholder="+591 12345678"
                            disabled={loading}
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
                                minLength={6}
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

                    <div>
                        <span className="register-label">¿Cómo usarás Enseñamelo?</span>
                        <div className="register-role-group">
                            <label className="register-role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="ESTUDIANTE"
                                    className="register-role-input"
                                    checked={role === "ESTUDIANTE"}
                                    onChange={() => setRole("ESTUDIANTE")}
                                    disabled={loading}
                                />
                                <span className="register-role-label">Estudiante</span>
                            </label>
                            <label className="register-role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="DOCENTE"
                                    className="register-role-input"
                                    checked={role === "DOCENTE"}
                                    onChange={() => setRole("DOCENTE")}
                                    disabled={loading}
                                />
                                <span className="register-role-label">Docente / Tutor</span>
                            </label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="register-submit"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
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