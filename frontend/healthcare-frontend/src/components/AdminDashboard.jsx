// frontend/src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    email: "",
    password: "",
  });

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("/admin/doctors");
        setDoctors(response.data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Add a new doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/admin/doctors", formData);
      setDoctors([...doctors, response.data.doctor]);
      setFormData({ name: "", specialization: "", email: "", password: "" });
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  // Delete a doctor
  const handleDeleteDoctor = async (id) => {
    try {
      await axios.delete(`/admin/doctors/${id}`);
      setDoctors(doctors.filter((doctor) => doctor._id !== id));
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <form onSubmit={handleAddDoctor}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Specialization"
          value={formData.specialization}
          onChange={(e) =>
            setFormData({ ...formData, specialization: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button type="submit">Add Doctor</button>
      </form>

      <h3>Doctors List</h3>
      <ul>
        {doctors.map((doctor) => (
          <li key={doctor._id}>
            {doctor.name} - {doctor.specialization}
            <button onClick={() => handleDeleteDoctor(doctor._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
