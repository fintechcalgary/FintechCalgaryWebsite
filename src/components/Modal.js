export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  type = "info",
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          button: "bg-red-500 hover:bg-red-600",
          icon: "text-red-500",
        };
      case "success":
        return {
          button: "bg-green-500 hover:bg-green-600",
          icon: "text-green-500",
        };
      default:
        return {
          button: "bg-primary hover:bg-primary/80",
          icon: "text-primary",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-xl max-w-md w-full border border-gray-700/50">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
            <div className="text-gray-300 text-base">
              {typeof message === "string" ? <p>{message}</p> : message}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {showCancel && (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium text-sm focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 min-w-[120px]"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm || onClose}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm text-white min-w-[120px]
                ${typeStyles.button}
                focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                ${
                  type === "danger"
                    ? "focus:ring-red-500"
                    : "focus:ring-primary"
                }
                shadow-lg ${
                  type === "danger" ? "shadow-red-500/20" : "shadow-primary/20"
                }
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
