import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext"; // ✅ Custom Toast Hook

const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const { showToast } = useToast(); // ✅ Use global toast system

  // 🔹 Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/appointments`);
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
        showToast("success", "Appointments loaded successfully!");
      } else {
        showToast("error", res.data.message || "Failed to load appointments!");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      showToast("error", "❌ Failed to fetch appointments!");
    }
  };

  // 🔹 Book new appointment
  const addAppointment = async (form) => {
    try {
      const res = await axios.post(`${backendUrl}/api/appointments/book`, form);
      if (res.data.success) {
        // ✅ Optimistic update
        setAppointments((prev) => [res.data.appointment, ...prev]);
        showToast("success", "✅ Appointment booked successfully!");
      } else {
        showToast("error", res.data.message || "❌ Failed to book appointment!");
      }
    } catch (err) {
      console.error("❌ Booking error:", err.response?.data || err);
      showToast("error", err.response?.data?.message || "❌ Something went wrong while booking!");
    }
  };

  // ✅ Compute latest joinable appointment
  const getLatestJoinableAppointment = () => {
    const now = new Date();
    const joinable = appointments.filter(
      (a) => a.status === "pending" && new Date(a.datetime) <= now
    );
    if (!joinable.length) return null;

    return joinable.reduce((latest, current) =>
      new Date(current.datetime) > new Date(latest.datetime) ? current : latest
    );
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        addAppointment,
        fetchAppointments,
        getLatestJoinableAppointment,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentsContext);
