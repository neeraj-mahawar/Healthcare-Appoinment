import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlarmClock } from "lucide-react";
import ReminderList from "./ReminderList";
import { useToast } from "../context/ToastContext";

export default function ReminderDashboard({ patient }) {
  const [pendingReminders, setPendingReminders] = useState([]);
  const [completedReminders, setCompletedReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextReminder, setNextReminder] = useState(null);
  const [countdown, setCountdown] = useState("");

  const { showToast } = useToast();

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const userId = patient?._id;

  // ---------------- Fetch Reminders ----------------
  const fetchReminders = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const res = await axios.get(`${backendUrl}/api/reminders/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pending = res.data.pending || [];
      const completed = res.data.completed || [];

      const sortedPending = [...pending].sort(
        (a, b) => new Date(a.time) - new Date(b.time)
      );

      setPendingReminders(sortedPending);
      setCompletedReminders(completed);
      setNextReminder(sortedPending[0] || null);

      showToast("success", "Reminders loaded successfully!");
    } catch (err) {
      console.error("❌ Failed to fetch reminders:", err);
      showToast("error", "Failed to load reminders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchReminders();
  }, [userId]);

  // ---------------- Countdown Timer ----------------
  useEffect(() => {
    if (!nextReminder) {
      setCountdown("");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const reminderTime = new Date(nextReminder.time);
      const diff = reminderTime - now;

      if (diff <= 0) {
        setCountdown("Now!");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [nextReminder]);

  // ---------------- Mark Reminder as Taken ----------------
  const markAsTaken = async (reminderId) => {
    const reminder = pendingReminders.find((r) => r._id === reminderId);
    if (!reminder) return showToast("error", "Reminder not found!");

    const takenAt = new Date().toISOString();

    // Optimistic UI
    const updatedPending = pendingReminders.filter((r) => r._id !== reminderId);
    const updatedCompleted = [
      { ...reminder, completed: true, takenAt },
      ...completedReminders,
    ];

    setPendingReminders(updatedPending);
    setCompletedReminders(updatedCompleted);

    if (updatedPending.length > 0) {
      const sorted = [...updatedPending].sort(
        (a, b) => new Date(a.time) - new Date(b.time)
      );
      setNextReminder(sorted[0]);
    } else {
      setNextReminder(null);
    }

    showToast("success", "Reminder marked as taken! ✅");

    // API
    try {
      await axios.put(
        `${backendUrl}/api/reminders/${reminderId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        err.response?.data?.message || "Could not update the reminder."
      );

      // Revert UI
      setCompletedReminders((prev) =>
        prev.filter((r) => r._id !== reminderId)
      );
      setPendingReminders((prev) => [reminder, ...prev]);
      setNextReminder(reminder);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-6xl mx-auto px-4 space-y-10 pb-20">
      <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-green-500 via-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight drop-shadow-md">
        💊 Medication Reminders
      </h2>

      {/* 🌟 Next Reminder */}
      <AnimatePresence mode="wait">
        {nextReminder && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35 }}
            className="relative bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-3xl 
                       shadow-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-5 bg-emerald-100 rounded-full shadow-inner">
                <AlarmClock className="text-emerald-600" size={44} />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {nextReminder.title || "Upcoming Dose"}
                </h3>
                <p className="text-gray-600 font-medium">
                  Dose: {nextReminder.dose || "N/A"} |{" "}
                  {new Date(nextReminder.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="text-right">
              <motion.p
                key={countdown}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-extrabold text-emerald-600"
              >
                {countdown}
              </motion.p>

              <button
                onClick={() => markAsTaken(nextReminder._id)}
                className="mt-3 px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-semibold 
                           hover:bg-emerald-700 shadow-md hover:shadow-lg transition transform hover:scale-[1.03]"
              >
                Mark as Taken
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <SummaryCard
          icon={<Bell className="text-amber-500" size={42} />}
          title="Pending"
          value={pendingReminders.length}
          gradient="from-amber-500 to-yellow-500"
        />
        <SummaryCard
          icon={<CheckCircle className="text-green-600" size={42} />}
          title="Completed"
          value={completedReminders.length}
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* 📋 Reminder Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ReminderSection
          title="🔔 Pending Reminders"
          color="text-amber-600"
          reminders={pendingReminders}
          loading={loading}
          onMarkAsTaken={markAsTaken}
        />
        <ReminderSection
          title="✅ Completed Reminders"
          color="text-green-600"
          reminders={completedReminders}
          loading={loading}
        />
      </div>
    </div>
  );
}

// ---------------- Subcomponents ----------------

const SummaryCard = ({ icon, title, value, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="relative bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-gray-200 flex flex-col items-center gap-4 transition-all duration-300"
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient}/10 rounded-3xl opacity-0 hover:opacity-100 transition-opacity`}
    />
    <div className="relative p-4 bg-gray-50 rounded-full shadow-inner">
      {icon}
    </div>
    <span className="relative text-gray-500 uppercase text-sm font-bold tracking-wider">
      {title}
    </span>
    <span
      className={`relative text-5xl font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
    >
      {value}
    </span>
  </motion.div>
);

const ReminderSection = ({
  title,
  color,
  reminders,
  loading,
  onMarkAsTaken,
}) => (
  <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-gray-100">
    <h3 className={`text-2xl font-extrabold ${color} text-center mb-6`}>
      {title}
    </h3>

    <ReminderList
      reminders={reminders}
      loading={loading}
      onMarkAsTaken={onMarkAsTaken}
    />
  </div>
);
