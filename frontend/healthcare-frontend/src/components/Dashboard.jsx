// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import AppointmentForm from "./AppointmentForm";
// import AppointmentList from "./AppointmentList";
// import MedicineForm from "./MedicineForm";
// import MedicineList from "./MedicineList";
// import { toast } from "react-toastify";

// function Dashboard() {
//   const [appointments, setAppointments] = useState([]);
//   const [medicines, setMedicines] = useState([]);
//   const [reminders, setReminders] = useState([]);
//   const [loadingAppointments, setLoadingAppointments] = useState(true);
//   const [loadingMedicines, setLoadingMedicines] = useState(true);
//   const [loadingReminders, setLoadingReminders] = useState(true);

//   const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
//   const userId = localStorage.getItem("userId");

//   // ---------------- Socket.IO ----------------
//   useEffect(() => {
//     const socket = io(backendUrl);

//     socket.on("connect", () => console.log("✅ Connected to Socket.IO server"));

//     socket.on("appointmentAdded", (newAppointment) => {
//       setAppointments((prev) => [...prev, newAppointment]);
//       toast.info("📅 New appointment added!");
//     });

//     socket.on("medicineAdded", (newMed) => {
//       setMedicines((prev) => {
//         if (prev.find((m) => m._id === newMed._id)) return prev;
//         const updated = [newMed, ...prev];
//         localStorage.setItem("medicines", JSON.stringify(updated));
//         fetchReminders(updated);
//         return updated;
//       });
//       toast.info("💊 Medicine added!");
//     });

//     socket.on("medicineUpdated", (updatedMed) => {
//       setMedicines((prev) => {
//         const updated = prev.map((m) =>
//           m._id === updatedMed._id ? updatedMed : m
//         );
//         localStorage.setItem("medicines", JSON.stringify(updated));
//         fetchReminders(updated);
//         return updated;
//       });
//       toast.info("💊 Medicine updated!");
//     });

//     return () => socket.disconnect();
//   }, [backendUrl]);

//   // ---------------- Fetch Functions ----------------
//   const fetchAppointments = async () => {
//     setLoadingAppointments(true);
//     try {
//       const res = await axios.get(`${backendUrl}/api/appointments`);
//       setAppointments(res.data.appointments || []);
//     } catch (err) {
//       console.error("❌ Failed to fetch appointments:", err);
//       toast.error("Failed to load appointments!");
//     } finally {
//       setLoadingAppointments(false);
//     }
//   };

//   const fetchMedicines = async () => {
//     if (!userId) return [];
//     setLoadingMedicines(true);
//     try {
//       const res = await axios.get(`${backendUrl}/api/medicine/user/${userId}`);
//       const meds = res.data.medicines || [];
//       setMedicines(meds);
//       localStorage.setItem("medicines", JSON.stringify(meds));
//       return meds;
//     } catch (err) {
//       console.error("❌ Failed to fetch medicines:", err);
//       toast.error("Failed to load medicines!");
//       return [];
//     } finally {
//       setLoadingMedicines(false);
//     }
//   };

//  const fetchReminders = async (medsList = null) => {
//   if (!userId) return;
//   setLoadingReminders(true);
//   try {
//     const currentMeds = medsList || medicines;
//     if (!currentMeds.length) {
//       setReminders([]);
//       return;
//     }
//     const res = await axios.get(`${backendUrl}/api/medicine/reminders/${userId}`);

//     // Map medicines for dose info
//     const medsMap = currentMeds.reduce((acc, med) => {
//       acc[med._id] = med;
//       return acc;
//     }, {});

//     const remindersWithDose = res.data.reminders.map((rem) => {
//       const medId = rem._id.split("_")[0];
//       const med = medsMap[medId];
//       return {
//         ...rem,
//         dose: med?.dose || "N/A",
//         medicineId: medId, // Ensure medicineId is included
//       };
//     });

//     console.log("Reminders with medicineId:", remindersWithDose); // Log the reminders
//     setReminders(remindersWithDose);
//   } catch (err) {
//     console.error("❌ Failed to fetch reminders:", err);
//     setReminders([]);
//   } finally {
//     setLoadingReminders(false);
//   }
// };


//   // ---------------- Handlers ----------------
// const markAsTaken = async (reminderId, medicineId) => {
//   console.log("Marking as taken:", { reminderId, medicineId }); // Log the IDs
//   try {
//     if (!medicineId) {
//       toast.error("Medicine ID is missing!");
//       return;
//     }

