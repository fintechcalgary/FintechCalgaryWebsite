"use client";

import { FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import ModalRoot from "./ModalRoot";
import ModalCloseButton from "./ModalCloseButton";
import Button from "@/components/ui/Button";
import { iconGlyph, modalHeader, modalPanel } from "@/lib/uiClassNames";
import { ModalTitle } from "./ModalParts";

const TYPE_STYLES = {
  danger: {
    buttonVariant: "danger",
    icon: "text-red-400",
    border: "border-red-500/30",
    Icon: FiAlertCircle,
  },
  success: {
    buttonVariant: "success",
    icon: "text-green-400",
    border: "border-green-500/30",
    Icon: FiCheckCircle,
  },
  info: {
    buttonVariant: "primary",
    iconWrap: iconGlyph,
    border: "border-primary/30",
    Icon: FiInfo,
  },
};

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
        className={`${modalPanel} max-w-md border ${typeStyles.border}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Confirm"}
      >
        <div className={`${modalHeader} !p-6`.trim()}>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <span
              className={`shrink-0 ${typeStyles.iconWrap ?? typeStyles.icon}`.trim()}
            >
              <Icon className="h-6 w-6" />
            </span>
            <ModalTitle className="!text-xl">{title}</ModalTitle>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="p-6">
          <p className="text-body-lg mb-6">
            {typeof message === "string" ? message : message}
          </p>

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
