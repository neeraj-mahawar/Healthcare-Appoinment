import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, CalendarDays, Pill } from "lucide-react";
import { motion } from "framer-motion";
import MedicineForm from "./MedicineForm";
import MedicineList from "./MedicineList";

const PatientDashboardTab = ({ patient }) => {
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [summary, setSummary] = useState({
    totalDoctors: 0,
    upcomingAppointments: 0,
    totalMedicines: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const fetchData = async () => {
    if (!patient?._id) return;

    setLoading(true);
    try {
      // Fetch appointments
      const apptRes = await axios.get(
        `${backendUrl}/api/patients/${patient._id}/appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const appts = apptRes.data?.appointments || [];

      // Fetch medicines
      const medRes = await axios.get(`${backendUrl}/api/medicine/${patient._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meds = medRes.data?.medicines || [];

      setAppointments(appts);
      setMedicines(meds);

      const doctorSet = new Set();
      let upcoming = 0;
      const now = new Date();

      appts.forEach((a) => {
        const docId = a.doctor?._id || a.doctor;
        if (docId) doctorSet.add(docId);
        const date = new Date(a.date);
        if (a.status === "pending" && date >= now) upcoming += 1;
      });

      setSummary({
        totalDoctors: doctorSet.size,
        upcomingAppointments: upcoming,
        totalMedicines: meds.length,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patient]);

  const handleMedicineAdded = (newMed) => {
    setMedicines((prev) => [...prev, newMed]);
    setSummary((prev) => ({ ...prev, totalMedicines: prev.totalMedicines + 1 }));
  };

  const handleMarkTaken = async (uniqueId, medId) => {
    try {
      await axios.put(
        `${backendUrl}/api/medicine/${medId}/taken`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      console.error("Error marking medicine as taken:", err);
    }
  };

  if (!patient) return <p className="p-6 text-red-500">Patient not found</p>;

  const stats = [
    {
      label: "Total Doctors",
      value: summary.totalDoctors,
      icon: <Users size={40} className="text-blue-600" />,
      gradient: "from-blue-500/10 via-indigo-500/10 to-blue-500/10",
      iconBg: "from-blue-100 to-indigo-100",
      text: "from-blue-600 via-indigo-600 to-purple-600",
      glow: "shadow-[0_10px_40px_rgba(59,130,246,0.4)]",
    },
    {
      label: "Upcoming Appointments",
      value: summary.upcomingAppointments,
      icon: <CalendarDays size={40} className="text-green-600" />,
      gradient: "from-green-500/10 via-emerald-400/10 to-green-500/10",
      iconBg: "from-green-100 to-emerald-100",
      text: "from-green-600 via-emerald-600 to-teal-600",
      glow: "shadow-[0_10px_40px_rgba(34,197,94,0.4)]",
    },
    {
      label: "Medicines",
      value: summary.totalMedicines,
      icon: <Pill size={40} className="text-yellow-600" />,
      gradient: "from-yellow-500/10 via-amber-400/10 to-yellow-500/10",
      iconBg: "from-yellow-100 to-amber-100",
      text: "from-yellow-600 via-amber-600 to-orange-600",
      glow: "shadow-[0_10px_40px_rgba(234,179,8,0.4)]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative max-w-7xl mx-auto p-8 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.1)] overflow-hidden"
    >
      {/* ✨ Gradient BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/40 via-blue-100/30 to-purple-100/40 pointer-events-none" />

      {/* Header */}
      <div className="relative text-center mb-12">
        <motion.h2
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg"
        >
          👩‍⚕️ Patient Dashboard
        </motion.h2>
        <p className="text-gray-600 mt-3 italic text-lg">
          “Stay informed, stay healthy — your care at a glance.” 💚
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative z-10">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, rotate: 0.5 }}
            className={`group relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 flex flex-col items-center gap-5 transition-all duration-300 hover:-translate-y-2 ${item.glow}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`relative p-5 bg-gradient-to-br ${item.iconBg} rounded-2xl shadow-inner`}
            >
              {item.icon}
            </motion.div>
            <span className="relative text-gray-600 uppercase text-sm font-semibold tracking-wider">
              {item.label}
            </span>
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className={`relative text-5xl font-extrabold bg-gradient-to-r ${item.text} bg-clip-text text-transparent`}
            >
              {item.value}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Appointments */}
      <div className="relative mt-16">
        <h3 className="text-3xl font-bold text-green-700 mb-6 text-center">
          📅 Upcoming Appointments
        </h3>
        {loading ? (
          <p className="text-center text-gray-500">Loading your appointments...</p>
        ) : appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appt) => (
              <motion.li
                key={appt._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_50px_rgba(34,197,94,0.2)] transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div>
                      <span className="text-gray-400 font-medium">Doctor:</span>
                      <p className="text-gray-900 font-semibold">{appt.doctor?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Date:</span>
                      <p className="text-gray-900 font-semibold">
                        {new Date(appt.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Status:</span>
                      <p
                        className={`font-semibold ${
                          appt.status === "completed"
                            ? "text-green-600"
                            : appt.status === "cancelled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {appt.status}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No appointments yet.</p>
        )}
      </div>

      {/* Medicines */}
      <div className="relative mt-16">
        <h3 className="text-3xl font-bold text-green-700 mb-6 text-center">
          💊 My Medicines
        </h3>
        <MedicineForm userId={patient._id} onAdded={handleMedicineAdded} />
        <MedicineList medicines={medicines} markAsTaken={handleMarkTaken} />
      </div>

      {/* Auto refresh info */}
      <div className="text-center text-sm text-gray-600 mt-12 italic">
        🔄 Updates automatically every few moments for your convenience.
      </div>
    </motion.div>
  );
};

export default PatientDashboardTab;
