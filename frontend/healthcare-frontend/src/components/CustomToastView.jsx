import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomToast({ id, type = "info", message, onClose }) {
  const [progress, setProgress] = useState(100);

  const icons = {
    success: (
      <motion.div
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100/70 text-green-600 shadow-inner shadow-green-300"
      >
        <CheckCircle2 size={22} />
      </motion.div>
    ),
    error: (
      <motion.div
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100/70 text-red-600 shadow-inner shadow-red-300"
      >
        <XCircle size={22} />
      </motion.div>
    ),
    info: (
      <motion.div
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100/70 text-blue-600 shadow-inner shadow-blue-300"
      >
        <Info size={22} />
      </motion.div>
    ),
  };

 useEffect(() => {
  const DURATION = 2000; // 🕓 Toast stays 7 seconds total
  const INTERVAL = 70;   // Progress bar update every 70 ms
  const STEP = 100 / (DURATION / INTERVAL);

  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed += INTERVAL;
    setProgress((p) => Math.max(100 - (elapsed / DURATION) * 100, 0));
  }, INTERVAL);

  const timer = setTimeout(() => {
    clearInterval(interval);
    onClose(id);
  }, DURATION);

  return () => {
    clearTimeout(timer);
    clearInterval(interval);
  };
}, [id, onClose]);


  const styles = {
    success:
      "from-green-500/80 via-emerald-500/80 to-teal-500/90 border-green-400/60 shadow-green-500/30",
    error:
      "from-red-500/80 via-pink-500/80 to-rose-500/90 border-red-400/60 shadow-red-500/30",
    info:
      "from-blue-500/80 via-indigo-500/80 to-cyan-500/90 border-blue-400/60 shadow-blue-500/30",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -40, scale: 0.95, filter: "blur(8px)" }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{ opacity: 0, y: -40, scale: 0.9, filter: "blur(6px)" }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className={`relative flex items-start gap-3 p-4 sm:p-5 rounded-2xl border 
        shadow-xl bg-gradient-to-br ${styles[type]} 
        text-white backdrop-blur-xl w-[340px] sm:w-[380px] overflow-hidden`}
    >
      {/* Subtle glowing animated background */}
      <div className="absolute inset-0 bg-white/10 blur-3xl animate-pulse opacity-30" />

      {/* Icon */}
      <div className="z-10">{icons[type]}</div>

      {/* Message + Progress */}
      <div className="flex-1 z-10">
        <p className="text-sm sm:text-base font-semibold leading-snug drop-shadow-sm">
          {message}
        </p>

        <motion.div
          className="w-full h-1 mt-3 bg-white/30 rounded-full overflow-hidden"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="h-full bg-white/80" />
        </motion.div>
      </div>

      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onClose(id)}
        className="z-10 ml-2 text-white/80 hover:text-white transition text-lg leading-none"
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
