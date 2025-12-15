// frontend/src/components/ConfirmModal.jsx
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: 'bg-red-100',
      icon: '❌',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      shadowColor: 'shadow-red-500/25'
    },
    warning: {
      iconBg: 'bg-amber-100',
      icon: '⚠️',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      shadowColor: 'shadow-amber-500/25'
    },
    success: {
      iconBg: 'bg-emerald-100',
      icon: '✅',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      shadowColor: 'shadow-emerald-500/25'
    },
    info: {
      iconBg: 'bg-sky-100',
      icon: 'ℹ️',
      buttonBg: 'bg-sky-600 hover:bg-sky-700',
      shadowColor: 'shadow-sky-500/25'
    }
  };

  const styles = typeStyles[type] || typeStyles.info;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      {/* Overlay con blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
          
          {/* Icono */}
          <div className={`w-14 h-14 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-4 mx-auto text-3xl`}>
            {styles.icon}
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

      <style>{`
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
      `}</style>
    </div>
  );
};

export default ConfirmModal;