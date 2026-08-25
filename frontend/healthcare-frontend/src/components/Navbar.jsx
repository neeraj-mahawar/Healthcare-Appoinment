import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAppointments } from "../context/AppointmentsContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState(null); // start as null

  const { getLatestJoinableAppointment } = useAppointments();
  const latestAppointment = getLatestJoinableAppointment();
  const latestAppointmentId = latestAppointment?._id;

  // ✅ Load role from localStorage when component mounts
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "patient");
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-yellow-300 border-b-2 border-yellow-300"
      : "hover:text-gray-200 transition";

  // 🧭 Menu items based on role
  const getMenuItems = () => {
    if (!role) return [];
    switch (role) {
      case "admin":
        return [
          { path: "/admin/dashboard", label: "Dashboard" },
          { path: "/admin/doctors", label: "Doctors" },
          { path: "/admin/patients", label: "Patients" },
          { path: "/admin/sessions", label: "Sessions" },
        ];
      case "doctor":
        return [
          { path: "/doctor/dashboard", label: "Dashboard" },
          { path: "/doctor/appointments", label: "Appointments" },
          { path: "/doctor/sessions", label: "My Sessions" },
          { path: "/doctor/settings", label: "Settings" },
        ];
      case "patient":
      default:
        return [
          { path: "/patient/dashboard", label: "Dashboard" },
          { path: "/patient/appointment-form", label: "Book Appointment" },
          { path: "/patient/appointment-list", label: "My Bookings" },
          { path: "/patient/profile", label: "Profile" },
          { path: "/patient/settings", label: "Settings" },
        ];
    }
  };

  const menuItems = getMenuItems();

  // If role not loaded yet, don't render anything
  if (!role) return null;

  return (
    <nav className="bg-green-600 text-white shadow-md sticky top-0 z-50 font-inter">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo + Title */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate(`/${role}/dashboard`)}
        >
          <img src="/heart.png" alt="logo" className="w-8 h-8 rounded-full" />
          <h1 className="text-lg md:text-xl font-bold font-poppins">
            HealthCare Portal
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 font-medium">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={isActive(item.path)}>
              {item.label}
            </Link>
          ))}

          {/* Video Call only for patient */}
          {role === "patient" && latestAppointmentId && (
            <Link to={`/video/${latestAppointmentId}`} className={isActive(`/video/${latestAppointmentId}`)}>
              Video Call
            </Link>
          )}
        </div>

        {/* Logout */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition flex items-center space-x-1"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-700 px-6 py-4 space-y-4 transition-all duration-300">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block hover:text-gray-200"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {role === "patient" && latestAppointmentId && (
            <Link
              to={`/video/${latestAppointmentId}`}
              className="block hover:text-gray-200"
              onClick={() => setMenuOpen(false)}
            >
              Video Call
            </Link>
          )}
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="w-full bg-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
