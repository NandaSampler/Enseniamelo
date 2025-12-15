import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatsAPI } from "../../api/chats";
import { usuariosAPI } from "../../api/usuarios";
import "../../styles/Chat/chat.css";
import { useNotification } from "../NotificationProvider";
import ReservarHorario from "./ReservarHorario";

const normalizeId = (x) => {
  if (!x) return null;
  if (typeof x === "string") return x;
  if (x?.$oid) return x.$oid;
  if (x?._id) return x._id;
  if (x?.id) return x.id;
  return String(x);
};

const normalizeChat = (chat) => {
  if (!chat) return null;

  const _id = normalizeId(chat?._id || chat?.id);
  const participantes = Array.isArray(chat?.participantes)
    ? chat.participantes
        .filter(Boolean)
        .map((p) => normalizeId(p))
        .filter(Boolean)
    : [];

  const rawCurso = chat?.id_curso ?? chat?.cursoId ?? chat?.idCurso ?? null;
  const id_curso =
    rawCurso && typeof rawCurso === "object"
      ? {
          ...rawCurso,
          _id: normalizeId(rawCurso?._id || rawCurso?.id),
          nombre: rawCurso?.nombre || "",
        }
      : rawCurso
      ? normalizeId(rawCurso)
      : null;

  return {
    ...chat,
    _id,
    participantes,
    id_curso,
  };
};

