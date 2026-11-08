"use client";

import ModalRoot from "./ModalRoot";
import ModalCloseButton from "./ModalCloseButton";
import { ModalTitle } from "./ModalParts";
import { modalFooter, modalHeader, modalPanel } from "@/lib/uiClassNames";

const SIZE_MAX_WIDTH = {
  sm: "max-w-md",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
};

export default function ContentModal({
  isOpen,
  onClose,
  children,
  title,
  footer,
  size,
  maxWidth,
  showCloseButton = true,
  panelClassName = "",
  bodyClassName = "",
}) {
  const widthClass =
    maxWidth || SIZE_MAX_WIDTH[size] || SIZE_MAX_WIDTH.lg;

  return (
    <ModalRoot isOpen={isOpen} onClose={onClose}>
      <div
        className={`${modalPanel} mx-auto flex max-h-[90vh] flex-col border-gray-800/50 ${widthClass} ${panelClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
      >
        {title ? (
          <div className={modalHeader}>
            <ModalTitle>{title}</ModalTitle>
            {showCloseButton ? <ModalCloseButton onClick={onClose} /> : null}
          </div>
        ) : null}
        <div
          className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`.trim()}
        >
          {children}
        </div>
        {footer ? <div className={modalFooter}>{footer}</div> : null}
      </div>
    </ModalRoot>
  );
}
