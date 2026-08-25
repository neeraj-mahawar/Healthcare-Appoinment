import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const DoctorContext = createContext();
export const useDoctor = () => useContext(DoctorContext);

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ------------------- Fetch logged-in doctor -------------------
  const fetchDoctor = useCallback(async () => {
    if (!token || role !== "doctor") {
      setDoctor(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/doctor/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // 🧩 Flatten response safely
      let doctorData = res.data.doctor || res.data || null;
      if (doctorData?.doctor) doctorData = doctorData.doctor; // flatten nested key

      setDoctor(doctorData);

      // 🪄 Debug log to check data
      console.log("🩺 Doctor fetched from backend:", doctorData);
    } catch (err) {
      console.error("Error fetching doctor info:", err);
      setDoctor(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  const updateDoctor = useCallback((updatedData) => {
    setDoctor((prev) => ({ ...prev, ...updatedData }));
  }, []);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        updateDoctor,
        fetchDoctor,
        loading,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};
