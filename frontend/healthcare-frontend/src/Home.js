import React, { useState, useEffect } from "react";
import axios from "axios";
import AppointmentForm from "./components/AppointmentForm";
import AppointmentList from "./components/AppointmentList";
import VideoCall from "./components/VideoCall";
// import AdminDashboard from "./components/AdminDashboard";
function App() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/appointments");
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Healthcare Tracker</h1>
      
      <AppointmentForm onBooked={appt => setAppointments([...appointments, appt])} />
      <AppointmentList appointments={appointments} />

      {/* Video call component */}
      <VideoCall 
        appId={process.env.REACT_APP_AGORA_APP_ID} 
        channel="testChannel" 
      />
    </div>
  );
}

export default App;
