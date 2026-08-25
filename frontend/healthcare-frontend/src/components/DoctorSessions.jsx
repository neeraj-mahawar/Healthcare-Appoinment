import React, { useEffect, useState } from "react";
import { useDoctor } from "../context/DoctorContext";
import axios from "axios";
import { User, Calendar, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function DoctorSessions() {
  const { doctor } = useDoctor();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");
  const [datetime, setDatetime] = useState("");

  const token = localStorage.getItem("token");

  const fetchSessions = async () => {
    if (!doctor?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/doctor/sessions/${doctor._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [doctor?._id]);

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!patientName || !datetime) return;

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sessions`,
        { doctorId: doctor._id, patientName, datetime },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPatientName("");
      setDatetime("");
      fetchSessions();
    } catch (err) {
      console.error("Failed to add session:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent text-center drop-shadow-md">
        🗓️ My Sessions
      </h2>

      {/* Add Session Form */}
      <form
        className="relative group bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border-2 border-white/60 hover:shadow-[0_16px_50px_rgba(0,0,0,0.15)] transition-all duration-300"
        onSubmit={handleAddSession}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="border-2 border-gray-200 p-4 rounded-2xl flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 font-semibold text-gray-800 transition"
            required
          />
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="border-2 border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 font-semibold text-gray-800 transition"
            required
          />
          <button
            type="submit"
            className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:shadow-[0_12px_40px_rgba(59,130,246,0.5)] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus size={20} className="relative" />
            <span className="relative">Add Session</span>
          </button>
        </div>
      </form>

      {/* Sessions List */}
      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">
          Loading sessions...
        </p>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-500">No sessions scheduled.</p>
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] border-2 border-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex-shrink-0">
                  <User className="text-blue-600" size={28} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-900 font-extrabold text-xl">
                    {s.patient?.name || s.patientName}
                  </span>
                  <span className="flex items-center gap-2 text-gray-600 font-semibold">
                    <Calendar size={18} className="text-purple-500" />
                    {new Date(s.datetime).toLocaleString()}
                  </span>
                  {s.notes && (
                    <span className="text-gray-500 italic text-sm">
                      {s.notes}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
