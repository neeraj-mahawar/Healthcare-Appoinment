import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-center items-center text-center">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to HealthTrack</h1>
      <p className="text-gray-600 max-w-xl mb-6">
        Book appointments, track medicines, and consult doctors — all in one place.
      </p>
      <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Get Started
      </Link>
    </div>
  );
}
