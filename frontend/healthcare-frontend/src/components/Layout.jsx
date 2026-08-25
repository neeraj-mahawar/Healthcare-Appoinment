import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 font-inter">
      {/* Navbar - fixed top */}
      <Navbar />

      {/* Main Content (white card wrapper for pages) */}
      <main className="p-6 max-w-7xl mx-auto pt-24">
        <div className="bg-white/90 shadow-2xl rounded-2xl p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
