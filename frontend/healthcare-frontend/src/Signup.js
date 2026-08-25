import React, { useState } from "react";
import axios from "axios";
import { Outlet, useNavigate, Link } from "react-router-dom";
import {
  UserCircle2,
  Mail,
  Lock,
  Phone,
  Calendar,
  Briefcase,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "./context/ToastContext"; // ✅ Custom Toast Context

/* 🌿 AuthLayout + Signup Combined */
export default function Signup() {
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    age: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast(); // ✅ Destructure custom toast function

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        role === "doctor"
          ? `${process.env.REACT_APP_BACKEND_URL}/api/doctor/register`
          : `${process.env.REACT_APP_BACKEND_URL}/api/patient/auth/register`;

      const payload =
        role === "doctor"
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              specialization: form.specialization,
              experience: form.experience,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              age: form.age,
              gender: form.gender,
            };

      const res = await axios.post(endpoint, payload);
      showToast(
        "success",
        res.data.msg || "✅ Signup successful! Please login.",
      );
      navigate("/login");
    } catch (err) {
      showToast("error", err.response?.data?.msg || "❌ Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/60 backdrop-blur-lg border border-white/50 rounded-2xl px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-600 shadow-inner hover:shadow-md hover:border-green-300 transition-all duration-300";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-blue-100 font-inter overflow-hidden">
      {/* 🌿 Header Section */}
      <div className="flex flex-col items-center mb-2 select-none">
        <img
          src="/heart.png"
          alt="Healthcare Logo"
          className="w-14 h-14 mb-2 drop-shadow-md"
        />
        <h1 className="text-3xl font-bold text-green-700 font-poppins">
          Healthcare Portal
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-inter">
          Manage your health with ease 💚
        </p>
      </div>

      {/* 🌸 Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md mx-auto p-10 rounded-3xl bg-white/60 border border-white/30 backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          className="absolute -top-24 -right-24 w-60 h-60 bg-green-400/30 blur-[120px] rounded-full"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-green-200/30 blur-[100px] rounded-full"
          animate={{ scale: [1.1, 0.9, 1.1] }}
          transition={{ repeat: Infinity, duration: 7 }}
        />

        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-8 relative z-10"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <UserCircle2 size={40} />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-green-700 mt-4 tracking-wide font-poppins">
            Create Account
          </h2>
          <p className="text-gray-600 text-sm font-inter">
            Join as a Patient or Doctor 💚
          </p>
        </motion.div>

        {/* Role Selector */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6 bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-1 shadow-inner transition-all duration-300 relative z-10"
        >
          {[
            { key: "patient", icon: "👤" },
            { key: "doctor", icon: "🩺" },
          ].map((r) => (
            <motion.button
              key={r.key}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.07 }}
              type="button"
              onClick={() => setRole(r.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                role === r.key
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-400/40 scale-105"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <span className="text-lg">{r.icon}</span>
              {r.key.charAt(0).toUpperCase() + r.key.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4 relative z-10">
          {/* Name */}
          <div className="relative">
            <UserCircle2
              className="absolute left-3 top-3.5 text-green-600"
              size={20}
            />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={
                role === "doctor" ? "Doctor's Name" : "Patient's Name"
              }
              className={inputClass}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail
              className="absolute left-3 top-3.5 text-green-600"
              size={20}
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              className="absolute left-3 top-3.5 text-green-600"
              size={20}
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter a secure password"
              className={inputClass}
              required
            />
          </div>

          {/* Doctor fields */}
          {role === "doctor" && (
            <>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-3.5 text-green-600"
                  size={20}
                />
                <input
                  type="text"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="Specialization (e.g. Cardiologist)"
                  className={inputClass}
                  list="specializations"
                  required
                />
                <datalist id="specializations">
                  <option value="Cardiologist" />
                  <option value="Neurologist" />
                  <option value="Dermatologist" />
                  <option value="Pediatrician" />
                  <option value="General Physician" />
                </datalist>
              </div>

              <div className="relative">
                <Award
                  className="absolute left-3 top-3.5 text-green-600"
                  size={20}
                />
                <input
                  type="number"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Experience (Years)"
                  className={inputClass}
                  required
                />
              </div>
            </>
          )}

          {/* Patient fields */}
          {role === "patient" && (
            <>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3.5 text-green-600"
                  size={20}
                />
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={inputClass}
                  required
                />
              </div>

              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3.5 text-green-600"
                  size={20}
                />
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold text-sm mb-1 block">
                  Gender
                </label>
                <div className="flex gap-3 mt-1">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 py-2 rounded-2xl text-sm font-medium transition ${
                        form.gender === g
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{
              scale: 1.04,
              background: "linear-gradient(to right, #16a34a, #15803d)",
            }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/40 transition-all duration-300"
          >
            {loading ? "Creating..." : "Sign Up"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600 relative z-10">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline hover:text-green-800 transition"
          >
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
