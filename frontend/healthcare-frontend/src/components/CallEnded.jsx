import React from "react";
import { useNavigate } from "react-router-dom";
import { VideoOff, Home, ShieldCheck, Stethoscope } from "lucide-react";

export default function CallEnded() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleReturn = () => {
    if (role === "doctor") {
      navigate("/doctor/profile");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 relative overflow-hidden">
      {/* Animated background - matching VideoCall */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/symphony.png')] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-500/10 to-purple-500/20 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-20 left-20 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />

      {/* HEADER - matching VideoCall */}
      <header className="relative flex justify-between items-center w-full max-w-6xl px-8 py-5 mt-4 mb-8 bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl z-10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-green-400 rounded-full blur-lg opacity-40 animate-pulse" />
              <Stethoscope className="relative text-green-600 w-8 h-8 drop-shadow-lg" />
            </div>
            TeleConsultation
          </h1>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Secure Video Consultation Platform
          </p>
        </div>
      </header>

      {/* MAIN CARD - matching VideoCall styling */}
      <div className="relative bg-white/80 backdrop-blur-2xl border-2 border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-3xl p-12 flex flex-col items-center text-center w-[90%] max-w-lg hover:shadow-[0_24px_70px_rgba(0,0,0,0.2)] transition-all duration-300 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-pink-500/5 to-red-500/5 rounded-3xl" />
        
        {/* Icon container with gradient and animations */}
        <div className="relative p-8 bg-gradient-to-br from-red-100 via-red-50 to-pink-100 rounded-full mb-6 shadow-[0_8px_30px_rgba(239,68,68,0.3)]">
          <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" style={{ animationDuration: '3s' }} />
          <VideoOff size={64} className="relative text-red-600 drop-shadow-lg" />
        </div>

        <h1 className="relative text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent">
          Call Ended
        </h1>
        
        <p className="relative text-gray-700 max-w-md mb-8 text-base leading-relaxed font-medium">
          The consultation has been successfully completed. Thank you for using our secure telehealth service.
        </p>

        <button
          onClick={handleReturn}
          className="relative group bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] text-white px-10 py-4 rounded-full flex items-center gap-3 font-bold text-base shadow-[0_8px_30px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Home size={20} className="relative" />
          <span className="relative">{role === "doctor" ? "Back to Profile" : "Return to Home"}</span>
        </button>
      </div>

      {/* FOOTER - matching VideoCall */}
      <footer className="relative mt-12 flex items-center justify-center z-10">
        <div className="relative group flex items-center gap-4 bg-white/80 backdrop-blur-2xl border-2 border-white/60 shadow-[0_8px_35px_rgba(0,0,0,0.1)] px-8 py-4 rounded-full text-base font-medium text-gray-800 hover:shadow-[0_10px_45px_rgba(0,0,0,0.15)] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-3 h-3 bg-green-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
          <ShieldCheck size={20} className="relative text-green-600" />
          <span className="relative tracking-tight">
            <span className="font-bold text-gray-900">End-to-End Encrypted</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-green-700 font-semibold">Secured by HealthCare Portal</span>
          </span>
        </div>

        {/* Enhanced gradient glow */}
        <div className="absolute -z-10 bottom-0 h-24 w-[70%] bg-gradient-to-r from-green-200/40 via-blue-200/40 to-green-200/40 blur-3xl opacity-70" />
      </footer>
    </div>
  );
}
