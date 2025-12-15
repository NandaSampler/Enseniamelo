// frontend/src/components/ConfirmModal.jsx
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      shadowColor: 'shadow-red-500/25'
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      shadowColor: 'shadow-amber-500/25'
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      shadowColor: 'shadow-blue-500/25'
    }
  };

  const styles = typeStyles[type] || typeStyles.danger;

  // Cerrar con tecla Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay con blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Icono */}
          <div className={`w-14 h-14 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
            {type === 'danger' ? (
              <Trash2 className={`w-7 h-7 ${styles.iconColor}`} />
            ) : (
              <AlertTriangle className={`w-7 h-7 ${styles.iconColor}`} />
            )}
          </div>
          
          {/* Título */}
          <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
            {title}
          </h3>
          
          {/* Mensaje */}
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Separador */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Footer con botones */}
        <div className="px-6 py-4 bg-slate-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl ${styles.buttonBg} text-white font-semibold text-sm shadow-lg ${styles.shadowColor} transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;