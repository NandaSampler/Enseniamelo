import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatsAPI } from "../../api/chats";
import { reservasAPI } from "../../api/reservas";
import { usuariosAPI } from "../../api/usuarios";
import { useNotification } from "../NotificationProvider";
import ReservarHorario from "./ReservarHorario";
import "../../styles/Chat/chat.css";

const ChatPage = () => {
  const navigate = useNavigate();
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
  const usuarioActualId = usuarioActual._id || usuarioActual.id; // ✅ Corregido
  const usuarioActualRol = usuarioActual.rol;
  const usuarioActualRolCodigo = usuarioActual.rolCodigo;

  const cargarDatosUsuarios = async (idsUsuarios) => {
    try {
      for (const userId of idsUsuarios) {
        if (!userId || usuariosCache[userId]) continue;

        const { data } = await usuariosAPI.getUsuario(userId);
        const usuario = data?.usuario || data;

        setUsuariosCache((prev) => ({
          ...prev,
          [userId]: {
            _id: usuario._id || usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
          },
        }));
      }
    } catch (error) {
      console.error("❌ Error cargando datos de usuarios:", error);
    }
  };

  const agruparMensajesPorFecha = (mensajes) => {
    const grupos = {};
    mensajes.forEach((mensaje) => {
      const fecha = new Date(mensaje.creado);
      const fechaKey = fecha.toDateString();
      if (!grupos[fechaKey]) {
        grupos[fechaKey] = [];
      }
      grupos[fechaKey].push(mensaje);
    });
    return grupos;
  };

  const mensajesAgrupados = agruparMensajesPorFecha(mensajes);

  const formatearSeparadorFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);

    if (fecha.toDateString() === ahora.toDateString()) {
      return "Hoy";
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return "Ayer";
    } else {
      return fecha.toLocaleDateString("es-BO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year:
          fecha.getFullYear() !== ahora.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatsAPI.getChats();
        const data = response.data;
        const chatsObtenidos = Array.isArray(data) ? data : data.chats || [];

        // ✅ Normalizar chats: SIEMPRE usar _id internamente
        const chatsNormalizados = chatsObtenidos.map((chat) => ({
          ...chat,
          _id: chat._id || chat.id,
          participantes: (chat.participantes || []).map((p) => {
            if (typeof p === "string") return p;
            if (p?.$oid) return p.$oid;
            if (p?._id) return p._id;
            if (p?.id) return p.id;
            return p;
          }),
          id_curso:
            typeof chat.id_curso === "object"
              ? {
                  ...chat.id_curso,
                  _id: chat.id_curso._id || chat.id_curso.id,
                  nombre: chat.id_curso.nombre,
                }
              : chat.id_curso,
        }));

        const chatsDelUsuario = chatsNormalizados.filter((chat) =>
          (chat.participantes || []).some((p) => {
            const participanteId = typeof p === "string" ? p : p._id || p.id;
            return String(participanteId) === String(usuarioActualId);
          })
        );
        setChats(chatsDelUsuario);

        // Extraer IDs de participantes
        const todosLosParticipantes = new Set();
        chatsDelUsuario.forEach((chat) => {
          (chat.participantes || []).forEach((p) => {
            const participanteId = typeof p === "string" ? p : p._id || p.id;
            if (participanteId && participanteId !== usuarioActualId) {
              todosLosParticipantes.add(participanteId);
            }
          });
        });

        // Cargar datos de todos los participantes
        if (todosLosParticipantes.size > 0) {
          await cargarDatosUsuarios(Array.from(todosLosParticipantes));
        }

        // ✅ Setear selectedChatId
        if (routeChatId && routeChatId !== "undefined") {
          setSelectedChatId(routeChatId);
        } else if (chatsDelUsuario.length > 0 && chatsDelUsuario[0]._id) {
          console.log("🎯 Navegando al primer chat:", chatsDelUsuario[0]._id);
          navigate(`/chats/${chatsDelUsuario[0]._id}`, { replace: true });
        }

        // ✅ Cargar reservas - USAR _id
        const reservasMap = {};
        await Promise.all(
          chatsDelUsuario.map(async (chat) => {
            const cursoId =
              typeof chat.id_curso === "object"
                ? chat.id_curso._id || chat.id_curso.id
                : chat.id_curso;

            if (!cursoId) return;

            let estudianteId = null;
            if (
              usuarioActualRolCodigo === 1 ||
              usuarioActualRol === "estudiante"
            ) {
              estudianteId = usuarioActualId;
            } else {
              const otros = (chat.participantes || []).filter((p) => {
                const pId = typeof p === "string" ? p : p._id || p.id;
                return String(pId) !== String(usuarioActualId);
              });
              if (otros[0]) {
                estudianteId =
                  typeof otros[0] === "string"
                    ? otros[0]
                    : otros[0]._id || otros[0].id;
              }
            }

            if (!estudianteId) return;

            try {
              const { data: dataReserva } =
                await reservasAPI.getEstadoReservaChat({
                  cursoId,
                  estudianteId,
                });
              if (dataReserva?.success && dataReserva.reserva) {
                reservasMap[chat._id] = dataReserva.reserva; // ✅ Usar _id
              }
            } catch (error) {
              console.error(
                "Error obteniendo estado de reserva para chat:",
                error
              );
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
  }, []); // ✅ Sin dependencias - solo cargar una vez

  const obtenerOtroUsuario = (chat) => {
    if (!chat) return null;

    const otros = (chat.participantes || []).filter((p) => {
      const pId = typeof p === "string" ? p : p._id || p.id;
      return String(pId) !== String(usuarioActualId);
    });

    if (otros.length === 0) return null;

    const otroId =
      typeof otros[0] === "string" ? otros[0] : otros[0]._id || otros[0].id;

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
    return (
      `${otroUsuario.nombre || ""} ${otroUsuario.apellido || ""}`.trim() ||
      "Usuario"
    );
  };

  // ✅ useEffect para actualizar selectedChatId cuando cambia routeChatId
  useEffect(() => {
    if (routeChatId && routeChatId !== "undefined") {
      setSelectedChatId(routeChatId);
    }
  }, [routeChatId]);

  // ✅ useEffect para cargar mensajes cuando cambia selectedChatId
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

        const mensajesNormalizados = mensajesRecibidos.map((m) => ({
          ...m,
          _id: m._id || m.id,
        }));

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
  }, [selectedChatId]);

  const manejarSeleccionChat = (chatId) => {
    if (!chatId || chatId === "undefined") {
      console.error("❌ chatId inválido");
      return;
    }
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
        contenido: contenido,
      };

      const { data } = await chatsAPI.sendMensaje(mensajeDTO);
      const mensajeNuevo = Array.isArray(data) ? data[0] : data;
      const mensajeNormalizado = {
        ...mensajeNuevo,
        _id: mensajeNuevo._id || mensajeNuevo.id,
      };

      setMensajes((prev) => [...prev, mensajeNormalizado]);
      setNuevoMensaje("");
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      showNotification({
        type: "error",
        title: "Error",
        message:
          error.response?.data?.message || "No se pudo enviar el mensaje",
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

  const chatSeleccionado = chats.find((c) => c._id === selectedChatId) || null;
  const tituloCurso = chatSeleccionado?.id_curso?.nombre || "";
  const reservaSeleccionada = chatSeleccionado
    ? reservasPorChat[chatSeleccionado._id] || null
    : null;
  const nombreOtroUsuarioHeader = chatSeleccionado
    ? obtenerNombreOtroUsuario(chatSeleccionado)
    : "";

  const obtenerLabelsTutorEstudiante = () => {
    if (!chatSeleccionado) return { tutorLabel: "", estudianteLabel: "" };
    const nombreOtro = obtenerNombreOtroUsuario(chatSeleccionado);

    if (usuarioActualRolCodigo === 2 || usuarioActualRol === "docente") {
      return {
        tutorLabel: "Tú (tutor)",
        estudianteLabel: nombreOtro,
      };
    }

    return {
      tutorLabel: nombreOtro,
      estudianteLabel: "Tú (estudiante)",
    };
  };

  const { tutorLabel, estudianteLabel } = obtenerLabelsTutorEstudiante();

  const esTutorEnChatSeleccionado = !!(
    chatSeleccionado &&
    usuarioActualId &&
    (usuarioActualRolCodigo === 2 || usuarioActualRol === "docente")
  );

  const obtenerEstudianteIdDeChat = () => {
    if (!chatSeleccionado) return null;
    const otros = (chatSeleccionado.participantes || []).filter((p) => {
      const pId = typeof p === "string" ? p : p._id || p.id;
      return String(pId) !== String(usuarioActualId);
    });
    if (otros.length === 0) return null;
    return typeof otros[0] === "string"
      ? otros[0]
      : otros[0]._id || otros[0].id;
  };

  const manejarAbrirModalReserva = () => {
    setMostrarModalReserva(true);
  };

  const manejarCerrarModalReserva = () => {
    setMostrarModalReserva(false);
  };

  const manejarAceptarReserva = async (fechaHoraReserva) => {
    if (!chatSeleccionado) return;

    const cursoId =
      typeof chatSeleccionado.id_curso === "object"
        ? chatSeleccionado.id_curso._id || chatSeleccionado.id_curso.id
        : chatSeleccionado.id_curso;
    const estudianteId = obtenerEstudianteIdDeChat();

    if (!cursoId || !estudianteId || !fechaHoraReserva) {
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
        if (data.reserva && chatSeleccionado) {
          setReservasPorChat((prev) => ({
            ...prev,
            [chatSeleccionado._id]: data.reserva,
          }));
        }
      } else {
        showNotification({
          type: "error",
          title: "Error",
          message: "No se pudo aceptar la reserva. Intenta nuevamente.",
        });
      }
    } catch (error) {
      console.error("Error aceptando reserva:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "Ocurrió un error al aceptar la reserva",
      });
    }
  };

  const manejarRechazarReserva = async () => {
    if (!chatSeleccionado) return;

    const cursoId =
      typeof chatSeleccionado.id_curso === "object"
        ? chatSeleccionado.id_curso._id || chatSeleccionado.id_curso.id
        : chatSeleccionado.id_curso;
    const estudianteId = obtenerEstudianteIdDeChat();

    if (!cursoId || !estudianteId) return;

    try {
      const { data } = await reservasAPI.rechazarReserva({
        cursoId,
        estudianteId,
      });

      if (data?.success && data.reserva) {
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
          message: "No se pudo rechazar la reserva. Intenta nuevamente.",
        });
      }
    } catch (error) {
      console.error("Error rechazando reserva:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "Ocurrió un error al rechazar la reserva",
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
            {chatsFiltrados.map((chat) => {
              const nombreOtro = obtenerNombreOtroUsuario(chat);
              const iniciales = nombreOtro
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={chat._id}
                  className={
                    "chat-item" +
                    (selectedChatId === chat._id ? " chat-item-active" : "")
                  }
                  onClick={() => manejarSeleccionChat(chat._id)}
                >
                  <div className="chat-avatar">
                    <span>{iniciales}</span>
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{nombreOtro}</div>
                    <div className="chat-course">
                      {chat.id_curso?.nombre || "Curso"}
                    </div>
                    <div className="chat-last-message">
                      {chat.ultimoMensaje || "Sin mensajes"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chat-messages">
          {chatSeleccionado && (
            <div className="chat-messages-header">
              <div className="chat-messages-header-main">
                <h2 className="chat-messages-title">
                  {nombreOtroUsuarioHeader}
                </h2>
                <p className="chat-messages-subtitle">
                  {tituloCurso || "Chat del curso"}
                </p>
                {(tutorLabel || estudianteLabel) && (
                  <p className="chat-messages-roles">
                    Tutor: {tutorLabel} · Estudiante: {estudianteLabel}
                  </p>
                )}
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
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="messages-container">
            {Object.entries(mensajesAgrupados).map(
              ([fechaKey, mensajesDelDia]) => (
                <div key={fechaKey}>
                  <div className="date-separator">
                    <span>{formatearSeparadorFecha(fechaKey)}</span>
                  </div>

                  {mensajesDelDia.map((m) => {
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
                  <div ref={messagesEndRef} />
                </div>
              )
            )}
          </div>

          {selectedChatId && (
            <div className="message-input">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !enviandoMensaje) {
                    manejarEnviarMensaje();
                  }
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
