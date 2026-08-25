import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link , useLocation } from "react-router-dom";
import { Mail, Lock, UserCircle2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "./context/ToastContext"; // ✅ custom toast import

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast(); // ✅ use custom toast

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        role === "doctor"
          ? `${process.env.REACT_APP_BACKEND_URL}/api/doctor/login`
          : `${process.env.REACT_APP_BACKEND_URL}/api/patient/auth/login`;
console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);

      const res = await axios.post(endpoint, form);

      if (res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id || res.data.user.id);
        localStorage.setItem("role", role);

        showToast("success", "✅ Logged in successfully!"); // ✅ success toast
        // navigate(role === "doctor" ? "/doctor?tab=dashboard" : "/patient?tab=profile");
        const from = location.state?.from || (role === "doctor" ? "/doctor?tab=profile" : "/patient?tab=profile");
navigate(from, { replace: true });

      } else {
        showToast("error", "❌ Invalid response from server");
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "❌ Login failed!"); // ✅ error toast
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/60 backdrop-blur-lg border border-white/50 rounded-2xl px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-600 shadow-inner hover:shadow-md hover:border-green-300 transition-all duration-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto p-6 rounded-3xl bg-white/60 border border-white/30 backdrop-blur-2xl shadow-2xl overflow-hidden"
    >
      {/* Floating gradient orbs */}
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

      {/* Animated Header */}
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
          Welcome Back
        </h2>
        <p className="text-gray-600 text-sm font-inter">
          Login in to your smart health space 🩺
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
      <form onSubmit={handleLogin} className="space-y-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <Mail className="absolute left-3 top-3.5 text-green-600" size={20} />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <Lock className="absolute left-3 top-3.5 text-green-600" size={20} />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </motion.div>

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
          {loading ? "Logging in..." : (<><LogIn size={20} /> Login</>)}
        </motion.button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-600 relative z-10">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="text-green-700 font-semibold hover:underline hover:text-green-800 transition"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}

export default Login;
