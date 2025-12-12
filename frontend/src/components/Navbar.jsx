import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = ({ currentSection, adminMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

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

  const isTutor = user?.rolCodigo === 2 || user?.rol === "docente";
  const isOnTutorPanel = location.pathname === "/panel-tutor";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  const goToProfile = () => {
    setProfileOpen(false);
    if (isTutor) {
      navigate("/tutor/perfil");
    } else {
      navigate("/perfil");
    }
  };

  const defaultAvatarUrl =
    "https://ui-avatars.com/api/?name=U&background=CBD5F5&color=1E293B";

  /* ─────────────────────────
     MODO ADMIN (solo logout)
  ────────────────────────── */
  if (adminMode) {
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="navbar-logout-btn"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
    );
  }

  /* ─────────────────────────
     MODO NORMAL (estudiante/tutor)
  ────────────────────────── */
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
            {!isTutor && (
              <>
                <Link to="/mis-cursos" className={linkClasses("courses")}>
                  Mis cursos
                </Link>
                <Link to="/chats" className={linkClasses("chats")}>
                  Chats
                </Link>
                <Link to="/explorar" className={linkClasses("explore")}>
                  Explorar
                </Link>
              </>
            )}

            {isTutor && (
              <>
                <Link to="/chats" className={linkClasses("chats")}>
                  Chats
                </Link>
                <Link to="/planes" className={linkClasses("planes")}>
                  Planes
                </Link>
              </>
            )}

            {isTutor && !isOnTutorPanel && (
              <button
                type="button"
                className={linkClasses("tutor-panel")}
                onClick={() => navigate("/panel-tutor")}
              >
                Volver al panel tutor
              </button>
            )}
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
              <button
                type="button"
                className="navbar-profile-item"
                onClick={goToProfile}
              >
                Perfil
              </button>
              <button
                type="button"
                className="navbar-profile-item"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <nav className="navbar-mobile-menu md:hidden">
          {!isTutor && (
            <>
              <Link
                to="/mis-cursos"
                className={linkClasses("courses") + " w-fit"}
                onClick={() => setOpen(false)}
              >
                Mis cursos
              </Link>
              <Link
                to="/chats"
                className={linkClasses("chats") + " w-fit"}
                onClick={() => setOpen(false)}
              >
                Chats
              </Link>
              <Link
                to="/explorar"
                className={linkClasses("explore") + " w-fit"}
                onClick={() => setOpen(false)}
              >
                Explorar
              </Link>
            </>
          )}

          {isTutor && (
            <>
              <Link
                to="/chats"
                className={linkClasses("chats") + " w-fit"}
                onClick={() => setOpen(false)}
              >
                Chats
              </Link>
              <Link
                to="/planes"
                className={linkClasses("planes") + " w-fit"}
                onClick={() => setOpen(false)}
              >
                Planes
              </Link>
            </>
          )}

          {isTutor && !isOnTutorPanel && (
            <button
              type="button"
              className={linkClasses("tutor-panel") + " w-fit"}
              onClick={() => {
                setOpen(false);
                navigate("/panel-tutor");
              }}
            >
              Volver al panel tutor
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
