import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // ------------------- Fetch logged-in patient -------------------
  const fetchPatient = useCallback(async () => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/patient/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check backend response structure
      const patientData = res.data.patient || res.data || null;
      setPatient(patientData);
    } catch (err) {
      console.error("Error fetching patient:", err);
      localStorage.clear();
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  // ------------------- Fetch appointments -------------------
  const fetchAppointments = useCallback(async () => {
    if (!patient?._id) return;

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/patient/auth/${patient._id}/appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend might return { success: true, appointments: [...] }
      const appointmentData = res.data.appointments || [];
      setAppointments(appointmentData);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    }
  }, [patient?._id, token]);

  // ------------------- Update patient -------------------
  const updatePatient = useCallback(async (updatedData) => {
    setPatient((prev) => ({ ...prev, ...updatedData }));
    if (updatedData._id) {
      await fetchAppointments();
    }
  }, [fetchAppointments]);

  // ------------------- Initial load -------------------
  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  useEffect(() => {
    if (patient?._id) fetchAppointments();
  }, [patient?._id, fetchAppointments]);

  return (
    <PatientContext.Provider
      value={{ patient, updatePatient, appointments, fetchAppointments, loading }}
    >
      {children}
    </PatientContext.Provider>
  );
};
