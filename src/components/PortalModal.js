"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function PortalModal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-4xl",
  showCloseButton = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-[999998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[999999] p-4 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-full ${maxWidth} mx-auto bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-800/50 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
                    {title}
                  </h2>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:scale-110"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-900/50 scrollbar-thumb-gray-500/50 hover:scrollbar-thumb-gray-400/80">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
