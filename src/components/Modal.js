import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

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
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          button:
            "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
          icon: "text-red-400",
          iconBg: "bg-red-500/20",
          border: "border-red-500/30",
          shadow: "shadow-red-500/20",
        };
      case "success":
        return {
          button:
            "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
          icon: "text-green-400",
          iconBg: "bg-green-500/20",
          border: "border-green-500/30",
          shadow: "shadow-green-500/20",
        };
      default:
        return {
          button:
            "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90",
          icon: "text-primary",
          iconBg: "bg-primary/20",
          border: "border-primary/30",
          shadow: "shadow-primary/20",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <FiAlertCircle className="w-6 h-6" />;
      case "success":
        return <FiCheckCircle className="w-6 h-6" />;
      default:
        return <FiInfo className="w-6 h-6" />;
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={`bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border ${typeStyles.border} max-w-md w-full overflow-hidden pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800/50">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${typeStyles.iconBg} flex items-center justify-center ${typeStyles.icon}`}
                  >
                    {getIcon()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-gray-300 text-base leading-relaxed mb-6">
                  {typeof message === "string" ? <p>{message}</p> : message}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  {showCancel && (
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl transition-all duration-200 font-medium text-sm border border-gray-700/50 hover:border-gray-600/50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      {cancelText}
                    </button>
                  )}
                  <button
                    onClick={onConfirm || onClose}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-white shadow-lg ${typeStyles.button} ${typeStyles.shadow} hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
