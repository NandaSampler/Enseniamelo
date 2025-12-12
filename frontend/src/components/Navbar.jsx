import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = ({ currentSection }) => {
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        }

        if (profileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileOpen]);

    const linkClasses = (section) =>
        "navbar-link " + (currentSection === section ? "navbar-link-active" : "");

    const defaultAvatarUrl =
        "https://ui-avatars.com/api/?name=U&background=CBD5F5&color=1E293B";

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <div className="flex items-center gap-3">
                    <div className="navbar-logo-icon">
                        <span className="text-lg font-bold">E</span>
                    </div>
                    <span className="navbar-logo-text hidden sm:inline">
                        Enseñamelo
                    </span>
                </div>

                <div className="navbar-actions">
                    <nav className="navbar-links">
                        <Link to="/mis-cursos" className={linkClasses("courses")}>
                            Mis cursos
                        </Link>
                        <button className={linkClasses("chats")} disabled>
                            Chats
                        </button>
                        <Link to="/explorar" className={linkClasses("explore")}>
                            Explorar
                        </Link>
                    </nav>

                    <button
                        className="navbar-menu-button md:hidden"
                        onClick={() => setOpen((prev) => !prev)}
                    >
                        <span className="sr-only">Abrir menú</span>
                        <div className="space-y-1">
                            <span className="block h-0.5 w-5 bg-white" />
                            <span className="block h-0.5 w-5 bg-white" />
                            <span className="block h-0.5 w-5 bg-white" />
                        </div>
                    </button>

                    <button
                        type="button"
                        className="navbar-avatar"
                        onClick={() => setProfileOpen((prev) => !prev)}
                    >
                        <img
                            src={defaultAvatarUrl}
                            alt="Foto de perfil"
                            className="navbar-avatar-img"
                        />
                    </button>

                    {profileOpen && (
                        <div ref={profileMenuRef} className="navbar-profile-menu">
                            <button className="navbar-profile-item">Perfil</button>
                            <button className="navbar-profile-item">Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>

            {open && (
                <nav className="navbar-mobile-menu md:hidden">
                    <Link
                        to="/mis-cursos"
                        className={linkClasses("courses") + " w-fit"}
                        onClick={() => setOpen(false)}
                    >
                        Mis cursos
                    </Link>
                    <button className={linkClasses("chats") + " w-fit"} disabled>
                        Chats
                    </button>
                    <Link
                        to="/explorar"
                        className={linkClasses("explore") + " w-fit"}
                        onClick={() => setOpen(false)}
                    >
                        Explorar
                    </Link>
                </nav>
            )}
        </header>
    );
};

export default Navbar;
