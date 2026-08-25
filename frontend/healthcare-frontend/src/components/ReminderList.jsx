import React, { useEffect, useState } from "react";
import { Check, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReminderList({
  reminders = [],
  loading = false,
  onMarkAsTaken,
}) {
  const [now, setNow] = useState(new Date());

  // 🕒 Update every 60s
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ⏳ Loading
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-lg p-6 rounded-3xl shadow-lg text-center text-gray-400 animate-pulse font-poppins">
        Loading reminders...
      </div>
    );
  }

  // 🚫 No Reminders
  if (!reminders.length) {
    return (
      <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg text-center text-gray-400 font-poppins">
        <p>No reminders found.</p>
      </div>
    );
  }

  // ⏰ Countdown Formatter
  const formatCountdown = (reminderTime) => {
    if (!reminderTime) return "No time set";
    const diff = reminderTime - now;
    if (diff <= 0) return "Now!";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours > 0 ? hours + "h " : ""}${minutes}m remaining`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-poppins">
      <AnimatePresence>
        {reminders.map((reminder, idx) => {
          const reminderTime = reminder.time
            ? new Date(reminder.time)
            : reminder.reminderTime
              ? new Date(reminder.reminderTime)
              : reminder.scheduledAt
                ? new Date(reminder.scheduledAt)
                : null;

          const isCompleted =
            reminder.completed || reminder.status === "completed";
          const overdue = reminderTime && !isCompleted && reminderTime < now;

          const progress =
            reminderTime && !isCompleted
              ? Math.max(
                  0,
                  Math.min(
                    100,
                    100 - ((reminderTime - now) / (1000 * 60 * 60 * 24)) * 100,
                  ),
                )
              : 0;

          const initials = (reminder.title || "M")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          // 🎨 Dynamic colors
          const stateColor = isCompleted ? "emerald" : overdue ? "red" : "blue";

          const gradientBg = isCompleted
            ? "from-emerald-50 to-green-100"
            : overdue
              ? "from-red-50 to-rose-100"
              : "from-blue-50 to-cyan-100";

          return (
            <motion.div
              key={reminder._id || idx}
              layout
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-3xl border-2 shadow-md transition-all 
                          hover:-translate-y-1 hover:shadow-2xl 
                          bg-gradient-to-br ${gradientBg} border-${stateColor}-300`}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-5">
                {/* 🧬 Left Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`flex items-center justify-center w-14 h-14 rounded-full 
                                bg-gradient-to-br from-${stateColor}-200 to-${stateColor}-400 
                                text-${stateColor}-900 font-bold text-lg shadow-inner`}
                  >
                    {initials}
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-900 tracking-tight">
                      {reminder.title || "Medicine"}
                    </p>
                    <p className="text-sm text-gray-700">
                      💊 Dose: {reminder.dose || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Clock size={14} />
                      {reminderTime
                        ? reminderTime.toLocaleString()
                        : "Time not set"}
                    </p>

                    {/* Countdown */}
                    {!isCompleted && reminderTime && (
                      <motion.p
                        key={formatCountdown(reminderTime)}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className={`text-xs font-semibold ${
                          overdue
                            ? "text-red-600"
                            : formatCountdown(reminderTime) === "Now!"
                              ? "text-emerald-600 animate-pulse"
                              : "text-blue-700"
                        }`}
                      >
                        ⏱ {formatCountdown(reminderTime)}
                      </motion.p>
                    )}

                    {/* Taken info */}
                    {isCompleted && reminder.takenAt && (
                      <p className="text-xs text-green-700 font-medium">
                        ✅ Taken at:{" "}
                        {new Date(reminder.takenAt).toLocaleTimeString()}
                      </p>
                    )}

                    {/* Progress bar */}
                    {!isCompleted && reminderTime && (
                      <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6 }}
                          className={`h-2 rounded-full ${
                            overdue ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        ></motion.div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ⚙️ Right Actions */}
                <div className="flex flex-col md:flex-row items-center gap-3">
                  {!isCompleted && onMarkAsTaken && (
                    <button
                      onClick={() => onMarkAsTaken(reminder._id)}
                      className={`px-5 py-2.5 rounded-2xl text-white font-semibold shadow-md 
                        transition transform hover:scale-[1.03]
                        ${
                          overdue
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                      Mark as Taken
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                      <Check size={16} /> Completed
                    </div>
                  )}

                  {overdue && !isCompleted && (
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                      <X size={16} /> Missed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
