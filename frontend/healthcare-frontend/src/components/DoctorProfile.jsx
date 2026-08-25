import React, { useState, useEffect } from "react";
import { useDoctor } from "../context/DoctorContext";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Tablet,
  Award,
  CheckCircle,
  Clock,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext"; // ✅ Custom Toast

const infoItems = [
  { label: "Name", key: "name", icon: User },
  { label: "Email", key: "email", icon: Mail },
  { label: "Phone", key: "phone", icon: Phone },
  { label: "Specialization", key: "specialization", icon: Tablet },
  { label: "Experience (Years)", key: "experience", icon: Award },
];

export default function DoctorProfile() {
  const { doctor, loading } = useDoctor();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast(); // ✅ custom toast hook

  useEffect(() => {
    if (!doctor?._id) return;
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}//appointments/${doctor._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data.success) {
          setAppointments(res.data.appointments || []);
        } else {
          showToast("error", "Failed to load appointments");
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
        showToast("error", "Error loading appointments");
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, [doctor?._id, showToast]);

  useEffect(() => {
    if (doctor) setFormData(doctor);
  }, [doctor]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}//account/${doctor._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        showToast("success", "Profile updated successfully!");
        setEditMode(false);
      } else {
        showToast("error", "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 animate-pulse text-lg font-semibold">
        Loading profile...
      </p>
    );

  if (!doctor)
    return (
      <p className="p-6 text-center text-red-500 font-semibold">
        Doctor not found
      </p>
    );

  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const pending = appointments.filter((a) => a.status === "pending").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto space-y-12"
    >
      {/* Header Section */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="relative group bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_70px_rgba(0,0,0,0.2)] p-10 border-2 border-white/60 flex flex-col md:flex-row items-center gap-8 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Profile Circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 flex items-center justify-center text-6xl font-extrabold text-white shadow-[0_12px_40px_rgba(59,130,246,0.4)] flex-shrink-0"
        >
          <div
            className="absolute inset-0 rounded-full bg-white/20 animate-pulse"
            style={{ animationDuration: "3s" }}
          />
          <span className="relative">{doctor.name?.charAt(0) || "D"}</span>
        </motion.div>

        <div className="relative text-center md:text-left flex-1 min-w-0">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md truncate">
            {doctor.name}
          </h2>
          <p className="text-gray-700 text-xl font-bold mt-2 truncate">
            {doctor.specialization || "Specialization N/A"}
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mt-2 font-semibold">
            <Award size={20} className="text-yellow-500" />{" "}
            {doctor.experience || "N/A"} years Experience
          </p>
        </div>

        {/* Edit Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setEditMode(!editMode)}
          className="absolute top-6 right-6 group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex-shrink-0 shadow-inner">
              <Icon size={24} className="text-blue-600" />
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">
                {label}
              </p>
              {editMode ? (
                <input
                  type="text"
                  name={key}
                  value={formData[key] || ""}
                  onChange={handleChange}
                  className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                />
              ) : (
                <p className="mt-2 text-gray-900 font-extrabold text-lg truncate">
                  {doctor[key] || "N/A"}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          {
            label: "Total Appointments",
            value: total,
            color: "blue",
            icon: CheckCircle,
          },
          {
            label: "Completed",
            value: completed,
            color: "green",
            icon: CheckCircle,
          },
          {
            label: "Pending",
            value: pending,
            color: "yellow",
            icon: Clock,
          },
        ].map(({ label, value, color, icon: Icon }, i) => (
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
              {loadingAppointments ? "..." : value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      {editMode && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          disabled={saving}
          className="group relative w-full bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] text-white py-5 rounded-3xl font-extrabold text-xl shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-3">
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save size={24} /> Save Changes
              </>
            )}
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}
