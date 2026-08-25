import React from "react";

export default function Services() {
  const list = [
    "Online Appointments",
    "Medicine Tracker",
    "Video Consultations",
    "Health Records"
  ];
  return (
    <div className="max-w-5xl mx-auto py-16 px-6 text-gray-700">
      <h1 className="text-3xl font-bold mb-8 text-blue-600 text-center">Our Services</h1>
      <ul className="grid md:grid-cols-2 gap-6">
        {list.map((s, i) => (
          <li key={i} className="bg-white shadow p-6 rounded-xl text-center">{s}</li>
        ))}
      </ul>
    </div>
  );
}
