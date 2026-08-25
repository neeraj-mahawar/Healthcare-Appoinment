import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDoctor } from "../context/DoctorContext";
import Modal from "./Modal";
import {
  Video,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Tablet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext"; // ✅ Add at top

const statusColors = {
  pending:
    "bg-gradient-to-r from-yellow-50 to-amber-100 text-yellow-800 border border-yellow-300",
  completed:
    "bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 border border-green-300",
  cancelled:
    "bg-gradient-to-r from-red-50 to-pink-100 text-red-800 border border-red-300",
};

const DoctorAppointments = () => {
  const { doctor } = useDoctor();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientModal, setPatientModal] = useState(null);
  const { showToast } = useToast(); // ✅ Inside component
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!doctor?._id) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/doctor/appointments/${doctor._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data.success) setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctor?._id]);

  const handleViewPatient = async (patientId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/doctor/patients/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) setPatientModal(res.data.patient);
    } catch (err) {
      console.error("Failed to fetch patient details:", err);
    }
  };

  // ✅ Complete Appointment
  const handleComplete = async (apptId) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${apptId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === apptId ? { ...a, status: "completed" } : a,
          ),
        );
        showToast("✅ Appointment marked as completed!", "success");
      } else {
        showToast("❌ Failed to complete appointment.", "error");
      }
    } catch (err) {
      console.error("Complete error:", err);
      showToast("Something went wrong while completing appointment.", "error");
    }
  };

  // ❌ Cancel Appointment
  const handleCancel = async (apptId) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${apptId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === apptId ? { ...a, status: "cancelled" } : a,
          ),
        );
        showToast("❌ Appointment cancelled successfully.", "info");
      } else {
        showToast("Error cancelling appointment", "error");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      showToast("Something went wrong while cancelling appointment.", "error");
    }
  };

  if (loading)
    return (
      <div className="text-center py-16 text-gray-500 animate-pulse text-lg font-medium">
        Loading appointments...
      </div>
    );

  if (!appointments.length)
    return (
      <div className="text-center py-16 text-gray-500 text-lg">
        No appointments found.
      </div>
    );

  const renderAppointmentCard = (appt) => {
    const apptDate = new Date(appt.datetime);
    const isUpcoming = apptDate >= new Date();

    return (
      <motion.div
        key={appt._id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative group bg-white/70 backdrop-blur-2xl border border-white/40 p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_45px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-green-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative flex flex-col md:flex-row justify-between gap-8">
          {/* Patient Info */}
          <div className="flex-1 space-y-3">
            <div className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full shadow-inner">
                <User className="text-blue-600" size={20} />
              </div>
              <button
                onClick={() => handleViewPatient(appt.patient._id)}
                className="text-blue-700 hover:underline transition"
              >
                {appt.patient?.name || "Unknown Patient"}
              </button>
            </div>

            {appt.patient?.email && (
              <p className="text-gray-600 flex items-center gap-2 ml-11">
                <Mail size={16} className="text-green-500" />{" "}
                {appt.patient.email}
              </p>
            )}
            {appt.patient?.phone && (
              <p className="text-gray-600 flex items-center gap-2 ml-11">
                <Phone size={16} className="text-green-500" />{" "}
                {appt.patient.phone}
              </p>
            )}

            <p className="text-gray-800 flex items-center gap-2 ml-11 font-semibold">
              <Calendar size={16} className="text-purple-500" />{" "}
              {apptDate.toLocaleString()}
            </p>

            {appt.medicine && (
              <p className="text-gray-700 flex items-center gap-2 ml-11">
                <Tablet size={16} className="text-indigo-500" /> {appt.medicine}
              </p>
            )}

            <div className="ml-11 mt-2">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${statusColors[appt.status]}`}
              >
                {appt.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end items-center">
            {isUpcoming && appt.status === "pending" && (
              <a
                href={`http://localhost:3000/video/${appt._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-md transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] hover:scale-105"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Video size={18} className="relative" />
                <span className="relative">Video Call</span>
              </a>
            )}

            {appt.status === "pending" && (
              <>
                <button
                  onClick={() => handleComplete(appt._id)}
                  className="group relative flex items-center gap-2 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white px-5 py-3 rounded-2xl font-semibold shadow-md hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)] hover:scale-105 transition-all"
                >
                  <CheckCircle size={18} className="relative" />
                  <span>Complete</span>
                </button>
                <button
                  onClick={() => handleCancel(appt._id)}
                  className="group relative flex items-center gap-2 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white px-5 py-3 rounded-2xl font-semibold shadow-md hover:shadow-[0_8px_30px_rgba(239,68,68,0.5)] hover:scale-105 transition-all"
                >
                  <XCircle size={18} className="relative" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-[0_1px_10px_rgba(0,0,0,0.05)] mb-4 overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 w-56 h-56 bg-gradient-to-br from-blue-400/10 to-green-400/10 blur-[80px]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <h2 className="relative text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent text-center drop-shadow-sm">
          👨‍⚕️ My Appointments
        </h2>
      </motion.div>

      {appointments.map(renderAppointmentCard)}

      {/* Patient Modal */}
      {patientModal && (
        <Modal onClose={() => setPatientModal(null)}>
          <div className="flex flex-col items-center w-full p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 shadow-[0_8px_30px_rgba(59,130,246,0.3)]">
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                <User className="relative text-white" size={48} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {patientModal.name}
              </h2>
              <p className="text-gray-600 flex items-center justify-center gap-2 mt-2">
                <Mail size={16} /> {patientModal.email}
              </p>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Phone size={16} /> {patientModal.phone}
              </p>
            </div>

            <div className="space-y-3 text-gray-800 text-left bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 w-full shadow-inner">
              <p className="font-semibold">
                <strong>Age:</strong> {patientModal.age}
              </p>
              <p className="font-semibold">
                <strong>Gender:</strong> {patientModal.gender}
              </p>
              {patientModal.address && (
                <p className="font-semibold">
                  <strong>Address:</strong> {patientModal.address}
                </p>
              )}
              {patientModal.medicalHistory && (
                <p className="font-semibold">
                  <strong>Medical History:</strong>{" "}
                  {patientModal.medicalHistory}
                </p>
              )}
            </div>

            <a
              href={`http://localhost:3000/video/${patientModal._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-3 mt-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:shadow-[0_12px_40px_rgba(59,130,246,0.5)] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105"
            >
              <Video size={20} className="relative" />
              <span className="relative">Start Video Call</span>
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorAppointments;
