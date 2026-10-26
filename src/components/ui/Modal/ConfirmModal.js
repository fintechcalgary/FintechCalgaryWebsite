"use client";

import { FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import ModalRoot from "./ModalRoot";
import ModalCloseButton from "./ModalCloseButton";
import Button from "@/components/ui/Button";

const TYPE_STYLES = {
  danger: {
    buttonVariant: "danger",
    icon: "text-red-400",
    iconBg: "bg-red-500/20",
    border: "border-red-500/30",
    Icon: FiAlertCircle,
  },
  success: {
    buttonVariant: "success",
    icon: "text-green-400",
    iconBg: "bg-green-500/20",
    border: "border-green-500/30",
    Icon: FiCheckCircle,
  },
  info: {
    buttonVariant: "primary",
    icon: "text-primary",
    iconBg: "bg-primary/20",
    border: "border-primary/30",
    Icon: FiInfo,
  },
};

/**
 * Confirm / alert dialog — portaled overlay used across admin delete flows.
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
  confirmDisabled = false,
}) {
  const typeStyles = TYPE_STYLES[type] || TYPE_STYLES.info;
  const Icon = typeStyles.Icon;

  return (
    <ModalRoot isOpen={isOpen} onClose={onClose}>
      <div
        className={`fc-modal-panel max-w-md border ${typeStyles.border}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Confirm"}
      >
        <div className="fc-modal-header !p-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${typeStyles.iconBg} ${typeStyles.icon}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="fc-modal-title !text-xl">{title}</h3>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="p-6">
          <div className="fc-body-lg mb-6">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>

          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            {showCancel ? (
              <Button
                variant="cancel"
                onClick={onClose}
                disabled={confirmDisabled}
                className="!flex-none"
              >
                {cancelText}
              </Button>
            ) : null}
            <Button
              variant={typeStyles.buttonVariant}
              onClick={onConfirm || onClose}
              disabled={confirmDisabled}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </ModalRoot>
  );
}
