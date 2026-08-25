import React, { useEffect, useState } from "react";
import axios from "axios";
import { usePatient } from "../context/PatientContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar,
  Bell,
  Pill,
  Video,
  User,
  LogOut,
  ClipboardPlus,
  FileText,
} from "lucide-react";

import PatientProfile from "./PatientProfile";
import AppointmentForm from "./AppointmentForm";
import AppointmentList from "./AppointmentList";
import ReminderDashboard from "./ReminderDashboard";
import MedicineDashboard from "./MedicineDashboard";
import VideoCall from "./VideoCall";
import AIHealthReportSummarizer from "../components/AIHealthReportSummarizer";

const PatientLayout = () => {
  const { patient, loading } = usePatient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const navigate = useNavigate();
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const tab = searchParams.get("tab") || "profile";

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // ---------------- Fetch Appointments ----------------
  const fetchAppointments = async () => {
    if (!patient?._id) return;

    setLoadingAppointments(true);

    try {
      const res = await axios.get(
        `${backendUrl}/api/patient/auth/${patient._id}/appointments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.appointments || [];

      const now = new Date();
      const upcoming = data
        .filter((a) => a.datetime && new Date(a.datetime) > now)
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

      setAppointments(upcoming);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (patient?._id) fetchAppointments();
  }, [patient?._id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const tabAnimation = {
    initial: { opacity: 0, y: 15, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -15, filter: "blur(8px)" },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: <User size={17} /> },
    {
      key: "book-appointment",
      label: "Book Appointments",
      icon: <ClipboardPlus size={16} />,
    },
    { key: "my-bookings", label: "Bookings", icon: <Calendar size={17} /> },
    { key: "my-medicines", label: "Medicines", icon: <Pill size={17} /> },
    { key: "my-reminders", label: "Reminders", icon: <Bell size={17} /> },
    { key: "video-call", label: "Video Call", icon: <Video size={17} /> },
    { key: "ai-report", label: "AI Summary", icon: <FileText size={17} /> },
  ];

  // ---------------- NEW BEAUTIFUL LOADING SCREEN ----------------
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-white"
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
            className="
              w-20 h-20 rounded-full border-4 
              border-green-500 border-t-transparent
              shadow-xl
            "
          ></motion.div>

          <div className="mt-6 text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Verifying Patient Account…
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
  }

  // ---------------- FIX: Prevent loader flickering ----------------
  if (!patient) {
    return null;
  }

  return (
    <div
      className={`flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-white`}
    >
      {/* ---------------- Sidebar ---------------- */}
      <aside
        className="
        w-64 fixed left-0 top-0 bottom-0 z-20 
        bg-white/60 backdrop-blur-2xl border-r border-white/30 
        shadow-2xl p-6 flex flex-col justify-between
      "
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-8"
          >
            <div
              className="
            w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 
            text-white rounded-2xl flex items-center justify-center shadow-lg
          "
            >
              <User size={30} />
            </div>
          </motion.div>

          <h2
            className="
          text-xl font-extrabold text-center 
          bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent 
          mb-5
        "
          >
            Patient Portal
          </h2>

          <nav className="flex flex-col gap-3">
            {tabs.map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleTabChange(t.key)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  tab === t.key
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                    : "bg-white/50 text-gray-700 hover:bg-green-50 border border-white/40"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="
          w-full bg-gradient-to-r from-red-500 to-red-600 
          text-white py-3 rounded-2xl font-semibold 
          flex items-center justify-center gap-2 
          shadow-lg shadow-red-400/30 
          mt-14
        "
        >
          <LogOut size={17} />
          Logout
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="
        relative mb-8 bg-white/60 backdrop-blur-2xl 
        border border-white/30 shadow-xl p-8 rounded-3xl
      "
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="
            text-4xl font-extrabold 
            bg-gradient-to-r from-blue-500 via-green-600 to-teal-600 
            bg-clip-text text-transparent
          "
              >
                {getGreeting()}, {patient?.name?.split(" ")[0] || "User"} 👋
              </h1>
              <p className="text-gray-600 mt-2 italic">
                “Your health journey begins with one positive step.” 🌿
              </p>
            </div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="
          h-20 w-20 bg-gradient-to-br from-blue-400 via-green-500 to-teal-500 
          text-white font-extrabold text-2xl rounded-full flex items-center justify-center 
          border-4 border-white/50 shadow-lg
        "
            >
              {patient?.name
                ?.trim()
                .split(" ")
                .slice(0, 2)
                .map((w) => w.charAt(0).toUpperCase())
                .join("")}
            </motion.div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <div
          className="
        relative bg-white/70 backdrop-blur-2xl border border-white/30 
        rounded-3xl shadow-2xl p-8 min-h-[600px]
      "
        >
          <AnimatePresence mode="wait">
            {tab === "profile" && (
              <motion.div key="profile" {...tabAnimation}>
                <PatientProfile />
              </motion.div>
            )}

            {tab === "book-appointment" && (
              <motion.div key="book-appointment" {...tabAnimation}>
                <AppointmentForm backendUrl={backendUrl} />
              </motion.div>
            )}

            {tab === "my-bookings" && (
              <motion.div key="my-bookings" {...tabAnimation}>
                <AppointmentList
                  appointments={appointments}
                  loading={loadingAppointments}
                />
              </motion.div>
            )}

            {tab === "my-medicines" && (
              <motion.div key="my-medicines" {...tabAnimation}>
                <MedicineDashboard patient={patient} />
              </motion.div>
            )}

            {tab === "my-reminders" && (
              <motion.div key="my-reminders" {...tabAnimation}>
                <ReminderDashboard patient={patient} />
              </motion.div>
            )}

            {tab === "video-call" && (
              <motion.div key="video-call" {...tabAnimation}>
                <VideoCall />
              </motion.div>
            )}

            {tab === "ai-report" && (
              <motion.div key="ai-report" {...tabAnimation}>
                <AIHealthReportSummarizer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;
