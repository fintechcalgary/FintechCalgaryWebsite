"use client";

import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import ModalRoot from "./ModalRoot";
import Button from "@/components/ui/Button";

function getTypeStyles(type) {
  switch (type) {
    case "danger":
      return {
        buttonVariant: "danger",
        icon: "text-red-400",
        iconBg: "bg-red-500/20",
        border: "border-red-500/30",
      };
    case "success":
      return {
        buttonVariant: "success",
        icon: "text-green-400",
        iconBg: "bg-green-500/20",
        border: "border-green-500/30",
      };
    default:
      return {
        buttonVariant: "primary",
        icon: "text-primary",
        iconBg: "bg-primary/20",
        border: "border-primary/30",
      };
  }
}

function TypeIcon({ type }) {
  switch (type) {
    case "danger":
      return <FiAlertCircle className="w-6 h-6" />;
    case "success":
      return <FiCheckCircle className="w-6 h-6" />;
    default:
      return <FiInfo className="w-6 h-6" />;
  }
}

/**
 * Confirm/alert dialog — preserves the original Modal.js API.
 */
export default function ConfirmModal({
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
  const typeStyles = getTypeStyles(type);

  return (
    <ModalRoot
      isOpen={isOpen}
      onClose={onClose}
      usePortal={false}
      backdropClassName="bg-black/60 backdrop-blur-xl z-40"
      containerClassName="z-50"
    >
      <div
        className={`bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border ${typeStyles.border} max-w-md w-full overflow-hidden pointer-events-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full ${typeStyles.iconBg} flex items-center justify-center ${typeStyles.icon}`}
            >
              <TypeIcon type={type} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-gray-300 text-base leading-relaxed mb-6">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {showCancel && (
              <Button variant="secondary" onClick={onClose}>
                {cancelText}
              </Button>
            )}
            <Button
              variant={typeStyles.buttonVariant}
              onClick={onConfirm || onClose}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </ModalRoot>
  );
}
