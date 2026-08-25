import React from "react";
import { Outlet, Link } from "react-router-dom";

function PublicLayout() {
  console.log("✅ PublicLayout loaded");

  return (
    
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Healthcare Tracker</h1>
        <div className="space-x-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/about" className="hover:text-blue-600">About</Link>
          <Link to="/services" className="hover:text-blue-600">Services</Link>
          <Link to="/contact" className="hover:text-blue-600">Contact</Link>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-4">
        <p>© {new Date().getFullYear()} Healthcare Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default PublicLayout