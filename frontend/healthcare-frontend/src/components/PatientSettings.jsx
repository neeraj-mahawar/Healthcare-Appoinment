import React, { useEffect, useState } from "react";
import { usePatient } from "../context/PatientContext";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Phone, Award, UserPlus, UserMinus } from "lucide-react";

const PatientSettings = () => {
  const { patient, updatePatient, loading } = usePatient();
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "" });
  const [updating, setUpdating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || "",
        phone: patient.phone || "",
        age: patient.age || "",
        gender: patient.gender || "",
      });
    }
  }, [patient]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/patients/${patient._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updatePatient(res.data);
      toast.success("Profile updated successfully!");
      setSearchParams({ tab: "profile" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const goToProfile = () => setSearchParams({ tab: "profile" });

  const fields = [
    { label: "Name", key: "name", icon: User, type: "text" },
    { label: "Phone", key: "phone", icon: Phone, type: "text" },
    { label: "Age", key: "age", icon: Award, type: "number" },
  ];

  const genders = [
    { label: "Male", value: "Male", icon: UserPlus },
    { label: "Female", value: "Female", icon: UserMinus },
  ];

  if (loading) return <p className="p-6 text-gray-500">Loading settings...</p>;
  if (!patient) return <p className="p-6 text-red-500">Patient not found</p>;

  return (
    <div className="min-h-screen flex justify-center p-4 bg-gray-50">
      <div className="w-full max-w-xl">
        <h2 className="text-3xl font-extrabold text-green-700 text-center mb-8">
          ⚙ Account Settings
        </h2>

        {/* Personal Info Section */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl shadow-sm bg-gray-50"
                >
                  <div className="p-2 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Icon size={20} />
                  </div>
                  <input
                    type={field.type}
                    name={field.key}
                    placeholder={field.label}
                    value={form[field.key]}
                    onChange={handleChange}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none focus:ring-2 focus:ring-green-300 rounded-lg p-2 text-gray-800 placeholder-gray-400"
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Gender Selection */}
          <div className="mt-4">
            <span className="text-gray-500 font-semibold mb-2 inline-block">
              Gender
            </span>
            <div className="flex flex-wrap gap-3">
              {genders.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g.value })}
                  className={`flex-auto sm:flex-none py-2 px-4 rounded-2xl flex items-center justify-center gap-2 font-medium transition
                    ${
                      form.gender === g.value
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                  <g.icon size={18} />
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`flex-1 py-3 rounded-2xl font-bold text-white text-lg transition ${
              updating ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={goToProfile}
            className="flex-1 py-3 rounded-2xl font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSettings;
