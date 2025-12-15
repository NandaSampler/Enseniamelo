import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { chatsAPI } from "../../api/chats";
import { reservasAPI } from "../../api/reservas";
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

  const rawCurso = chat?.id_curso;
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

const getStoredCursoId = (chatId) => {
  if (!chatId) return null;
  return localStorage.getItem(`chatCurso:${chatId}`) || null;
};

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeChatId } = useParams();
  const { showNotification } = useNotification();

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  const [usuariosCache, setUsuariosCache] = useState({});
  const [busqueda, setBusqueda] = useState("");

  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [reservasPorChat, setReservasPorChat] = useState({});

  const messagesEndRef = useRef(null);

  const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");
  const usuarioActualId = usuarioActual?._id || usuarioActual?.id || null;
  const usuarioActualRol = usuarioActual?.rol;
  const usuarioActualRolCodigo = usuarioActual?.rolCodigo;

  // ✅ cursoId enviado desde InfoCurso por state
  const cursoIdFromNav =
    location?.state?.cursoId ? String(location.state.cursoId) : null;

  const cargarDatosUsuarios = async (idsUsuarios) => {
    try {
      for (const userId of idsUsuarios) {
        if (!userId) continue;
        if (usuariosCache[userId]) continue;

        const { data } = await usuariosAPI.getUsuario(userId);
        const usuario = data?.usuario || data;

        setUsuariosCache((prev) => ({
          ...prev,
          [userId]: {
            _id: normalizeId(usuario?._id || usuario?.id) || userId,
            nombre: usuario?.nombre || "Usuario",
            apellido: usuario?.apellido || "",
          },
        }));
      }
    } catch (error) {
      console.error("❌ Error cargando datos de usuarios:", error);
    }
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // ✅ Mantener selectedChatId sincronizado con la ruta
  useEffect(() => {
    if (routeChatId && routeChatId !== "undefined") {
      setSelectedChatId(routeChatId);

      // ✅ Si vienes por URL y hay cursoId en state, guárdalo también
      if (cursoIdFromNav) {
        localStorage.setItem(`chatCurso:${routeChatId}`, String(cursoIdFromNav));
      }
    }
  }, [routeChatId, cursoIdFromNav]);

  // ✅ Cargar chats + fallback: si entras con /chats/:id y no está en la lista -> getChat(id)
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatsAPI.getChats();
        const data = response?.data;
        const chatsObtenidos = Array.isArray(data) ? data : data?.chats || [];

        const chatsNormalizados = (chatsObtenidos || [])
          .filter(Boolean)
          .map(normalizeChat)
          .filter((c) => !!c?._id);

        setChats(chatsNormalizados);

        // ✅ Si vienes por URL con chatId y no está en la lista -> traerlo por id y agregarlo
        if (routeChatId && routeChatId !== "undefined") {
          const existe = chatsNormalizados.some(
            (c) => String(c._id) === String(routeChatId)
          );

          if (!existe) {
            try {
              const respChat = await chatsAPI.getChat(routeChatId);
              const chatData = respChat?.data?.chat || respChat?.data;
              const chatNorm = normalizeChat(chatData);

              // ✅ Si el backend devuelve id_curso null, inyecta el cursoId guardado
              const storedCurso = getStoredCursoId(routeChatId);
              if (!chatNorm?.id_curso && storedCurso) {
                chatNorm.id_curso = storedCurso;
              }

              if (chatNorm?._id) {
                setChats((prev) => {
                  const ya = prev.some((c) => String(c._id) === String(chatNorm._id));
                  return ya ? prev : [chatNorm, ...prev];
                });
              }
            } catch (e) {
              console.error("❌ No se pudo cargar el chat por ID:", e);
            }
          }
        } else {
          // ✅ Si no hay chatId en ruta, navegar al primero
          if (chatsNormalizados.length > 0 && chatsNormalizados[0]?._id) {
            navigate(`/chats/${chatsNormalizados[0]._id}`, { replace: true });
          }
        }

        // ✅ Precargar usuarios “otros” (si hay participantes)
        const todosLosParticipantes = new Set();
        chatsNormalizados.forEach((chat) => {
          (chat.participantes || []).forEach((p) => {
            if (p && usuarioActualId && String(p) !== String(usuarioActualId)) {
              todosLosParticipantes.add(p);
            }
          });
        });

        if (todosLosParticipantes.size > 0) {
          await cargarDatosUsuarios(Array.from(todosLosParticipantes));
        }

        // ✅ Reservas por chat (usa cursoId guardado si id_curso está null)
        const reservasMap = {};
        await Promise.all(
          chatsNormalizados.map(async (chat) => {
            const chatId = chat?._id;
            const storedCurso = getStoredCursoId(chatId);

            const cursoId =
              chat?.id_curso && typeof chat.id_curso === "object"
                ? chat.id_curso._id || chat.id_curso.id
                : chat?.id_curso || storedCurso;

            if (!cursoId) return;

            let estudianteId = null;
            if (usuarioActualRolCodigo === 1 || usuarioActualRol === "estudiante") {
              estudianteId = usuarioActualId;
            } else {
              const otros = (chat.participantes || []).filter(
                (p) => String(p) !== String(usuarioActualId)
              );
              estudianteId = otros?.[0] || null;
            }

            if (!estudianteId) return;

            try {
              const { data: dataReserva } =
                await reservasAPI.getEstadoReservaChat({ cursoId, estudianteId });

              if (dataReserva?.success && dataReserva?.reserva) {
                reservasMap[chatId] = dataReserva.reserva;
              }
            } catch (error) {
              console.error("Error obteniendo estado de reserva para chat:", error);
            }
          })
        );

        setReservasPorChat(reservasMap);
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

  // ✅ cargar mensajes cuando cambia selectedChatId
  useEffect(() => {
    if (!selectedChatId || selectedChatId === "undefined") {
      setMensajes([]);
      return;
    }

    const fetchMensajes = async () => {
      try {
        const { data } = await chatsAPI.getMensajes(selectedChatId);
        const mensajesRecibidos = Array.isArray(data) ? data : data?.mensajes || [];

        const mensajesNormalizados = (mensajesRecibidos || [])
          .filter(Boolean)
          .map(normalizeMensaje)
          .filter(Boolean);

        setMensajes(mensajesNormalizados);
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

  const manejarSeleccionChat = (chatId) => {
    if (!chatId || chatId === "undefined") return;
    navigate(`/chats/${chatId}`);
  };

  const obtenerOtroUsuario = (chat) => {
    if (!chat) return null;

    const otros = (chat.participantes || []).filter(
      (p) => String(p) !== String(usuarioActualId)
    );
    const otroId = otros?.[0] || null;
    if (!otroId) return null;

    return (
      usuariosCache[otroId] || {
        _id: otroId,
        nombre: "Usuario",
        apellido: "",
      }
    );
  };

  const obtenerNombreOtroUsuario = (chat) => {
    const otroUsuario = obtenerOtroUsuario(chat);
    if (!otroUsuario) return "Usuario";
    return `${otroUsuario.nombre || ""} ${otroUsuario.apellido || ""}`.trim() || "Usuario";
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
      if (mensajeNormalizado?._id) setMensajes((prev) => [...prev, mensajeNormalizado]);

      setNuevoMensaje("");
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "No se pudo enviar el mensaje",
      });
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const chatsFiltrados = chats.filter((chat) => {
    if (!busqueda.trim()) return true;
    const texto = busqueda.toLowerCase();
    const nombreOtro = obtenerNombreOtroUsuario(chat);
    return nombreOtro.toLowerCase().includes(texto);
  });

  const chatSeleccionado =
    chats.find((c) => String(c._id) === String(selectedChatId)) || null;

  // ✅ CURSO ID RESUELTO (aunque chat.id_curso sea null)
  const cursoIdResuelto = useMemo(() => {
    if (!selectedChatId) return null;

    let cid = null;

    if (chatSeleccionado?.id_curso) {
      cid =
        typeof chatSeleccionado.id_curso === "object"
          ? normalizeId(chatSeleccionado.id_curso._id || chatSeleccionado.id_curso.id)
          : normalizeId(chatSeleccionado.id_curso);
    }

    cid = cid || cursoIdFromNav || getStoredCursoId(selectedChatId) || null;
    return cid ? String(cid) : null;
  }, [chatSeleccionado, cursoIdFromNav, selectedChatId]);

  const tituloCurso =
    chatSeleccionado?.id_curso && typeof chatSeleccionado.id_curso === "object"
      ? chatSeleccionado.id_curso.nombre || ""
      : "";

  const reservaSeleccionada = chatSeleccionado
    ? reservasPorChat[chatSeleccionado._id] || null
    : null;

  const nombreOtroUsuarioHeader = chatSeleccionado
    ? obtenerNombreOtroUsuario(chatSeleccionado)
    : "";

  const esTutorEnChatSeleccionado = !!(
    chatSeleccionado &&
    usuarioActualId &&
    (usuarioActualRolCodigo === 2 || usuarioActualRol === "docente")
  );

  const obtenerEstudianteIdDeChat = () => {
    if (!chatSeleccionado) return null;
    const otros = (chatSeleccionado.participantes || []).filter(
      (p) => String(p) !== String(usuarioActualId)
    );
    return otros?.[0] || null;
  };

  const manejarAbrirModalReserva = () => setMostrarModalReserva(true);
  const manejarCerrarModalReserva = () => setMostrarModalReserva(false);

  // ✅ ACEPTAR usando cursoIdResuelto
  const manejarAceptarReserva = async (fechaHoraReserva) => {
    if (!chatSeleccionado) return;

    const cursoId = cursoIdResuelto;
    const estudianteId = obtenerEstudianteIdDeChat();

    if (!cursoId) {
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo identificar el curso para esta reserva.",
      });
      return;
    }

    if (!estudianteId) {
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo identificar al estudiante para esta reserva.",
      });
      return;
    }

    if (!fechaHoraReserva) {
      showNotification({
        type: "warning",
        title: "Campos incompletos",
        message: "Debes completar la fecha y hora para aceptar la reserva",
      });
      return;
    }

    try {
      const inicioISO = new Date(fechaHoraReserva).toISOString();
      const { data } = await reservasAPI.aceptarReserva({
        cursoId,
        estudianteId,
        inicio: inicioISO,
      });

      if (data?.success) {
        showNotification({
          type: "success",
          title: "¡Reserva aceptada!",
          message: "La reserva fue aceptada y el horario creado correctamente",
        });

        setMostrarModalReserva(false);

        if (data?.reserva && chatSeleccionado) {
          setReservasPorChat((prev) => ({
            ...prev,
            [chatSeleccionado._id]: data.reserva,
          }));
        }
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: data?.message || "No se pudo aceptar la reserva. Intenta nuevamente.",
        });
      }
    } catch (error) {
      console.error("Error aceptando reserva:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Ocurrió un error al aceptar la reserva",
      });
    }
  };

  // ✅ RECHAZAR usando cursoIdResuelto
  const manejarRechazarReserva = async () => {
    if (!chatSeleccionado) return;

    const cursoId = cursoIdResuelto;
    const estudianteId = obtenerEstudianteIdDeChat();

    if (!cursoId) {
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo identificar el curso para esta reserva.",
      });
      return;
    }

    if (!estudianteId) {
      showNotification({
        type: "error",
        title: "Error",
        message: "No se pudo identificar al estudiante para esta reserva.",
      });
      return;
    }

    try {
      const { data } = await reservasAPI.rechazarReserva({
        cursoId,
        estudianteId,
      });

      if (data?.success && data?.reserva) {
        showNotification({
          type: "info",
          title: "Reserva rechazada",
          message: "La reserva ha sido rechazada correctamente",
        });

        setReservasPorChat((prev) => ({
          ...prev,
          [chatSeleccionado._id]: data.reserva,
        }));
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: data?.message || "No se pudo rechazar la reserva. Intenta nuevamente.",
        });
      }
    } catch (error) {
      console.error("Error rechazando reserva:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Ocurrió un error al rechazar la reserva",
      });
    }
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
            {busqueda && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setBusqueda("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="chat-items">
            {chatsFiltrados.length === 0 ? (
              <div style={{ padding: 12, color: "#64748b", fontSize: 14 }}>
                No tienes conversaciones aún.
              </div>
            ) : (
              chatsFiltrados.map((chat) => {
                const nombreOtro = obtenerNombreOtroUsuario(chat);
                const iniciales = nombreOtro
                  .split(" ")
                  .map((n) => n?.[0] || "")
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                const nombreCurso =
                  chat?.id_curso && typeof chat.id_curso === "object"
                    ? chat.id_curso.nombre || "Curso"
                    : "Curso";

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
                      <span>{iniciales || "U"}</span>
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">{nombreOtro}</div>
                      <div className="chat-course">{nombreCurso}</div>
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
          {chatSeleccionado ? (
            <div className="chat-messages-header">
              <div className="chat-messages-header-main">
                <h2 className="chat-messages-title">{nombreOtroUsuarioHeader}</h2>
                <p className="chat-messages-subtitle">
                  {tituloCurso || "Chat del curso"}
                </p>

                {esTutorEnChatSeleccionado && (
                  <div className="chat-reserva-actions">
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
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: 16, color: "#64748b" }}>
              {selectedChatId
                ? "Cargando conversación..."
                : "Selecciona una conversación para comenzar."}
            </div>
          )}

          <div className="messages-container">
            {Object.entries(mensajesAgrupados).map(([fechaKey, mensajesDelDia]) => (
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

                  const esPropio = String(remitenteId) === String(usuarioActualId);

                  const horaTexto = m.creado
                    ? new Date(m.creado).toLocaleTimeString("es-BO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "";

                  return (
                    <div key={mensajeId} className={`message ${esPropio ? "own-message" : ""}`}>
                      <div className="message-bubble">
                        <div className="message-content">{m.contenido}</div>
                        {horaTexto && <div className="message-time">{horaTexto}</div>}
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            ))}
          </div>

          {selectedChatId && (
            <div className="message-input">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !enviandoMensaje) manejarEnviarMensaje();
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
