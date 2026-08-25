import React, { useEffect, useState } from "react";
import { useDoctor } from "../context/DoctorContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Tablet, Award, Trash2 } from "lucide-react";

const DoctorSettings = () => {
  const { doctor, updateDoctor } = useDoctor();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
  });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        specialization: doctor.specialization || "",
        experience: doctor.experience || "",
      });
    }
  }, [doctor]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    if (!doctor) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/doctor/account/${doctor._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        updateDoctor(res.data.doctor);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.data.message || "Error updating profile");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!doctor) return;
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone.",
      )
    )
      return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/doctor/account/${doctor._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      localStorage.clear();
      navigate("/login");
      toast.success("Account deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  const fields = [
    { label: "Name", key: "name", icon: User, type: "text" },
    { label: "Email", key: "email", icon: Mail, type: "email" },
    { label: "Phone", key: "phone", icon: Phone, type: "text" },
    {
      label: "Specialization",
      key: "specialization",
      icon: Tablet,
      type: "text",
    },
    {
      label: "Experience (yrs)",
      key: "experience",
      icon: Award,
      type: "number",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-12">
      <h2 className="text-3xl font-extrabold text-blue-700 text-center">
        ⚙ Account Settings
      </h2>

      {/* Input Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 p-4 border border-gray-100 rounded-3xl shadow-md hover:shadow-xl bg-white transition transform hover:-translate-y-1"
            >
              <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Icon size={22} />
              </div>
              <input
                type={field.type}
                name={field.key}
                placeholder={field.label}
                value={form[field.key]}
                onChange={handleChange}
                className="flex-1 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-300 rounded-lg p-2 text-gray-800 placeholder-gray-400"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={handleUpdate}
          disabled={updating}
          className={`w-full py-4 rounded-3xl font-bold text-white text-lg transition ${
            updating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {updating ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`w-full py-4 rounded-3xl font-bold text-white text-lg flex items-center justify-center gap-2 transition ${
            deleting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          <Trash2 size={18} /> {deleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
};

export default DoctorSettings;
