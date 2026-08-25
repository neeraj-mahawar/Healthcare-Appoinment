import React, { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from "framer-motion";

export default function Modal({ children, onClose, isOpen = true }) {
  const y = useMotionValue(0);
  const controls = useAnimation();
  const modalRef = useRef();

  // ✅ Accessibility (ESC key to close)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // ✨ Smooth glassmorphism depth motion
  const modalAnim = {
    hidden: { opacity: 0, scale: 0.9, y: 80 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    exit: { opacity: 0, scale: 0.95, y: 50, transition: { duration: 0.25 } },
  };

  // 🌿 Mobile Swipe-to-Close (natural feel)
  const handleDragEnd = (_, info) => {
    if (info.offset.y > 120) {
      controls.start({ y: "100%", opacity: 0 });
      setTimeout(() => onClose?.(), 200);
    } else {
      controls.start({ y: 0, transition: { type: "spring", stiffness: 150 } });
    }
  };

  const blur = useTransform(y, [0, 300], ["blur(0px)", "blur(10px)"]);
  const opacity = useTransform(y, [0, 300], [1, 0.5]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex justify-center items-end md:items-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            key="modal"
            ref={modalRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            style={{ y, filter: blur, opacity }}
            onClick={(e) => e.stopPropagation()}
            onDragEnd={handleDragEnd}
            variants={modalAnim}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 130, damping: 20 }}
            className="relative w-full max-w-lg bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40 
                       shadow-[0_12px_40px_rgba(0,0,0,0.25)] overflow-hidden md:mt-0 mt-auto"
          >
            {/* 🌈 Glow effect */}
            <motion.div
              className="absolute -top-32 -left-24 w-96 h-96 bg-gradient-to-br from-emerald-400/30 via-teal-300/20 to-blue-300/30 blur-[120px] rounded-full"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            {/* ❌ Close Button */}
            <motion.button
              onClick={onClose}
              // whileHover={{ rotate: 360, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/70 shadow-md hover:bg-white hover:shadow-lg transition z-10"
            >
              <X size={20} className="text-gray-700" />
            </motion.button>

            {/* 🌤 Header Bar (Mobile drag indicator) */}
            <div className="md:hidden flex justify-center py-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>

            {/* 🌸 Modal Content */}
            <div className="relative p-6 max-h-[80vh] overflow-y-auto scrollbar-thin 
                            scrollbar-thumb-emerald-400/50 scrollbar-track-transparent">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
