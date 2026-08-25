import React, { useEffect, useState } from "react";
import axios from "axios";
import MedicineForm from "./MedicineForm";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Clock, Pill, Activity } from "lucide-react";
import { useToast } from "../context/ToastContext"; // ✅ Added custom toast import

export default function MedicineDashboard({ patient }) {
  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [takenToday, setTakenToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const { showToast } = useToast(); // ✅ Initialize toast

  const fetchMedicines = async () => {
    if (!patient?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/medicine/user/${patient._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMedicines(res.data.medicines || []);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      showToast("error", "Failed to fetch medicines"); // ✅ replaced
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    if (!patient?._id) return;
    try {
      const res = await axios.get(
        `${backendUrl}/api/reminders/${patient._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const pending = res.data?.pending || [];
      const completed = res.data?.completed || [];
      setReminders(pending);
      setTakenToday(completed.length);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      showToast("error", "Failed to fetch reminders"); // ✅ replaced
      setReminders([]);
    }
  };

  useEffect(() => {
    if (patient?._id) {
      fetchMedicines();
      fetchReminders();
    }
  }, [patient]);

  const handleMedicineAdded = (newMed) => {
    setMedicines((prev) => [...prev, newMed]);
    fetchReminders();
    showToast("success", "New medicine added successfully!"); // ✅ Added toast
  };

  const handleMarkTaken = async (medId) => {
    try {
      const reminder = reminders.find(
        (r) => r.medicineId === medId || r.medicine === medId,
      );
      if (reminder?._id) {
        await axios.put(
          `${backendUrl}/api/reminders/${reminder._id}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setReminders((prev) =>
          prev.filter((r) => r._id !== reminder._id && r.medicineId !== medId),
        );
      }
      showToast("success", "Marked as taken successfully"); // ✅ replaced
      setTimeout(() => {
        fetchMedicines();
        fetchReminders();
      }, 800);
    } catch (err) {
      console.error("Error marking as taken:", err);
      showToast("error", "Failed to mark as taken"); // ✅ replaced
    }
  };

  const medicinesWithNextDose = medicines.map((med) => {
    const nextReminder = reminders.find(
      (r) => r.medicineId === med._id || r.medicine === med._id,
    );
    const nextDose =
      nextReminder?.reminderTime ||
      nextReminder?.time ||
      nextReminder?.scheduledAt ||
      nextReminder?.date ||
      null;
    return { ...med, nextDose };
  });

  const totalMedicines = medicines.length || 1;
  const progress = Math.min((takenToday / totalMedicines) * 100, 100);

  function AnimatedCounter({ value }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.floor(latest));

    useEffect(() => {
      const animation = animate(count, value, {
        duration: 1.2,
        ease: "easeOut",
      });
      return animation.stop;
    }, [value]);

    return <motion.span>{rounded}</motion.span>;
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-6">
      {/* ✅ Medicine Form */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {patient?._id && (
          <MedicineForm userId={patient._id} onAdded={handleMedicineAdded} />
        )}
      </motion.div>

      {/* 🌤️ Today Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-gradient-to-br from-white/70 to-emerald-50/50 backdrop-blur-md border border-emerald-100 rounded-3xl p-6 shadow-lg"
      >
        {/* 🧪 Total Medicines */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 border border-emerald-100 shadow-sm"
        >
          <span className="text-emerald-600 font-bold text-2xl">
            <AnimatedCounter value={medicines.length} />
          </span>
          <p className="text-gray-600 text-sm font-medium mt-1">
            Total Medicines
          </p>
        </motion.div>

        {/* ✅ Taken Today */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
        >
          <span className="font-bold text-2xl">
            <AnimatedCounter value={takenToday} />
          </span>
          <p className="text-sm font-medium mt-1">Taken Today</p>
        </motion.div>

        {/* 🕒 Remaining */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 border border-emerald-100 shadow-sm"
        >
          <span className="text-emerald-600 font-bold text-2xl">
            <AnimatedCounter
              value={Math.max(medicines.length - takenToday, 0)}
            />
          </span>
          <p className="text-gray-600 text-sm font-medium mt-1">
            Remaining Today
          </p>
        </motion.div>
      </motion.div>

      {/* 🟩 Daily Progress
      <motion.div
        className="bg-gradient-to-br from-emerald-100/60 to-white/60 backdrop-blur-md border border-emerald-100 rounded-3xl p-6 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Activity size={18} /> Today’s Progress
          </div>
          <span className="text-emerald-700 font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-emerald-200/40 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div> */}

      {/* 💊 Medicines Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <p className="text-gray-500 text-center text-lg">
            Loading medicines...
          </p>
        ) : medicinesWithNextDose.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center">
            <Pill className="mx-auto text-green-600 mb-3" size={40} />
            <p className="text-gray-600 font-medium text-lg">
              No medicines added yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {medicinesWithNextDose.map((med, idx) => (
              <motion.div
                key={med._id || idx}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px rgba(16,185,129,0.3)",
                }}
                className="relative bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-md border border-emerald-100 p-6 rounded-3xl shadow-lg flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4 bg-emerald-100 p-2 rounded-full">
                  <Pill size={18} className="text-emerald-600" />
                </div>

                <div className="mb-4 space-y-2">
                  <p className="font-bold text-green-700 text-lg font-poppins">
                    {med.name || med.title}{" "}
                    <span className="text-gray-500 text-sm font-medium">
                      ({med.dose})
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <Clock size={14} className="text-emerald-600" />
                    <span className="font-medium">Next Dose:</span>{" "}
                    {med.nextDose
                      ? new Date(med.nextDose).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not scheduled"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    <span className="font-medium">Times:</span>{" "}
                    {med.times?.join(", ") || "N/A"}
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMarkTaken(med._id)}
                  className="mt-auto bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Mark as Taken
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 🕒 Upcoming Timeline */}
      {reminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-white/80 backdrop-blur-xl border border-emerald-200/70 
               rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h3 className="text-xl font-extrabold text-emerald-700 flex items-center gap-2">
              <Clock size={20} className="text-emerald-600" /> Upcoming Doses
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold shadow-sm">
              {reminders.length} Reminder{reminders.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-300/50 scrollbar-track-transparent">
            {reminders.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-center justify-between bg-gradient-to-r from-emerald-50/90 to-white/80 
                     border border-emerald-100/70 rounded-2xl p-4 shadow-sm hover:shadow-md 
                     hover:-translate-y-[2px] transition-all duration-300"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 to-green-500"></div>

                <div className="ml-4">
                  <p className="text-gray-800 font-semibold tracking-tight">
                    {r.medicineName}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {r.medicineDose ? `Dose: ${r.medicineDose}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-emerald-600 opacity-80" />
                  <span className="text-emerald-700 text-sm font-bold bg-emerald-100 px-3 py-1 rounded-full shadow-inner">
                    {new Date(r.reminderTime || r.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
