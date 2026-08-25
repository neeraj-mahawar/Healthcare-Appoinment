import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { usePatient } from "../context/PatientContext";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import useGeminiVoiceAssistant from "./useGeminiVoiceAssistant";
import {
  User,
  Tablet,
  Clock,
  Pill,
  Phone,
  Mail,
  CalendarCheck2,
  CheckCircle2,
  Brain,
  ChevronDown,
  Sparkles,
  Stethoscope,
  Mic,
  MicOff,
} from "lucide-react";

export default function AppointmentForm({ backendUrl }) {
  const { patient } = usePatient();
  // const { startListening, stopListening, listening, speak } = useGeminiVoiceAssistant(handleAICommand);

  const { showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  // const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  // const [voiceGender, setVoiceGender] = useState("female");

  // const [aiResponse, setAiResponse] = useState("");

  const [form, setForm] = useState({
    doctor: "",
    doctorSpecialization: "",
    datetime: "",
    medicine: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const url = backendUrl || process.env.REACT_APP_BACKEND_URL;

  // 🔹 Dropdown states
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const specializations = [
    { value: "General", label: "👨‍⚕️ General Physician" },
    { value: "Cardiology", label: "❤️ Cardiology" },
    { value: "Dermatology", label: "🧴 Dermatology" },
    { value: "Dentistry", label: "🦷 Dentistry" },
    { value: "Psychology", label: "🧠 Psychology" },
    { value: "Physchologist", label: "💬 Phsychologist" },
  ];

  async function handleAICommand(cmd) {
    try {
      console.log("🎯 Voice command received:", cmd);

      const combinedMedicine = cmd.medicine && cmd.action === "book";

      // --- 📅 BOOK APPOINTMENT ---
      if (cmd.action === "book" || combinedMedicine) {
        const doctor = doctors.find((d) =>
          d.name.toLowerCase().includes(cmd.doctorName?.toLowerCase()),
        );

        if (!doctor) {
          showToast("error", `Doctor ${cmd.doctorName || ""} not found`);
          speak(`Doctor ${cmd.doctorName || ""} not found.`);
          return;
        }

        // 🧠 Handle date/time
        const today = new Date();
        let dateObj;

        if (!cmd.date || cmd.date.trim() === "") dateObj = today;
        else if (cmd.date.toLowerCase().includes("tomorrow")) {
          dateObj = new Date(today);
          dateObj.setDate(today.getDate() + 1);
        } else if (cmd.date.toLowerCase().includes("today")) {
          dateObj = today;
        } else {
          const parsed = new Date(cmd.date);
          dateObj = isNaN(parsed) ? today : parsed;
        }

        const time = cmd.time?.slice(0, 5) || "10:00";
        const formattedDate = dateObj.toISOString().split("T")[0];
        const dateTimeValue = `${formattedDate}T${time}`;

        // ✅ Update medicine field FIRST
        if (cmd.medicine) {
          setForm((prev) => ({ ...prev, medicine: cmd.medicine }));
          await new Promise((r) => setTimeout(r, 300)); // wait for update
        }

        // ✅ Now fill everything and submit
        const updatedForm = {
          ...form,
          doctor: doctor._id,
          datetime: dateTimeValue,
          medicine: cmd.medicine || form.medicine || "",
        };
        setForm(updatedForm);

        speak(
          `Filling appointment with ${cmd.doctorName} on ${formattedDate} at ${time}${
            cmd.medicine ? ` and adding medicine ${cmd.medicine}` : ""
          }`,
        );

        await new Promise((r) => setTimeout(r, 700));

        const fakeEvent = { preventDefault: () => {} };
        await handleSubmit(fakeEvent, updatedForm); // ✅ pass the new form directly

        return;
      }

      // --- 💊 MEDICINE ONLY ---
      if (cmd.action === "medicine") {
        setForm((prev) => ({ ...prev, medicine: cmd.medicine || "" }));
        showToast("success", `💊 Medicine added: ${cmd.medicine}`);
        speak(`Medicine ${cmd.medicine} added.`);
        return;
      }

      // --- ❌ CANCEL ---
      if (cmd.action === "cancel") {
        setForm({ doctor: "", datetime: "", medicine: "" });
        showToast("info", "❌ Appointment cancelled");
        speak("Your appointment has been cancelled successfully.");
        return;
      }

      // --- 👩‍⚕️ LIST DOCTORS ---
      if (cmd.action === "list") {
        const names = doctors.map((d) => d.name).join(", ");
        showToast("info", `Doctors: ${names}`);
        speak(`Available doctors are ${names}`);
        return;
      }

      showToast("warning", "🤔 I couldn’t understand your command.");
      speak("Sorry, I couldn’t understand your command.");
    } catch (err) {
      console.error("❌ Voice Command Error:", err);
      showToast("error", "Something went wrong processing your voice command");
      speak("Something went wrong while processing your command.");
    }
  }

  const {
    startListening,
    stopListening,
    listening,
    speak,
    volume,
    transcript, // from hook
    aiResponse, // from hook
    voiceGender, // from hook
    setVoiceGender, // from hook
    voiceLanguage, // optional
  } = useGeminiVoiceAssistant(handleAICommand);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🩺 Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem("token");
      if (!token) return showToast("info", "Please login first");
      try {
        const res = await axios.get(`${url}/api/doctor/auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data.doctors || []);
      } catch (err) {
        console.error(err);
        showToast("error", "Failed to load doctors");
      }
    };
    fetchDoctors();
  }, [url]);

  // 🧾 Prefill contact info
  useEffect(() => {
    if (patient) {
      setForm((prev) => ({
        ...prev,
        phone: patient.phone || "",
        email: patient.email || "",
      }));
    }
  }, [patient]);

  // 🕒 Auto-close success popup after 4s
  useEffect(() => {
    if (successData) {
      const timer = setTimeout(() => setSuccessData(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successData]);

  // 🧭 Detect payment status
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const paymentStatus = query.get("payment");
    if (paymentStatus === "success") {
      setSuccessData({
        doctor: "Your Appointment",
        specialization: "Payment Successful",
        datetime: new Date().toISOString(),
      });
      showToast("success", "✅ Payment successful! Appointment confirmed.");
    } else if (paymentStatus === "failed") {
      showToast("error", "❌ Payment failed or cancelled.");
    }
  }, [location.search]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 💳 Book appointment
  const handleSubmit = async (e, formDataOverride = null) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return showToast("info", "Please login first");

    // ✅ Pick latest form data (from AI or UI)
    const currentForm = formDataOverride || form;

    if (!currentForm.doctor || !currentForm.datetime || !currentForm.email)
      return showToast("error", "Doctor, Date & Email are required");

    if (!currentForm.medicine?.trim())
      return showToast("error", "Please enter medicine before booking");

    setSubmitting(true);
    const selectedDoctor = doctors.find((d) => d._id === currentForm.doctor);

    const payload = {
      patient: patient._id,
      doctor: currentForm.doctor,
      datetime: new Date(currentForm.datetime).toISOString(),
      email: currentForm.email.trim(),
      phone: currentForm.phone?.trim() || "",
      medicine: currentForm.medicine?.trim() || "",
    };

    try {
      const res = await axios.post(`${url}/api/appointments/book`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        showToast(
          "success",
          "✅ Appointment booked! Redirecting to payment...",
        );
        const paymentRes = await axios.post(
          `${url}/api/payments/stripe/create-session`,
          {
            amount: selectedDoctor?.consultationFee || 500,
            currency: "inr",
            userEmail: patient.email,
          },
        );

        if (paymentRes.data.url) {
          window.location.href = paymentRes.data.url;
        } else {
          showToast("error", "Payment session not created!");
        }

        // Reset form after booking
        setForm({
          doctor: "",
          doctorSpecialization: "",
          datetime: "",
          medicine: "",
          phone: patient.phone,
          email: patient.email,
        });
      } else {
        showToast("error", "Failed to book appointment");
      }
    } catch (err) {
      console.error("❌ Booking API Error:", err.response?.data || err);
      showToast("error", err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // 🤖 AI Smart Suggestion
  const getAIRecommendations = async () => {
    if (!form.datetime) return showToast("info", "Please choose a date first!");
    setAiLoading(true);
    try {
      const res = await axios.post(`${url}/api/doctor/recommend`, {
        specialty: form.doctorSpecialization || "General",
        preferredDate: form.datetime,
      });
      if (res.data.recommendations?.length > 0) {
        const aiDoctorNames = res.data.recommendations.map((r) => r.doctorName);
        setRecommendations(aiDoctorNames);
        showToast("success", "AI found suitable doctors!");
      } else {
        showToast("info", "No suitable slots found. Try another date.");
      }
    } catch (err) {
      console.error("AI Recommend Error:", err);
      showToast("error", "Failed to get AI recommendations");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <div className="relative w-full max-w-5xl mx-auto mb-10 mt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-white/20 dark:border-gray-700 shadow-[0_8px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl bg-white/10 dark:bg-gray-900/30"
        >
          {/* Border Glow */}
          <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-500 blur-[3px] opacity-70 pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between p-6 gap-6">
            {/* 🎙️ Mic Section */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                try {
                  const ctx = window.AudioContext || window.webkitAudioContext;
                  const audioCtx = new ctx();
                  if (audioCtx.state === "suspended") await audioCtx.resume();
                } catch (err) {
                  console.warn("AudioContext unlock failed:", err);
                }
                listening ? stopListening() : startListening();
              }}
              className={`relative w-20 h-20 flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
                listening
                  ? "bg-gradient-to-r from-red-500 via-pink-500 to-orange-400 border-red-300 animate-pulse shadow-[0_0_25px_rgba(255,90,90,0.6)]"
                  : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 border-green-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
              }`}
            >
              <motion.div
                animate={listening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{
                  duration: 1,
                  repeat: listening ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                {listening ? (
                  <MicOff size={35} className="text-white" />
                ) : (
                  <Mic size={35} className="text-white" />
                )}
              </motion.div>

              {listening && (
                <motion.div
                  style={{ opacity: volume, scale: 1 + volume * 0.7 }}
                  className="absolute inset-0 rounded-full bg-green-400 blur-2xl"
                />
              )}
            </motion.button>

            {/* Assistant Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Gemini Voice Assistant
              </h2>
              <p className="text-gray-800 dark:text-gray-300 text-sm mt-1">
                {listening
                  ? "🎧 Listening... please speak your command"
                  : "🗣️ Try: “Book Dr. Sharma for tomorrow at 10 AM.”"}
              </p>
            </div>

            {/* Status + Gender Toggle */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  boxShadow: listening
                    ? [
                        "0 0 0 0 rgba(34,197,94,0.7)",
                        "0 0 0 10px rgba(34,197,94,0)",
                      ]
                    : "none",
                }}
                transition={{ duration: 1.2, repeat: listening ? Infinity : 0 }}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border ${
                  listening
                    ? "border-green-500 text-green-500 bg-green-50/60"
                    : "border-gray-400 text-gray-400 bg-gray-50/40"
                }`}
              >
                {listening ? "Active" : "Idle"}
              </motion.div>
            </div>
          </div>

          {/* Transcript + Bars */}
          <AnimatePresence>
            {listening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-5"
              >
                <div className="bg-green-50/60 dark:bg-gray-800/70 border border-green-200 dark:border-green-700 rounded-2xl p-4 text-sm text-gray-800 dark:text-gray-100 shadow-inner">
                  {transcript
                    ? `“${transcript}”`
                    : "🎤 Waiting for your speech..."}
                </div>
                <div className="flex gap-1 mt-4 h-8 items-end justify-center">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        height: listening
                          ? `${Math.random() * 80 * (volume + 0.3)}%`
                          : "10%",
                      }}
                      transition={{
                        duration: 0.25 + Math.random() * 0.2,
                        repeat: listening ? Infinity : 0,
                        repeatType: "mirror",
                      }}
                      className="w-1.5 bg-gradient-to-t from-green-400 to-emerald-500 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Response */}
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="px-6 pb-5"
            >
              <div className="bg-gradient-to-r from-emerald-400/20 to-green-500/20 border border-green-400/40 rounded-2xl p-3 text-sm text-gray-800 dark:text-gray-100 italic">
                🤖 {aiResponse}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white/75 backdrop-blur-xl rounded-3xl shadow-[0_15px_60px_rgba(0,0,0,0.15)] p-10 space-y-12 border border-white/50"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-md flex items-center justify-center gap-3">
            <CalendarCheck2 size={36} className="text-green-500" /> Book New
            Appointment
          </h2>
          <p className="text-gray-600 font-medium mt-2">
            Select your doctor, schedule time, and confirm instantly!
          </p>
        </div>

        {/* 🌿 Animated Specialization Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          ref={dropdownRef}
          className="bg-white rounded-3xl p-6 shadow-[0_5px_25px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_10px_35px_rgba(34,197,94,0.18)] transition-all duration-300"
        >
          <label className="block mb-3 text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Tablet size={20} className="text-green-600" />
            Choose Specialization <span className="text-red-500">*</span>
          </label>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full flex justify-between items-center border-2 border-gray-200 rounded-2xl p-4 
            bg-gradient-to-br from-white via-green-50/10 to-gray-50 text-gray-800 font-medium 
            focus:border-green-400 focus:ring-2 focus:ring-green-300 outline-none 
            shadow-inner hover:shadow-lg transition-all duration-300"
          >
            <span>
              {form.doctorSpecialization
                ? specializations.find(
                    (s) => s.value === form.doctorSpecialization,
                  )?.label
                : "🩺 Select specialization"}
            </span>
            <ChevronDown
              className={`text-green-500 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
              size={22}
            />
          </button>

          <AnimatePresence>
            {open && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="absolute z-50 mt-2 w-[90%] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
              >
                {specializations.map((item) => (
                  <li
                    key={item.value}
                    onClick={() => {
                      setForm({ ...form, doctorSpecialization: item.value });
                      setOpen(false);
                    }}
                    className={`px-5 py-3 cursor-pointer text-gray-700 font-medium hover:bg-green-50 transition-all ${
                      form.doctorSpecialization === item.value
                        ? "bg-green-100 text-green-700"
                        : ""
                    }`}
                  >
                    {item.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
            <Sparkles size={14} className="text-green-400 animate-pulse" />
            AI will recommend the best available doctors based on your
            selection.
          </p>
        </motion.div>

        {/* 🩺 Doctor Selection */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-4 text-lg flex items-center gap-2">
            Select Doctor
            {recommendations.length > 0 && (
              <span className="text-green-600 text-sm font-medium">
                (AI Suggested Doctors Highlighted 🤖)
              </span>
            )}
          </h3>

          {form.doctorSpecialization ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {doctors
                .filter(
                  (doc) =>
                    !form.doctorSpecialization ||
                    doc.specialization === form.doctorSpecialization,
                )
                .map((doc) => {
                  const isSelected = form.doctor === doc._id;
                  const isAIRecommended = recommendations.includes(doc.name);

                  return (
                    <motion.div
                      key={doc._id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setForm({ ...form, doctor: doc._id })}
                      className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-[0_10px_40px_rgba(34,197,94,0.4)] border-2 border-green-400"
                          : isAIRecommended
                            ? "bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 shadow-md animate-pulse"
                            : "bg-white border-2 border-gray-200 hover:border-green-400 hover:shadow-lg"
                      }`}
                    >
                      {isAIRecommended && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                          🤖 AI
                        </span>
                      )}
                      <div className="flex items-center gap-4 mb-3">
                        <User
                          className={
                            isSelected ? "text-white" : "text-green-600"
                          }
                          size={28}
                        />
                        <div>
                          <h3
                            className={`font-bold text-lg ${
                              isSelected ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {doc.name}
                          </h3>
                          <p
                            className={`text-sm flex items-center gap-2 ${
                              isSelected ? "text-white/80" : "text-gray-600"
                            }`}
                          >
                            <Tablet size={14} />{" "}
                            {doc.specialization || "General"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border border-green-100 
             bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-600 text-center
             shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.15)]
             transition-all duration-500"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="bg-green-100 p-4 rounded-full shadow-inner"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-8 h-8 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4m6 6a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-medium text-gray-700"
              >
                Please select a{" "}
                <span className="text-green-600 font-semibold">
                  specialization
                </span>{" "}
                first
              </motion.p>

              <p className="text-sm text-gray-500">
                Once selected, available doctors will appear here automatically
                💚
              </p>
            </motion.div>
          )}
        </div>

        {/* 🕒 Date & Time + AI Suggestion */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <Clock size={18} /> Date & Time *
          </label>
          <div className="flex gap-3">
            <input
              type="datetime-local"
              name="datetime"
              value={form.datetime}
              onChange={handleChange}
              required
              className="border border-gray-300 flex-1 rounded-2xl p-4 focus:ring-2 focus:ring-green-400 outline-none shadow-inner hover:shadow-md transition"
            />
            <button
              type="button"
              onClick={getAIRecommendations}
              disabled={aiLoading}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all"
            >
              {aiLoading ? "Analyzing..." : "🤖 Smart Suggest"}
            </button>
          </div>
        </div>

        {/* 💊 Medicine */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <Pill size={18} /> Prescribed Medicine
          </label>
          <input
            type="text"
            name="medicine"
            placeholder="Enter prescribed medicine"
            value={form.medicine}
            onChange={handleChange}
            className="border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-green-400 outline-none shadow-inner hover:shadow-md transition"
          />
        </div>

        {/* 📞 Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
              <Phone size={18} /> Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-green-400 outline-none shadow-inner hover:shadow-md transition"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={18} /> Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-green-400 outline-none shadow-inner hover:shadow-md transition"
            />
          </div>
        </div>

        {/* ✅ Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          type="submit"
          disabled={submitting}
          className={`group relative w-full bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600 hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] text-white py-5 rounded-3xl font-extrabold text-xl shadow-lg transition-all duration-300 ${
            submitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-3">
            {submitting ? "Booking..." : "Confirm Appointment"}
          </span>
        </motion.button>
      </motion.form>

      {/* 🎉 Success Popup */}
      <AnimatePresence>
        {successData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.2)] text-center border border-white/50 max-w-md w-full"
            >
              <CheckCircle2
                size={80}
                className="text-green-500 mx-auto mb-4 drop-shadow-md"
              />
              <h3 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Appointment Confirmed!
              </h3>
              <p className="text-gray-700 font-medium mt-3">
                with{" "}
                <span className="font-semibold text-green-700">
                  {successData.doctor}
                </span>
                <br />
                <span className="text-sm text-gray-500">
                  {successData.specialization || "General Physician"}
                </span>
              </p>
              <p className="mt-4 text-gray-600 font-semibold flex justify-center items-center gap-2">
                <Clock size={18} className="text-green-600" />
                {new Date(successData.datetime).toLocaleString()}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSuccessData(null)}
                className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-green-400/40 transition"
              >
                Done
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
