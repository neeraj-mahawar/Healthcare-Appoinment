import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [countdown, setCountdown] = useState(3); // 3 seconds redirect timer
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const token = query.get("token");
        const role = query.get("role") || "patient";

        if (!token) {
          setStatus("error");
          return;
        }

        const endpoint =
          role === "doctor"
            ? `${process.env.REACT_APP_BACKEND_URL}/api/doctor/verify-email?token=${token}`
            : `${process.env.REACT_APP_BACKEND_URL}/api/patient/auth/verify-email?token=${token}`;

        const res = await axios.get(endpoint);
        if (res.status === 200) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, []);

  // 🕒 Countdown for redirect after success
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="relative w-full max-w-md mx-auto p-6 rounded-3xl bg-white/60 border border-white/30 backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center items-center"
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
          <MailCheck size={42} />
        </motion.div>

        <h2 className="text-3xl font-extrabold text-green-700 mt-4 tracking-wide font-poppins">
          Email Verification
        </h2>
        <p className="text-gray-600 text-sm font-inter">
          Secure Health • Verified with Care 💌
        </p>
      </motion.div>

      {/* Status Display */}
      <div className="relative z-10 text-center mt-2">
        {status === "verifying" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="h-14 w-14 text-green-500 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-800">
              Verifying your email...
            </h3>
            <p className="text-gray-500 text-sm">
              Please wait while we confirm your account ⏳
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-2xl font-bold text-gray-900">
              Email Verified Successfully! 🎉
            </h3>
            <p className="text-gray-600">
              Redirecting to login in{" "}
              <span className="font-semibold">{countdown}</span> seconds...
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-all"
            >
              Go to Login Now
            </button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <XCircle className="h-16 w-16 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900">
              Verification Failed ❌
            </h3>
            <p className="text-gray-600">
              The verification link may have expired or is invalid.
            </p>
            <a
              href="/signup"
              className="mt-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-all"
            >
              Register Again
            </a>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs text-gray-600 relative z-10">
        © {new Date().getFullYear()} <strong>HealthPrime</strong> •{" "}
        <a href="#" className="text-green-700 hover:underline">
          Privacy
        </a>{" "}
        •{" "}
        <a href="#" className="text-green-700 hover:underline">
          Support
        </a>
      </p>
    </motion.div>
  );
};

export default VerifyEmail;
