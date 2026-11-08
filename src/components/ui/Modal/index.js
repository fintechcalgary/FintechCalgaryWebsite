export { default as ModalRoot } from "./ModalRoot";
export { default as ModalCloseButton } from "./ModalCloseButton";
export { default as ConfirmModal } from "./ConfirmModal";
export { default as ContentModal } from "./ContentModal";
export { default as DashboardModal } from "./DashboardModal";
export { default as BleedModal, BleedModalHeader } from "./BleedModal";
export {
  ModalPanel,
  ModalBleedPanel,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalSectionLabel,
  ModalAside,
  ModalCallout,
  ModalFileButton,
} from "./ModalParts";

// Default export preserves historical `import Modal from "@/components/ui/Modal/ConfirmModal"` usage
export { default } from "./ConfirmModal";
