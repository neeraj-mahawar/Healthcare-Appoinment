import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Tablet,
  Clock,
  Pill,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  XCircle,
  Search,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";

export default function AppointmentList({
  appointments = [],
  loading = false,
}) {
  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const controls = useAnimation();
  const searchRef = useRef(null);

  // ✅ Always call hooks before any return
  const expand = () => controls.start({ width: "22rem", scale: 1.02 });
  const collapse = () => controls.start({ width: "18rem", scale: 1 });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        collapse();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Compute filteredAppointments even if loading
  const filteredAppointments = useMemo(() => {
    if (!appointments?.length) return [];
    return appointments
      .filter((a) => {
        if (filter === "completed") return a.status === "completed";
        if (filter === "cancelled") return a.status === "cancelled";
        return a.status === "pending";
      })
      .filter((a) => {
        const term = search.toLowerCase();
        const patient = a.patient?.name?.toLowerCase() || "";
        const doctor = a.doctor?.name?.toLowerCase() || "";
        const medicine = a.medicine?.toLowerCase() || "";
        return (
          patient.includes(term) ||
          doctor.includes(term) ||
          medicine.includes(term)
        );
      })
      .sort((a, b) => {
        const da = new Date(a.datetime);
        const db = new Date(b.datetime);
        return sortOrder === "asc" ? da - db : db - da;
      });
  }, [appointments, filter, search, sortOrder]);

  // ✅ Now handle conditional UI returns *after* all hooks
  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl shadow-lg text-center text-gray-500 animate-pulse border border-white/30">
        Loading appointments...
      </div>
    );
  }

  if (!appointments?.length) {
    return (
      <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl shadow-lg text-center text-gray-500 border border-white/30">
        No appointments booked yet.
      </div>
    );
  }

  // ✅ Tabs should be defined before JSX
  const tabs = [
    { key: "upcoming", label: "Upcoming", icon: <CalendarDays size={18} /> },
    { key: "completed", label: "Completed", icon: <CheckCircle size={18} /> },
    { key: "cancelled", label: "Cancelled", icon: <XCircle size={18} /> },
  ];

  // ✅ Extract today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    return filteredAppointments.filter((a) => {
      const date = new Date(a.datetime);
      return date >= start && date <= end;
    });
  }, [filteredAppointments]);

  return (
    <div className="mt-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm flex justify-center items-center gap-3">
          <CalendarDays size={36} className="text-green-600" /> Appointment
          Manager
        </h2>
        <p className="text-gray-600 font-medium mt-2">
          Filter, Search, and Sort your appointments easily
        </p>
      </div>

      {/* Filter, Search, Sort */}
      <div className="flex flex-wrap justify-center gap-4 items-center">
        {/* Tabs */}
        <div className="flex gap-3 bg-white/60 backdrop-blur-md p-2 rounded-full shadow-sm border border-gray-200/60">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 
                ${
                  filter === t.key
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md scale-105"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Search box */}
        <motion.div
          ref={searchRef}
          animate={controls}
          initial={{ width: "18rem" }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="relative flex items-center gap-3 bg-transparent backdrop-blur-lg rounded-full px-5 py-2 focus-within:ring-2 focus-within:ring-emerald-400 shadow-sm transition-all duration-300"
          onFocus={expand}
        >
          <Search size={20} className="text-emerald-600 opacity-80" />
          <input
            type="text"
            placeholder="Search doctor, patient, or medicine..."
            className="bg-transparent outline-none focus:outline-none focus:ring-0 w-full text-[15px] text-gray-800 placeholder-gray-500 font-medium border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </motion.div>

        {/* Sort */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-5 py-2 bg-white/70 backdrop-blur-md border border-gray-200 rounded-full text-gray-700 shadow-sm hover:bg-green-50 transition-all"
        >
          {sortOrder === "asc" ? (
            <>
              <SortAsc size={18} className="text-green-500" /> Date Asc
            </>
          ) : (
            <>
              <SortDesc size={18} className="text-green-500" /> Date Desc
            </>
          )}
        </button>
      </div>
      {/* ✅ Today's Appointments Section */}
      {todayAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 backdrop-blur-md shadow-inner rounded-3xl p-6"
        >
          <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
            <CalendarDays size={22} className="text-emerald-600" /> Today’s
            Appointments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayAppointments.map((a, idx) => {
              const doctorName =
                a.doctor?.name || `Doctor ID: ${a.doctor}` || "Unknown";
              const datetime = new Date(a.datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const medicine = a.medicine || "No medicine prescribed";

              return (
                <motion.div
                  key={a._id || idx}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="p-5 rounded-2xl bg-white/70 shadow-md border border-emerald-200 hover:shadow-lg transition-all duration-300"
                >
                  <h4 className="font-semibold text-gray-800">{doctorName}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                    <Clock size={14} className="text-emerald-500" /> {datetime}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                    <Pill size={14} className="text-rose-500" /> {medicine}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Appointment Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter + search + sortOrder}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
        >
          {filteredAppointments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 font-medium">
              No appointments match your search.
            </div>
          ) : (
            filteredAppointments.map((a, idx) => {
              const doctorName =
                a.doctor?.name || `Doctor ID: ${a.doctor}` || "Unknown";
              const datetime = new Date(a.datetime).toLocaleString();
              const medicine = a.medicine || "No medicine prescribed";

              const isCompleted = a.status === "completed";
              const isPending = a.status === "pending";
              const isCancelled = a.status === "cancelled";

              return (
                <motion.div
                  key={a._id || idx}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 180, damping: 14 }}
                  className={`relative p-7 rounded-3xl border-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300
                    ${
                      isCompleted
                        ? "border-emerald-300 bg-gradient-to-br from-green-50/90 to-emerald-50/70"
                        : isPending
                          ? "border-sky-300 bg-gradient-to-br from-sky-50/80 to-cyan-50/70"
                          : isCancelled
                            ? "border-red-300 bg-gradient-to-br from-rose-50/90 to-red-50/70"
                            : "border-gray-200 bg-white/80"
                    }`}
                >
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 font-poppins">
                      {doctorName}
                    </h3>

                    <div className="flex gap-2">
                      {isCompleted && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <CheckCircle size={14} /> Done
                        </span>
                      )}
                      {isPending && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                          <AlertCircle size={14} /> Upcoming
                        </span>
                      )}
                      {isCancelled && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          <XCircle size={14} /> Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2 text-gray-700 font-medium">
                      <Tablet size={16} className="text-green-500" />{" "}
                      <span className="font-semibold">{doctorName}</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-700 font-medium">
                      <Clock size={16} className="text-blue-500" /> {datetime}
                    </p>
                    <p className="flex items-center gap-2 text-gray-700 font-medium">
                      <Pill size={16} className="text-rose-500" /> {medicine}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
