import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Clock, PlusCircle, XCircle, CheckCircle2 } from "lucide-react";
import { usePatient } from "../context/PatientContext";
import { useToast } from "../context/ToastContext"; // ✅ Custom Toast Context

export default function MedicineForm({ onAdded }) {
  const { patient } = usePatient();
  const { showToast } = useToast(); // ✅ useToast hook
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [times, setTimes] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (success) {
      setCountdown(4);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setSuccess(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success]);

  const handleTimeChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes); // ❗ Only update – no Set() conversion
  };

  const handleAddTime = () => setTimes([...times, ""]);

  const handleRemoveTime = (index) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes.length ? newTimes : [""]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !dose || times.some((t) => !t)) {
      showToast("error", "All fields are required!");
      return;
    }
    if (!patient) return showToast("info", "Please login first!");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/medicine/add`,
        { userId: patient._id, name, dose, times, email: patient.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showToast("success", "Medicine added successfully!");
        setName("");
        setDose("");
        setTimes([""]);
        setSuccess(true);
        if (onAdded) onAdded(res.data.medicine);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        showToast("error", res.data.message || "Failed to add medicine");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="relative max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ✅ Success Animation Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center 
                       bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="text-green-600 mb-4"
            >
              <CheckCircle2 size={80} strokeWidth={1.5} />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-green-700"
            >
              Medicine Added!
            </motion.h3>

            <p className="text-gray-600 mt-2 font-medium">
              Auto-closing in {countdown} second{countdown !== 1 ? "s" : ""}...
            </p>

            {/* 🎉 Floating Confetti */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ y: [-10, 10, -10], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 300 - 150,
                    opacity: [1, 0],
                    scale: [1, 0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧾 Medicine Form */}
      <motion.form
        onSubmit={handleSubmit}
        className={`bg-gradient-to-br from-white/70 to-emerald-50/60 backdrop-blur-lg 
                   rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 border border-white/40 
                   ${success ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className="text-center mb-6">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent flex justify-center items-center gap-3">
            <Pill size={34} /> Add New Medicine
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Manage your daily prescriptions easily
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
              <Pill size={18} className="text-emerald-500" /> Medicine Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paracetamol"
              className="border border-gray-200 rounded-2xl p-4 bg-white/70 shadow-inner focus:ring-2 focus:ring-emerald-400 outline-none transition-all hover:shadow-md"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
              <Clock size={18} className="text-emerald-500" /> Dose *
            </label>
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g., 500mg"
              className="border border-gray-200 rounded-2xl p-4 bg-white/70 shadow-inner focus:ring-2 focus:ring-emerald-400 outline-none transition-all hover:shadow-md"
              required
            />
          </div>
        </div>

        {/* Times */}
        <div>
          <label className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
            <Clock size={20} className="text-emerald-500" /> Select Times *
          </label>
          {times.map((time, index) => (
            <div key={index} className="flex items-center mb-3 gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="border border-gray-200 rounded-2xl p-3 flex-1 bg-white/70 shadow-inner focus:ring-2 focus:ring-emerald-400 outline-none hover:shadow-md transition"
                required
              />
              {times.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTime(index)}
                  className="bg-red-100 text-red-500 p-2 rounded-full hover:bg-red-200 transition"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTime}
            className="mt-3 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 
                       text-white px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle size={18} /> Add Another Time
          </button>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={submitting}
          whileTap={{ scale: 0.98 }}
          animate={
            submitting
              ? {}
              : {
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    "0 0 0 rgba(0,0,0,0)",
                    "0 0 15px rgba(16, 185, 129, 0.5)",
                    "0 0 0 rgba(0,0,0,0)",
                  ],
                }
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-600 hover:to-emerald-600 
                      text-white py-4 rounded-3xl font-bold shadow-md transition-all ${
                        submitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
        >
          {submitting ? "Adding..." : "Add Medicine"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}