//     const response = await axios.post(
//       `${backendUrl}/api/medicine/${medicineId}/taken`
//     );

//     if (response.data.success) {
//       toast.success("✅ Medicine marked as taken!");
//       setReminders((prev) => prev.filter((r) => r._id !== reminderId));
//       const meds = await fetchMedicines();
//       await fetchReminders(meds);
//     } else {
//       toast.error(response.data.message || "❌ Failed to mark medicine as taken.");
//     }
//   } catch (err) {
//     console.error("Error marking medicine as taken:", err);
//     toast.error(err.response?.data?.message || "❌ Could not mark medicine as taken.");
//   }
// };

//   // ---------------- Fetch all on mount ----------------
//   useEffect(() => {
//     const cached = localStorage.getItem("medicines");
//     if (cached) setMedicines(JSON.parse(cached));

//     fetchAppointments();
//     fetchMedicines().then(fetchReminders);

//     const interval = setInterval(() => fetchReminders(), 10000);
//     return () => clearInterval(interval);
//   }, [userId]);

//   useEffect(() => {
//     if (medicines.length > 0) fetchReminders(medicines);
//   }, [medicines]);

//   // ---------------- Render ----------------
//   return (
//     <div className="space-y-10">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-green-100 to-green-50 shadow-lg rounded-2xl p-10 text-center">
//         <h2 className="text-3xl font-bold text-green-700 mb-3 font-poppins">
//           🌿 Welcome to Your Healthcare Dashboard
//         </h2>
//         <p className="text-gray-600 font-inter text-lg">
//           Manage your health — book appointments, track medicines, and reminders.
//         </p>
//       </div>

//       {/* Appointments */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <section className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition">
//           <div className="sticky top-0 z-10">
//             <AppointmentForm
//               backendUrl={backendUrl}
//               onBooked={(newAppt) => {
//                 if (newAppt) setAppointments((prev) => [...prev, newAppt]);
//                 else fetchAppointments();
//               }}
//             />
//           </div>
//         </section>

//         <section className="bg-white rounded-2xl shadow-md hover:shadow-x1 transition p-4">
//           <div
//             className="h-[850px] overflow-y-auto p-2 space-y-4
//                           scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-200
//                           hover:scrollbar-thumb-green-500 rounded-2xl"
//           >
//             <AppointmentList
//               appointments={appointments}
//               loading={loadingAppointments}
//             />
//           </div>
//         </section>
//       </div>

//       {/* Medicines */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <section className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition">
//           <div className="sticky top-0 z-10">
//             <MedicineForm
//               userId={userId}
//               onAdded={(med) => {
//                 setMedicines((prev) => {
//                   if (prev.find((m) => m._id === med._id)) return prev;
//                   const updated = [med, ...prev];
//                   localStorage.setItem("medicines", JSON.stringify(updated));
//                   fetchReminders(updated);
//                   return updated;
//                 });
//               }}
//             />
//           </div>
//         </section>

//         <section className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 overflow-hidden">
//           <div
//             className="h-[850px] overflow-y-auto p-7 space-y-4
//                           scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-200
//                           hover:scrollbar-thumb-green-500 rounded-2xl"
//           >
//             <MedicineList
//               medicines={medicines}
//               markAsTaken={markAsTaken}
//               loading={loadingMedicines}
//             />
//           </div>
//         </section>
//       </div>

//       {/* Reminders */}
//       <section className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
//         <h2 className="text-xl font-semibold mb-4 text-green-700 font-poppins">
//           ⏰ Reminders
//         </h2>
//         <div className="h-[300px] overflow-y-auto">
//           {loadingReminders ? (
//             <p>Loading reminders...</p>
//           ) : reminders.length === 0 ? (
//             <p>No reminders set.</p>
//           ) : (
//             reminders.map((rem) => (
//               <div
//                 key={rem._id}
//                 className="flex justify-between items-center p-4 bg-green-50 border border-green-100 rounded-lg hover:shadow-md transition"
//               >
//                 <div>
//                   <p className="font-medium">{rem.title}</p>
//                   <p className="text-gray-500 text-sm">Dose: {rem.dose}</p>
//                   <p className="text-gray-500 text-sm">
//                     {new Date(rem.time).toLocaleString()}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => markAsTaken(rem._id, rem.medicineId)}
//                   className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 
//                              text-white px-4 py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 
//                              active:scale-95 transition-all duration-200 ease-in-out"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-4 w-4"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M5 13l4 4L19 7"
//                     />
//                   </svg>
//                   Done
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default Dashboard;