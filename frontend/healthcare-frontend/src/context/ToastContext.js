import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomToast from "../components/CustomToastView";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // ✅ Smart Toast Logic
  const showToast = (type, message) => {
    const id = Date.now();

    setToasts((prev) => {
      // Replace existing toast of same type
      const filtered = prev.filter((t) => t.type !== type);
      return [...filtered, { id, type, message }];
    });
  };

  const closeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 🎯 Toast Container */}
      <motion.div
        layout
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", stiffness: 120, damping: 14 },
              }}
              exit={{
                opacity: 0,
                y: -30,
                scale: 0.9,
                transition: { duration: 0.3 },
              }}
              style={{
                pointerEvents: "auto",
                transformOrigin: "top right",
              }}
            >
              <CustomToast {...toast} onClose={closeToast} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
