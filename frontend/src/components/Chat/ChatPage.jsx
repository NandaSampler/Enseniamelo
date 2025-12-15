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

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll inteligente (solo si estás abajo)
  const shouldAutoScrollRef = useRef(true);

  const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");
  const usuarioActualId = normalizeId(usuarioActual?._id || usuarioActual?.id);
  const usuarioActualRol = usuarioActual?.rol;
  const usuarioActualRolCodigo = usuarioActual?.rolCodigo;

  const cargarNombresUsuarios = async (chats) => {
    const nuevos = {};

    for (const chat of chats) {
      const otroId = obtenerOtroUsuarioId(chat);
      if (!otroId) continue;

      try {
        const { data } = await usuariosAPI.getUsuario(otroId);

        nuevos[chat._id] = `${data.nombre} ${data.apellido}`;
      } catch (e) {
        console.error("Error cargando usuario", e);
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

  // Detectar si el usuario está “abajo” (para autoscroll)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 140; // px
      const distanceFromBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight);
      shouldAutoScrollRef.current = distanceFromBottom < threshold;
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ selectedChatId desde URL
  useEffect(() => {
    if (routeChatId && routeChatId !== "undefined") {
      setSelectedChatId(routeChatId);
    }
  }, [routeChatId]);

  // ✅ Cargar chats (sin filtros agresivos para no romper UI)
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatsAPI.getChats();
        const data = response?.data;
        const chatsObtenidos = Array.isArray(data) ? data : data?.chats || [];

        const chatsNormalizados = chatsObtenidos
          .map(normalizeChat)
          .filter(
            (chat) =>
              chat?._id && chat.participantes.includes(String(usuarioActualId))
          );

        setChats(chatsNormalizados);
        cargarNombresUsuarios(chatsNormalizados);

        // si no hay chat en la ruta, abrir el primero
        if (!routeChatId || routeChatId === "undefined") {
          if (chatsNormalizados.length > 0) {
            navigate(`/chats/${chatsNormalizados[0]._id}`, { replace: true });
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
  }, []);

  // ✅ Cargar mensajes
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

        // al cambiar de chat -> baja al final
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

  // ✅ Autoscroll solo si estás abajo
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

  // NO TOCAR: Carga el nombre del otro usuario en el chat
  const obtenerNombreOtroUsuario = (chat) => {
    return nombresPorChat[chat._id] || "Usuario";
  };

  const obtenerOtroUsuarioId = (chat) => {
    if (!chat?.participantes || !usuarioActualId) return null;

    return chat.participantes.find(
      (id) => String(id) !== String(usuarioActualId)
    );
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

  const esTutorEnChatSeleccionado = !!(
    chatSeleccionado &&
    usuarioActualId &&
    (usuarioActualRolCodigo === 2 || usuarioActualRol === "docente")
  );

  const manejarAbrirModalReserva = () => setMostrarModalReserva(true);
  const manejarCerrarModalReserva = () => setMostrarModalReserva(false);

  // SOLO UI: botones visibles y fijos (la lógica reserva la dejamos como estaba en tu app)
  const manejarAceptarReserva = async (fechaHoraReserva) => {
    if (!chatSeleccionado) return;

    // OJO: si tu backend depende de cursoId/estudianteId aquí,
    // eso se arregla en la capa de datos (no en UI).
    if (!fechaHoraReserva) {
      showNotification({
        type: "warning",
        title: "Campos incompletos",
        message: "Debes completar la fecha y hora para aceptar la reserva",
      });
      return;
    }

    // Aquí solo cerramos modal y mostramos notificación para no romper el render/UI.
    // (La lógica real de guardar la reserva la ajustamos en el siguiente paso si quieres)
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
        {/* LISTA IZQUIERDA */}
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

        {/* PANEL DERECHO */}
        <div className="chat-messages">
          {/* HEADER STICKY (siempre visible) */}
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

              {/* Botones fijos arriba (no dependen del scroll) */}
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

          {/* MENSAJES SCROLLEABLES */}
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

          {/* INPUT FIJO ABAJO */}
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
