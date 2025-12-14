import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatsAPI } from "../../api/chats";
import { reservasAPI } from "../../api/reservas";
import { useNotification } from "../NotificationProvider";
import ReservarHorario from "./ReservarHorario";
import "../../styles/Chat/chat.css";

const ChatPage = () => {
  const navigate = useNavigate();
  const { id: routeChatId } = useParams();
  const { showNotification } = useNotification();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(routeChatId || null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [reservasPorChat, setReservasPorChat] = useState({});

  const usuarioActual = JSON.parse(localStorage.getItem("user") || "{}");
  const usuarioActualId = usuarioActual._id || usuarioActual.id;
  const usuarioActualRol = usuarioActual.rol;
  const usuarioActualRolCodigo = usuarioActual.rolCodigo;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatsAPI.getChats();
        const data = response.data;
        const chatsObtenidos = Array.isArray(data) ? data : data.chats || [];

        const chatsDelUsuario = chatsObtenidos.filter(chat =>
          (chat.participantes || []).some(p => String(p) === String(usuarioActualId))
        );

        setChats(chatsDelUsuario);

        // Setear selectedChatId
        if (routeChatId) {
          // Si viene de la URL
          setSelectedChatId(routeChatId);
        } else if (chatsDelUsuario.length > 0) {
          // Si no hay routeChatId, tomar el primero
          setSelectedChatId(chatsDelUsuario[0]._id);
        }

        // Cargar reservas por chat (igual que antes)
        const reservasMap = {};
        await Promise.all(
          chatsObtenidos.map(async chat => {
            if (!chat.id_curso?._id) return;

            let estudianteId = null;
            if (usuarioActualRolCodigo === 1 || usuarioActualRol === "estudiante") {
              estudianteId = usuarioActualId;
            } else {
              const otros = (chat.participantes || []).filter(
                p => String(p._id) !== String(usuarioActualId)
              );
              if (otros[0]) estudianteId = otros[0]._id;
            }

            if (!estudianteId) return;

            try {
              const { data: dataReserva } = await reservasAPI.getEstadoReservaChat({
                cursoId: chat.id_curso._id,
                estudianteId,
              });
              if (dataReserva?.success && dataReserva.reserva) {
                reservasMap[chat._id] = dataReserva.reserva;
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
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar las conversaciones'
        });
      }
    };

    fetchChats();
  }, [routeChatId]);


  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0]._id);
    }
  }, [chats, selectedChatId]);

  useEffect(() => {

    if (!selectedChatId) return;

    const fetchMensajes = async () => {
      try {
        const { data } = await chatsAPI.getMensajes(selectedChatId);
        if (data?.success) {
          setMensajes(data.mensajes || []);
        } else {
          setMensajes([]);
        }
      } catch (error) {
        console.error("Error obteniendo mensajes:", error);
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar los mensajes'
        });
        setMensajes([]);
      }
    };

    fetchMensajes();
  }, [selectedChatId]);

  useEffect(() => {
    if (routeChatId) {
      setSelectedChatId(routeChatId);
    }
  }, [routeChatId]);

  const manejarSeleccionChat = (chatId) => {
    setSelectedChatId(chatId);
    navigate(`/chats/${chatId}`);
  };

  const manejarEnviarMensaje = async () => {
    const contenido = nuevoMensaje.trim();
    if (!contenido || !selectedChatId) return;

    try {
      const { data } = await chatsAPI.sendMensaje(selectedChatId, contenido);
      if (data?.success && data.mensaje) {
        setMensajes((prev) => [...prev, data.mensaje]);
        setNuevoMensaje("");
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo enviar el mensaje'
      });
    }
  };

  const chatsFiltrados = chats.filter((chat) => {
    if (!busqueda.trim()) return true;
    const texto = busqueda.toLowerCase();
    const otros = (chat.participantes || []).filter(
      (p) => p._id !== usuarioActualId
    );
    const nombreOtro =
      otros[0] && (otros[0].nombre || "") + " " + (otros[0].apellido || "");
    return nombreOtro.toLowerCase().includes(texto);
  });

  const chatSeleccionado = chats.find((c) => c._id === selectedChatId) || null;
  const tituloCurso = chatSeleccionado?.id_curso?.nombre || "";
  const reservaSeleccionada = chatSeleccionado
    ? reservasPorChat[chatSeleccionado._id] || null
    : null;

  const obtenerLabelsTutorEstudiante = () => {
    if (!chatSeleccionado) return { tutorLabel: "", estudianteLabel: "" };

    const participantes = chatSeleccionado.participantes || [];
    const otro = participantes.find(
      (p) => String(p._id) !== String(usuarioActualId)
    );
    const nombreOtro = otro
      ? `${otro.nombre || ""} ${otro.apellido || ""}`.trim() || "Usuario"
      : "Usuario";

    if (usuarioActualRolCodigo === 2 || usuarioActualRol === "docente") {
      return {
        tutorLabel: "Tú (tutor)",
        estudianteLabel: nombreOtro || "Estudiante",
      };
    }

    return {
      tutorLabel: nombreOtro || "Tutor",
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
    const participanteEstudiante = (chatSeleccionado.participantes || []).find(
      (p) => String(p._id) !== String(usuarioActualId)
    );
    return participanteEstudiante ? participanteEstudiante._id : null;
  };

  const manejarAbrirModalReserva = () => {
    setMostrarModalReserva(true);
  };

  const manejarCerrarModalReserva = () => {
    setMostrarModalReserva(false);
  };

  const manejarAceptarReserva = async (fechaHoraReserva) => {
    if (!chatSeleccionado) return;

    const cursoId = chatSeleccionado.id_curso?._id;
    const estudianteId = obtenerEstudianteIdDeChat();

    if (!cursoId || !estudianteId || !fechaHoraReserva) {
      showNotification({
        type: 'warning',
        title: 'Campos incompletos',
        message: 'Debes completar la fecha y hora para aceptar la reserva'
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
          type: 'success',
          title: '¡Reserva aceptada!',
          message: 'La reserva fue aceptada y el horario creado correctamente'
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
          type: 'error',
          title: 'Error',
          message: 'No se pudo aceptar la reserva. Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error("Error aceptando reserva:", error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al aceptar la reserva'
      });
    }
  };

  const manejarRechazarReserva = async () => {
    if (!chatSeleccionado) return;

    const cursoId = chatSeleccionado.id_curso?._id;
    const estudianteId = obtenerEstudianteIdDeChat();

    if (!cursoId || !estudianteId) return;

    try {
      const { data } = await reservasAPI.rechazarReserva({
        cursoId,
        estudianteId,
      });

      if (data?.success && data.reserva) {
        showNotification({
          type: 'info',
          title: 'Reserva rechazada',
          message: 'La reserva ha sido rechazada correctamente'
        });
        setReservasPorChat((prev) => ({
          ...prev,
          [chatSeleccionado._id]: data.reserva,
        }));
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo rechazar la reserva. Intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error("Error rechazando reserva:", error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al rechazar la reserva'
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
              placeholder="Nombre a buscar"
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
              const otros = (chat.participantes || []).filter(
                (p) => p._id !== usuarioActual._id
              );
              const otro = otros[0];
              const nombreOtro = otro
                ? `${otro.nombre || ""} ${otro.apellido || ""}`.trim()
                : "Contacto";

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
                    <span>{nombreOtro.charAt(0) || "?"}</span>
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">
                      {chat.id_curso?.nombre || nombreOtro}
                    </div>
                    <div className="chat-last-message">
                      {chat.ultimoMensaje || nombreOtro}
                    </div>
                    <div className="chat-course">
                      {reservasPorChat[chat._id]?.estado
                        ? `Reserva: ${reservasPorChat[chat._id].estado}`
                        : "Sin reserva"}
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
                  {tituloCurso || "Chat del curso"}
                </h2>
                {(tutorLabel || estudianteLabel) && (
                  <p className="chat-messages-subtitle">
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
                        ((
                          reservaSeleccionada.estado &&
                          reservaSeleccionada.estado !== "pendiente"
                        ) || reservaSeleccionada.id_horario)
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
            {mensajes.map((m) => {
              const remitenteId = m.remitente?._id || m.remitente;
              const esPropio = String(m.remitente) === String(chatSeleccionado.participantes[0]);
              const horaTexto = m.creado
                ? new Date(m.creado).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <div
                  key={m._id}
                  className={"message" + (esPropio ? " own-message" : "")}
                >
                  <div className="message-bubble">
                    <div>{m.contenido}</div>
                    {m.creado && (
                      <div className="message-time">
                        {new Date(m.creado).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedChatId && (
            <div className="message-input">
              <input
                type="text"
                placeholder="Escribe un mensaje"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") manejarEnviarMensaje();
                }}
              />
              <button
                type="button"
                className="send-btn"
                onClick={manejarEnviarMensaje}
              >
                ➤
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