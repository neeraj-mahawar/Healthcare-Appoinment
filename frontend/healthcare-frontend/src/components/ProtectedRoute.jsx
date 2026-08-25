import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // small delay to avoid white flash on refresh
    const timer = setTimeout(() => {
      setLoading(false);
    }, 150); // 150ms is enough

    return () => clearTimeout(timer);
  }, []);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // 🟦 FIX: Show small background until React completes hydration
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-[#f5f7ff]">
  //       <p className="text-blue-500 text-lg font-medium">Loading...</p>
  //     </div>
  //   );
  // }

  if (!token) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (roleRequired && userRole !== roleRequired) {
    const redirectPath = userRole === "doctor" ? "/doctor" : "/patient";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
