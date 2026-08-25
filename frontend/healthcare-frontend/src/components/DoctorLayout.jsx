// DoctorLayout.jsx
import React, { useEffect, useState } from "react";
import { useDoctor } from "../context/DoctorContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  User,
  LogOut,
} from "lucide-react";

import DoctorProfile from "./DoctorProfile";
import DoctorDashboard from "./DoctorDashboard";
import DoctorAppointments from "./DoctorAppointments";
import DoctorSessions from "./DoctorSessions";

// ---------------- Loading Screen ----------------
const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-white"
  >
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-10 rounded-3xl bg-white/60 backdrop-blur-3xl shadow-2xl border border-white/40 flex flex-col items-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent shadow-xl"
      ></motion.div>

      <div className="mt-6 text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        Loading Doctor Dashboard…
      </div>

      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-gray-600 mt-2"
      >
        Please wait a moment
      </motion.p>
    </motion.div>
  </motion.div>
);

const DoctorLayout = () => {
  const { doctor, loading } = useDoctor();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const tab = searchParams.get("tab") || "profile";

  const handleTabChange = (newTab) => setSearchParams({ tab: newTab });
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
  }, [modalOpen]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const tabAnimation = {
    initial: { opacity: 0, y: 15, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -15, filter: "blur(10px)" },
    transition: { duration: 0.35, ease: "easeOut" },
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: <User size={18} /> },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      key: "appointments",
      label: "Appointments",
      icon: <CalendarDays size={18} />,
    },
    { key: "sessions", label: "My Sessions", icon: <Stethoscope size={18} /> },
  ];

  if (loading) return <LoadingScreen />;
  if (!doctor)
    return <p className="p-6 text-center text-red-500">Doctor not logged in</p>;

  return (
    <div className="flex min-h-screen relative bg-gradient-to-br from-green-50 via-blue-50 to-white overflow-hidden">
      {/* Floating Orbs */}
      <motion.div
        className="absolute -top-32 -left-24 w-[500px] h-[500px] bg-green-400/30 blur-[160px] rounded-full"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-blue-300/30 blur-[150px] rounded-full"
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-72 h-screen bg-white/70 backdrop-blur-2xl border-r border-white/30 shadow-2xl flex flex-col fixed left-0 top-0 z-20">
        <div className="flex-1 overflow-y-auto p-6 pr-3 custom-scroll">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
              <Stethoscope size={32} />
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-center mb-10 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Doctor Portal
          </h2>

          {/* Navigation Buttons */}
          <nav className="flex flex-col gap-3">
            {tabs.map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleTabChange(t.key)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 ${
                  tab === t.key
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                    : "bg-white/50 text-gray-800 border border-white/30 hover:bg-green-50"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-white/20 bg-white/50 backdrop-blur-xl">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-400/30"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="ml-72 flex-1 p-10 relative z-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 bg-white/60 backdrop-blur-2xl border border-white/30 shadow-xl p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                {getGreeting()},{" "}
                {doctor?.name?.startsWith("Dr.")
                  ? doctor.name
                  : `Dr. ${doctor?.name?.split(" ")[0]}`}{" "}
                👋
              </h1>
              <p className="text-gray-600 mt-2 italic">
                “Healing is an art. Compassion is your brush.” 🩺
              </p>
              <p className="text-sm text-green-600 font-semibold mt-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </p>
            </div>

            {/* Initial Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-20 w-20 bg-gradient-to-br from-green-400 via-blue-500 to-teal-500 text-white font-extrabold text-2xl rounded-full flex items-center justify-center border-4 border-white/50 shadow-lg"
            >
              {doctor?.name
                ?.replace(/^Dr\.?\s*/i, "")
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0].toUpperCase())
                .join("")}
            </motion.div>
          </div>
        </motion.div>

        {/* Dynamic Tab Content */}
        <div className="relative bg-white/70 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 min-h-[600px]">
          <AnimatePresence mode="wait">
            {tab === "profile" && (
              <motion.div key="profile" {...tabAnimation}>
                <DoctorProfile />
              </motion.div>
            )}
            {tab === "dashboard" && (
              <motion.div key="dashboard" {...tabAnimation}>
                <DoctorDashboard />
              </motion.div>
            )}
            {tab === "appointments" && (
              <motion.div key="appointments" {...tabAnimation}>
                <DoctorAppointments setModalOpen={setModalOpen} />
              </motion.div>
            )}
            {tab === "sessions" && (
              <motion.div key="sessions" {...tabAnimation}>
                <DoctorSessions />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DoctorLayout;
