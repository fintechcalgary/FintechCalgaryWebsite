"use client";

import { FiX } from "react-icons/fi";
import ModalRoot from "./ModalRoot";

/**
 * Content modal with optional title — preserves the PortalModal API.
 */
export default function ContentModal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-4xl",
  showCloseButton = true,
}) {
  return (
    <ModalRoot isOpen={isOpen} onClose={onClose} usePortal>
      <div
        className={`w-full ${maxWidth} mx-auto bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-800/50 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
              {title}
            </h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:scale-110"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </ModalRoot>
  );
}
