import React, { useState } from "react";
import axios from "axios";

const SmartAppointmentForm = () => {
  const [formData, setFormData] = useState({
    specialty: "",
    preferredDate: "",
    doctorName: "",
    timeSlot: "",
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRecommendations = async () => {
    if (!formData.specialty || !formData.preferredDate) {
      alert("Please enter specialty and preferred date first!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
  `${process.env.REACT_APP_BACKEND_URL}/api/recommend`,
  {
    specialty: formData.specialty,
    preferredDate: formData.preferredDate,
  }
);


      setRecommendations(res.data.recommendations);
    } catch (err) {
      alert("Error fetching recommendations. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (rec) => {
    setFormData({
      ...formData,
      doctorName: rec.doctorName,
      timeSlot: `${rec.suggestedSlot.date} - ${rec.suggestedSlot.timeSlot}`,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment booked:", formData);
    alert(`✅ Appointment booked with ${formData.doctorName}`);
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
        🩺 Smart Appointment Booking
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Specialty */}
        <input
          type="text"
          name="specialty"
          placeholder="Specialty (e.g. Cardiologist)"
          value={formData.specialty}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />

        {/* Preferred Date */}
        <input
          type="date"
          name="preferredDate"
          value={formData.preferredDate}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />

        {/* Get AI Recommendation Button */}
        <button
          type="button"
          onClick={getRecommendations}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? "Loading AI Recommendations..." : "🤖 Get Smart Recommendations"}
        </button>

        {/* AI Suggestions */}
        {recommendations.length > 0 && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
            <h3 className="font-semibold mb-2">AI Suggested Slots:</h3>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(rec)}
                className="cursor-pointer border p-2 rounded mb-2 hover:bg-green-100 transition"
              >
                <p>👨‍⚕️ <b>{rec.doctorName}</b> ({rec.specialty})</p>
                <p>🗓️ {rec.suggestedSlot.date}</p>
                <p>🕒 {rec.suggestedSlot.timeSlot}</p>
              </div>
            ))}
          </div>
        )}

        {/* Doctor + Time Auto-fill */}
        <input
          type="text"
          name="doctorName"
          placeholder="Doctor Name (auto or manual)"
          value={formData.doctorName}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />

        <input
          type="text"
          name="timeSlot"
          placeholder="Time Slot (auto or manual)"
          value={formData.timeSlot}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          📅 Book Appointment
        </button>
      </form>
    </div>
  );
};

export default SmartAppointmentForm;
