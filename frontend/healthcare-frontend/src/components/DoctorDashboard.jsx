import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, CalendarDays, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState({
    totalPatients: 0,
    upcomingAppointments: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const doctorId = localStorage.getItem("userId");

  const fetchAppointments = async () => {
    if (!token || !doctorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/doctor/appointments/${doctorId}?all=true`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = res.data.appointments || [];
      setAppointments(data);
      computeSummary(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
      setSummary({
        totalPatients: 0,
        upcomingAppointments: 0,
        totalSessions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const computeSummary = (appointmentsArray) => {
    const patientSet = new Set();
    let upcoming = 0;
    let completed = 0;
    const now = new Date();

    appointmentsArray.forEach((appt) => {
      const patientId = appt.patient?._id || appt.patient;
      if (patientId) patientSet.add(patientId);

      if (appt.status === "completed") completed += 1;

      const apptDate = new Date(appt.datetime);
      if (appt.status === "pending" && apptDate >= now) upcoming += 1;
    });

    setSummary({
      totalPatients: patientSet.size,
      upcomingAppointments: upcoming,
      totalSessions: completed,
    });
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10 text-lg animate-pulse font-semibold">
        Loading your dashboard...
      </p>
    );

  const stats = [
    {
      label: "Total Patients",
      value: summary.totalPatients,
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
      label: "Completed Sessions",
      value: summary.totalSessions,
      icon: <Stethoscope size={40} className="text-yellow-600" />,
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
      {/* ✨ Gradient Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/40 via-blue-100/30 to-purple-100/40 pointer-events-none" />

      {/* Header */}
      <div className="relative text-center mb-12">
        <motion.h2
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg"
        >
          🩺 Doctor Dashboard
        </motion.h2>
        <p className="text-gray-600 mt-3 italic text-lg">
          “Empowering your healing journey with smart insights.” 🌿
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
            whileHover={{
              scale: 1.05,
              rotate: 0.5,
            }}
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

      {/* Auto-refresh Note */}
      <div className="text-center text-sm text-gray-600 mt-12 italic">
        ⏱️ Auto-refreshes every{" "}
        <span className="text-green-600 font-semibold">30 seconds</span> for
        live updates.
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;
