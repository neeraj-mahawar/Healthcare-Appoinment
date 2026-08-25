import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-200 via-green-100 to-blue-100 font-inter overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-1 -mt-6 select-none">
        <img
          src="/heart.png"
          alt="Healthcare Logo"
          className="w-14 h-14 mb-1 drop-shadow-md"
        />
        <h1 className="text-3xl font-bold text-green-700 font-poppins">
          Healthcare Portal
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-inter">
          Manage your health with ease 💚
        </p>
      </div>

      {/* Outlet (Login / Signup) */}
      <div className="w-full flex justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
