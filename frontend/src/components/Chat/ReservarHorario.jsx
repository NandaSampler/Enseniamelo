import { useState } from "react";
import "../../styles/Chat/chat.css";

const ReservarHorario = ({ onClose, onConfirm }) => {
  const [fechaHora, setFechaHora] = useState("");

  const handleConfirm = () => {
    // 👇 Solo valida fecha. El resto (curso/estudiante) lo valida ChatPage con mensaje correcto.
    if (!fechaHora) {
      window.alert("Debes seleccionar una fecha y hora.");
      return;
    }
    onConfirm(fechaHora);
  };

  return (
    <div className="chat-modal-backdrop">
      <div className="chat-modal">
        <h3 className="chat-modal-title">Aceptar reserva</h3>
        <p className="chat-modal-text">Ingresa la fecha y hora del curso.</p>

        <input
          type="datetime-local"
          className="chat-modal-input"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
        />

        <div className="chat-modal-actions">
          <button type="button" className="chat-modal-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="chat-modal-btn-primary" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservarHorario;
