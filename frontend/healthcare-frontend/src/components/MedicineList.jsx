// import React from "react";
// import { toast } from "react-toastify";

// export default function MedicineList({ medicines = [], markAsTaken }) {
//   if (!medicines.length) {
//     return (
//       <div className="bg-white p-6 rounded-3xl shadow-md text-center text-gray-500 font-inter">
//         No medicines added yet.
//       </div>
//     );
//   }

//   // Helper: calculate next dose from times array
//   const getNextDoseTime = (times) => {
//     if (!times || !times.length) return null;
//     const now = new Date();
//     const upcomingTimes = times
//       .map((time) => {
//         const [hour, minute] = time.split(":").map(Number);
//         const t = new Date();
//         t.setHours(hour, minute, 0, 0);
//         if (t < now) t.setDate(t.getDate() + 1);
//         return t;
//       })
//       .sort((a, b) => a - b);
//     return upcomingTimes[0];
//   };

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       {medicines.map((med, idx) => {
//         const nextDose = getNextDoseTime(med.times);

//         return (
//           <div
//             key={med._id || idx}
//             className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col justify-between hover:shadow-3xl transition transform hover:scale-[1.02]"
//           >
//             {/* Medicine Info */}
//             <div className="mb-4">
//               <p className="font-bold text-green-700 text-lg font-poppins">
//                 {med.name} ({med.dose})
//               </p>
//               <p className="text-gray-500 text-sm mt-1">
//                 <span className="font-medium">Next Dose:</span>{" "}
//                 {nextDose
//                   ? nextDose.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//                   : "N/A"}
//               </p>
//               <p className="text-gray-500 text-sm mt-1">
//                 <span className="font-medium">Times:</span> {med.times?.join(", ") || "N/A"}
//               </p>
//             </div>

//             {/* Taken Button */}
//             <button
//               onClick={() => {
//                 if (markAsTaken) {
//                   markAsTaken(`${med._id}_${Date.now()}`, med._id);
//                 } else {
//                   toast.info("markAsTaken function not provided");
//                 }
//               }}
//               className="mt-auto bg-green-600 text-white py-2 rounded-2xl font-semibold hover:bg-green-700 shadow-md transition transform hover:scale-[1.03]"
//             >
//               Taken
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
