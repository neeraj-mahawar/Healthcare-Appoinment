import React, { useState, useEffect } from "react";
import { usePatient } from "../context/PatientContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Edit3,
  Save,
  X,
  Activity,
  HeartPulse,
  Clock,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext"; // ✅ Custom toast hook

const infoItems = [
  { label: "Name", key: "name", icon: User },
  { label: "Email", key: "email", icon: Mail },
  { label: "Phone", key: "phone", icon: Phone },
  { label: "Age", key: "age", icon: Calendar },
  { label: "Gender", key: "gender", icon: Users },
];

export default function PatientProfile() {
  const { patient, updatePatient, loading } = usePatient();
  const { showToast } = useToast(); // ✅ use custom toast
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) setFormData(patient);
  }, [patient]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/patient/auth/${patient._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updatePatient(res.data);
      showToast("success", "Profile updated successfully! ✅"); // ✅ success toast
      setEditMode(false);
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        err.response?.data?.msg || "Error updating profile ❌"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 animate-pulse text-lg">
        Loading profile...
      </p>
    );
  if (!patient)
    return (
      <p className="p-6 text-center text-red-500 font-semibold">
        Patient not found
      </p>
    );

  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto space-y-12"
    >
      {/* Header */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="relative group bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_70px_rgba(0,0,0,0.2)] p-10 border-2 border-white/60 flex flex-col md:flex-row items-center gap-8 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Profile Circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 via-teal-500 to-emerald-600 flex items-center justify-center text-6xl font-extrabold text-white shadow-[0_12px_40px_rgba(34,197,94,0.4)] flex-shrink-0"
        >
          <div
            className="absolute inset-0 rounded-full bg-white/20 animate-pulse"
            style={{ animationDuration: "3s" }}
          />
          <span className="relative">{patient.name?.charAt(0) || "P"}</span>
        </motion.div>

        <div className="relative text-center md:text-left flex-1 min-w-0">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-md truncate">
            {patient.name}
          </h2>
          <p className="text-gray-700 text-xl font-bold mt-2 truncate">
            {patient.age ? `${patient.age} yrs` : "Age N/A"} •{" "}
            {patient.gender || "Gender N/A"}
          </p>
        </div>

        {/* Edit Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setEditMode(!editMode)}
          className="absolute top-6 right-6 group bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600 hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {editMode ? (
            <X size={22} className="relative" />
          ) : (
            <Edit3 size={22} className="relative" />
          )}
        </motion.button>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {infoItems.map(({ label, key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="group relative flex items-start gap-4 p-6 bg-white/90 backdrop-blur-xl border-2 border-white/60 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex-shrink-0 shadow-inner">
              <Icon size={24} className="text-green-600" />
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">
                {label}
              </p>
              {editMode && key !== "gender" ? (
                <input
                  type={key === "age" ? "number" : "text"}
                  name={key}
                  value={formData[key] || ""}
                  onChange={handleChange}
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                />
              ) : key === "gender" && editMode ? (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {genders.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, gender: g.value })
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        formData.gender === g.value
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-gray-900 font-extrabold text-lg truncate">
                  {patient[key] || "N/A"}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Health Summary
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { label: "Total Visits", value: patient.visits || 5, icon: Activity, color: "green" },
          { label: "Upcoming Appointments", value: patient.upcoming || 2, icon: Clock, color: "blue" },
          { label: "Health Score", value: "92%", icon: HeartPulse, color: "red" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className={`group relative p-8 bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-white/60 flex flex-col items-center gap-3 transform hover:-translate-y-2 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_50px_rgba(0,0,0,0.2)]`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-${color}-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <Icon className={`relative text-${color}-600`} size={38} />
            <span className="relative text-gray-500 text-sm font-bold uppercase">
              {label}
            </span>
            <span
              className={`relative text-4xl font-extrabold bg-gradient-to-r from-${color}-600 to-${color}-700 bg-clip-text text-transparent`}
            >
              {value}
            </span>
          </motion.div>
        ))}
      </div> */}

      {/* Save Button */}
      {editMode && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          disabled={saving}
          className="group relative w-full bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600 hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] text-white py-5 rounded-3xl font-extrabold text-xl shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-3">
            {saving ? "Saving..." : (<><Save size={24} /> Save Changes</>)}
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}