const normalizeMensaje = (m) => {
  if (!m) return null;
  const _id = normalizeId(m?._id || m?.id);
  return _id ? { ...m, _id } : null;
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { id: routeChatId } = useParams();
  const { showNotification } = useNotification();

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  const [busqueda, setBusqueda] = useState("");

  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [reservasPorChat, setReservasPorChat] = useState({});

  const [nombresPorChat, setNombresPorChat] = useState({});
  const [perfilTutorUsuario, setPerfilTutorUsuario] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");
  const usuarioActualId = normalizeId(usuarioActual?._id || usuarioActual?.id);
  const usuarioActualRol = usuarioActual?.rol;
  const usuarioActualRolCodigo = usuarioActual?.rolCodigo;

  const esTutor = usuarioActualRolCodigo === 2 || usuarioActualRol === "TUTOR";

  //Cargar perfil tutor si el usuario es tutor
  useEffect(() => {
    if (!esTutor || !usuarioActualId) return;

    const cargarPerfilTutor = async () => {
      try {
        const { data } = await usuariosAPI.obtenerPerfilTutorPorUsuario(
          usuarioActualId
        );
        setPerfilTutorUsuario(data);
      } catch (error) {
        console.error("Error cargando perfil tutor del usuario actual:", error);
      }
    };

    cargarPerfilTutor();
  }, [esTutor, usuarioActualId]);

  //Función para obtener id_usuario desde perfil_tutor
  const obtenerIdUsuarioDesdePerfil = async (perfilTutorId) => {
    console.log("Obteniendo id_usuario desde perfil_tutor ID:", perfilTutorId);
    try {
      const { data } = await usuariosAPI.obtenerPerfilTutor(perfilTutorId);
      return normalizeId(data?.id_usuario);
    } catch (error) {
      console.error("Error obteniendo perfil tutor:", error);
      return null;
    }
  };

  //Verificar si el chat pertenece al usuario actual
  const chatPerteneceAlUsuario = (chat) => {
    const participantes = chat.participantes;

    // Caso 1: Usuario tutor - su perfil_tutor._id está en participantes
    if (esTutor && perfilTutorUsuario) {
      const perfilTutorId = normalizeId(perfilTutorUsuario.id);
      if (participantes.includes(String(perfilTutorId))) {
        return true;
      }
    }

    // Caso 2: Usuario normal - su ID está directamente en participantes
    if (participantes.includes(String(usuarioActualId))) {
      return true;
    }

    return false;
  };

  const obtenerOtroUsuarioId = async (chat) => {
    if (!chat?.participantes || chat.participantes.length < 2) return null;

    const participantes = chat.participantes.map(String);

    let miIdEnChat = null;

    // Caso tutor
    if (esTutor && perfilTutorUsuario?.id) {
      miIdEnChat = String(perfilTutorUsuario.id);
    }
    // Caso usuario normal
    else {
      miIdEnChat = String(usuarioActualId);
    }

    const otroId = participantes.find((id) => id !== miIdEnChat);
    console.log("Otro ID en chat:", otroId);
    if (!otroId) return null;

    if (esTutor) {
      // Tutor siempre chatea con usuario
      return otroId;
    }

    // Usuario normal
    try {
      // Intentar resolver como perfil tutor
      const { data } = await usuariosAPI.obtenerPerfilTutor(otroId);
      return normalizeId(data?.idUsuario);
    } catch {
      // Si no es perfil tutor, es usuario directo
      return otroId;
    }
  };

  //Cargar nombres de usuarios (considerando tutores)
  const cargarNombresUsuarios = async (chats) => {
    const nuevos = {};

    for (const chat of chats) {
      try {
        const usuarioId = await obtenerOtroUsuarioId(chat);
        if (!usuarioId) continue;

        const { data } = await usuariosAPI.getUsuario(usuarioId);
        nuevos[chat._id] = `${data.nombre} ${data.apellido}`;
      } catch (error) {
        console.error("Error cargando usuario para chat:", chat._id, error);
        nuevos[chat._id] = "Usuario";
      }
    }

    setNombresPorChat(nuevos);
  };

  const agruparMensajesPorFecha = (mensajesList) => {
    const grupos = {};
    (mensajesList || []).forEach((mensaje) => {
      const fecha = new Date(mensaje?.creado || Date.now());
      const fechaKey = fecha.toDateString();
      if (!grupos[fechaKey]) grupos[fechaKey] = [];
      grupos[fechaKey].push(mensaje);
    });
    return grupos;
  };

  const mensajesAgrupados = useMemo(
    () => agruparMensajesPorFecha(mensajes),
    [mensajes]
  );

  const formatearSeparadorFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);

    if (fecha.toDateString() === ahora.toDateString()) return "Hoy";
    if (fecha.toDateString() === ayer.toDateString()) return "Ayer";

    return fecha.toLocaleDateString("es-BO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: fecha.getFullYear() !== ahora.getFullYear() ? "numeric" : undefined,
    });
  };

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 140;
      const distanceFromBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight);
      shouldAutoScrollRef.current = distanceFromBottom < threshold;
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (routeChatId && routeChatId !== "undefined") {
      setSelectedChatId(routeChatId);
    }
  }, [routeChatId]);

  //Cargar chats con filtrado correcto
  useEffect(() => {
    // Esperar a que se cargue el perfil tutor si el usuario es tutor
    if (esTutor && !perfilTutorUsuario) return;

    const fetchChats = async () => {
      let chatsPropios = [];
      try {
        const response = await chatsAPI.getChats();
        const data = response?.data;
        const chatsObtenidos = Array.isArray(data) ? data : data?.chats || [];

        const chatsNormalizados = chatsObtenidos
          .map(normalizeChat)
          .filter((chat) => chat?._id);

        if (usuarioActualRol == "ESTUDIANTE") {
          // Filtrar chats que pertenecen al usuario actual
          chatsPropios = chatsNormalizados.filter((chat) =>
            chatPerteneceAlUsuario(chat)
          );
          setChats(chatsPropios);
          await cargarNombresUsuarios(chatsPropios);
        } else if (usuarioActualRol == "TUTOR") {
          // Filtrar chats que pertenecen al tutor actual
          chatsPropios = chatsNormalizados.filter((chat) =>
            chatPerteneceAlUsuario(chat)
          );
          setChats(chatsPropios);
          await cargarNombresUsuarios(chatsPropios);
        }

        // Si no hay chat seleccionado, abrir el primero
        if (!routeChatId || routeChatId === "undefined") {
          if (chatsPropios.length > 0) {
            navigate(`/chats/${chatsPropios[0]._id}`, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error obteniendo chats:", error);
        showNotification({
          type: "error",
          title: "Error",
          message: "No se pudieron cargar las conversaciones",
        });
      }
    };

    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esTutor, perfilTutorUsuario, routeChatId]);

  useEffect(() => {
    if (!selectedChatId || selectedChatId === "undefined") {
      setMensajes([]);
      return;
    }

    const fetchMensajes = async () => {
      try {
        const { data } = await chatsAPI.getMensajes(selectedChatId);
        const mensajesRecibidos = Array.isArray(data)
          ? data
          : data?.mensajes || [];

        const mensajesNormalizados = (mensajesRecibidos || [])
          .filter(Boolean)
          .map(normalizeMensaje)
          .filter(Boolean);

        setMensajes(mensajesNormalizados);

        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
          shouldAutoScrollRef.current = true;
        });
      } catch (error) {
        console.error("❌ Error obteniendo mensajes:", error);
        showNotification({
          type: "error",
          title: "Error",
          message: "No se pudieron cargar los mensajes",
        });
        setMensajes([]);
      }
    };

    fetchMensajes();
  }, [selectedChatId, showNotification]);

  useEffect(() => {
    if (!mensajes || mensajes.length === 0) return;
    if (!shouldAutoScrollRef.current) return;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [mensajes]);

  const manejarSeleccionChat = (chatId) => {
    if (!chatId || chatId === "undefined") return;
    navigate(`/chats/${chatId}`);
  };

  const manejarEnviarMensaje = async () => {
    const contenido = nuevoMensaje.trim();
    if (!contenido || !selectedChatId) return;

    try {
      setEnviandoMensaje(true);

      const mensajeDTO = {
        id_chat: selectedChatId,
        remitente: usuarioActualId,
        contenido,
      };

      const { data } = await chatsAPI.sendMensaje(mensajeDTO);
      const mensajeNuevo = Array.isArray(data) ? data[0] : data;

      const mensajeNormalizado = normalizeMensaje(mensajeNuevo);
      if (mensajeNormalizado?._id) {
        setMensajes((prev) => [...prev, mensajeNormalizado]);
      }

      setNuevoMensaje("");
      shouldAutoScrollRef.current = true;
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      showNotification({
        type: "error",
        title: "Error",
        message:
          error?.response?.data?.message || "No se pudo enviar el mensaje",
      });
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const obtenerNombreOtroUsuario = (chat) => {
    return nombresPorChat[chat._id] || "Usuario";
  };

  const chatsFiltrados = chats.filter((chat) => {
    if (!busqueda.trim()) return true;
    const texto = busqueda.toLowerCase();
    const nombreOtro = obtenerNombreOtroUsuario(chat);
    return nombreOtro.toLowerCase().includes(texto);
  });

  const chatSeleccionado =
    chats.find((c) => String(c._id) === String(selectedChatId)) || null;

  const reservaSeleccionada = chatSeleccionado
    ? reservasPorChat[chatSeleccionado._id] || null
    : null;

  const esTutorEnChatSeleccionado = esTutor && chatSeleccionado;

  const manejarAbrirModalReserva = () => setMostrarModalReserva(true);
  const manejarCerrarModalReserva = () => setMostrarModalReserva(false);

  const manejarAceptarReserva = async (fechaHoraReserva) => {
    if (!chatSeleccionado) return;

    if (!fechaHoraReserva) {
      showNotification({
        type: "warning",
        title: "Campos incompletos",
        message: "Debes completar la fecha y hora para aceptar la reserva",
      });
      return;
    }

    setMostrarModalReserva(false);

    showNotification({
      type: "success",
      title: "Horario seleccionado",
      message: "Se seleccionó una fecha/hora. (UI OK)",
    });
  };

  const manejarRechazarReserva = async () => {
    showNotification({
      type: "info",
      title: "Acción",
      message: "Rechazar (UI OK)",
    });
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-list">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="chat-items">
            {chatsFiltrados.length === 0 ? (
              <div className="chat-empty">No tienes conversaciones aún.</div>
            ) : (
              chatsFiltrados.map((chat) => {
                const nombreOtro = obtenerNombreOtroUsuario(chat);
                const iniciales = "U";

                return (
                  <div
                    key={chat._id}
                    className={
                      "chat-item" +
                      (String(selectedChatId) === String(chat._id)
                        ? " chat-item-active"
                        : "")
                    }
                    onClick={() => manejarSeleccionChat(chat._id)}
                  >
                    <div className="chat-avatar">
                      <span>{iniciales}</span>
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">{nombreOtro}</div>
                      <div className="chat-course">Curso</div>
                      <div className="chat-last-message">
                        {chat.ultimoMensaje || "Sin mensajes"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="chat-messages">
          <div className="chat-messages-header">
            <div className="chat-messages-header-main">
              <div className="chat-header-left">
                <h2 className="chat-messages-title">
                  {chatSeleccionado
                    ? nombresPorChat[chatSeleccionado._id]
                    : "Selecciona un chat"}
                </h2>
                <p className="chat-messages-subtitle">
                  {chatSeleccionado ? "Chat del curso" : " "}
                </p>
              </div>

              {chatSeleccionado && (
                <div className="chat-reserva-actions">
                  {esTutorEnChatSeleccionado && (
                    <>
                      <button
                        type="button"
                        className="chat-accept-btn"
                        onClick={manejarAbrirModalReserva}
                        disabled={
                          reservaSeleccionada &&
                          ((reservaSeleccionada.estado &&
                            reservaSeleccionada.estado !== "pendiente") ||
                            reservaSeleccionada.id_horario)
                        }
                      >
                        Aceptar reserva
                      </button>

                      <button
                        type="button"
                        className="chat-reject-btn"
                        onClick={manejarRechazarReserva}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="messages-container" ref={messagesContainerRef}>
            {Object.entries(mensajesAgrupados).map(
              ([fechaKey, mensajesDelDia]) => (
                <div key={fechaKey}>
                  <div className="date-separator">
                    <span>{formatearSeparadorFecha(fechaKey)}</span>
                  </div>

                  {(mensajesDelDia || []).map((m) => {
                    const mensajeId = m._id || m.id;
                    const remitenteId =
                      typeof m.remitente === "string"
                        ? m.remitente
                        : m.remitente?._id || m.remitente?.id;

                    const esPropio =
                      String(remitenteId) === String(usuarioActualId);

                    const horaTexto = m.creado
                      ? new Date(m.creado).toLocaleTimeString("es-BO", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "";

                    return (
                      <div
                        key={mensajeId}
                        className={`message ${esPropio ? "own-message" : ""}`}
                      >
                        <div className="message-bubble">
                          <div className="message-content">{m.contenido}</div>
                          {horaTexto && (
                            <div className="message-time">{horaTexto}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedChatId && (
            <div className="message-input">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !enviandoMensaje)
                    manejarEnviarMensaje();
                }}
                disabled={enviandoMensaje}
              />
              <button
                type="button"
                className="send-btn"
                onClick={manejarEnviarMensaje}
                disabled={enviandoMensaje || !nuevoMensaje.trim()}
              >
                {enviandoMensaje ? "..." : "➤"}
              </button>
            </div>
          )}

          {mostrarModalReserva && (
            <ReservarHorario
              onClose={manejarCerrarModalReserva}
              onConfirm={manejarAceptarReserva}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
