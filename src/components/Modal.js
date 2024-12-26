export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default",
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          button: "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25",
          icon: "text-red-500",
        };
      case "warning":
        return {
          button:
            "bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-500/25",
          icon: "text-yellow-500",
        };
      default:
        return {
          button: "bg-primary hover:bg-primary/80 shadow-lg shadow-primary/25",
          icon: "text-primary",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900/90 p-8 shadow-xl transition-all border border-gray-700/50 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600 transition-all duration-200 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded-xl text-white transition-all duration-200 font-medium ${typeStyles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
