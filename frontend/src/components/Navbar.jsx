import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ currentSection, adminMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    "px-3 py-2 rounded-full cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-sky-500 text-white font-medium " +
    (currentSection === section
      ? "bg-gradient-to-r from-indigo-600 to-sky-600 shadow-lg"
      : "");

  const isTutor = user?.rolCodigo === 2 || user?.rol === "TUTOR";
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

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-sky-900/95 shadow-lg backdrop-blur-md" : "bg-sky-800"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white text-lg font-bold transition-transform duration-300 hover:scale-110 shadow-md">
            E
          </div>
          <span className="hidden sm:inline text-white font-semibold text-lg tracking-tight">
            Enseñamelo
          </span>
        </div>

        {/* Links + avatar */}
        <div className="flex items-center gap-3 relative">
          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-3">
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
                className={linkClasses("tutor-panel")}
                onClick={() => navigate("/panel-tutor")}
              >
                Volver al panel tutor
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-white/50 text-white hover:bg-white/10 transition-all duration-300"
            onClick={() => setOpen((prev) => !prev)}
          >
            <div className="space-y-1">
              <span className="block h-0.5 w-5 bg-white rounded-full transition-all duration-300" />
              <span className="block h-0.5 w-5 bg-white rounded-full transition-all duration-300" />
              <span className="block h-0.5 w-5 bg-white rounded-full transition-all duration-300" />
            </div>
          </button>

          {/* Avatar */}
          <button
            type="button"
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/70 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-sky-500 hover:scale-105 transition-transform duration-300"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <img
              src={defaultAvatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Profile menu */}
          {profileOpen && (
            <div
              ref={profileMenuRef}
              className="absolute top-full right-0 mt-2 w-44 bg-sky-700 text-white rounded-lg shadow-xl border border-white/20 py-2 flex flex-col gap-1 animate-slide-down"
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-sky-600 rounded-md transition-colors"
                onClick={goToProfile}
              >
                Perfil
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-sky-600 rounded-md transition-colors"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden px-4 py-3 flex flex-col gap-2 bg-sky-800 border-t border-white/20 animate-slide-down">
          {!isTutor && (
            <>
              <Link
                to="/mis-cursos"
                className={linkClasses("courses")}
                onClick={() => setOpen(false)}
              >
                Mis cursos
              </Link>
              <Link
                to="/chats"
                className={linkClasses("chats")}
                onClick={() => setOpen(false)}
              >
                Chats
              </Link>
              <Link
                to="/explorar"
                className={linkClasses("explore")}
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
                className={linkClasses("chats")}
                onClick={() => setOpen(false)}
              >
                Chats
              </Link>
              <Link
                to="/planes"
                className={linkClasses("planes")}
                onClick={() => setOpen(false)}
              >
                Planes
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
