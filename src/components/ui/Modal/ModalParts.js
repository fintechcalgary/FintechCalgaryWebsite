import {
  modalAside,
  modalBody,
  modalCallout,
  modalFileButton,
  modalFooter,
  modalHeader,
  modalPanel,
  modalPanelBleed,
} from "@/lib/uiClassNames";

export function ModalPanel({ className = "", children, ...props }) {
  return (
    <div className={`${modalPanel} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ModalBleedPanel({ className = "", children, ...props }) {
  return (
    <div className={`${modalPanel} ${modalPanelBleed} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ModalHeader({ className = "", children, ...props }) {
  return (
    <div className={`${modalHeader} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ModalTitle({ className = "", children, ...props }) {
  return (
    <h2 className={`modal-title ${className}`.trim()} {...props}>
      {children}
    </h2>
  );
}

export function ModalBody({ className = "", children, ...props }) {
  return (
    <div className={`${modalBody} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ className = "", children, ...props }) {
  return (
    <div className={`${modalFooter} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ModalSectionLabel({ className = "", children, ...props }) {
  return (
    <p className={`eyebrow ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function ModalAside({ className = "", children, ...props }) {
  return (
    <aside className={`${modalAside} ${className}`.trim()} {...props}>
      {children}
    </aside>
  );
}

export function ModalCallout({ className = "", children, ...props }) {
  return (
    <div className={`${modalCallout} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function ModalFileButton({ className = "", children, ...props }) {
  return (
    <label className={`${modalFileButton} ${className}`.trim()} {...props}>
      {children}
    </label>
  );
}
