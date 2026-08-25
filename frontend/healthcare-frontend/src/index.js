import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from "react";

import './index.css';
import "@fontsource/inter";
import "@fontsource/poppins";
import "@fontsource/nunito";

// ----- Auth / Public Pages -----
import Login from './App';
import Signup from './Signup';
import Home from './Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';

// ----- App / Dashboard Pages -----
import Dashboard from "./components/Dashboard";
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import VideoCall from './components/VideoCall';

// ----- Layouts -----
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import PublicLayout from "./components/PublicLayout";
import PatientLayout from './components/PatientLayout';
import DoctorLayout from "./components/DoctorLayout";

// ----- Context Providers -----
import { AppointmentsProvider } from "./context/AppointmentsContext";
import { PatientProvider } from "./context/PatientContext";
import { DoctorProvider } from "./context/DoctorContext";
import { ToastProvider } from "./context/ToastContext";

// ----- Protected Route -----
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from "./components/VerifyEmail";

import reportWebVitals from './reportWebVitals';
import CallEnded from "./components/CallEnded";
import HealthcarePayment from './components/HealthcarePayment';
import MedicineForm from "./components/MedicineForm";

// Root
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>

    {/* GLOBAL SUSPENSE WRAPPER */}
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f5f7ff]">
          <p className="text-blue-600 text-lg font-medium">Loading…</p>
        </div>
      }
    >
      <ToastProvider>
        <AppointmentsProvider>

          <Routes>
            {/* ---------- AUTH PAGES ---------- */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Payment */}
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <HealthcarePayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-success"
                element={
                  <PublicLayout>
                    <h2 className="text-center text-green-600 font-semibold mt-10">
                      ✅ Payment Successful! Thank you for your consultation.
                    </h2>
                  </PublicLayout>
                }
              />
              <Route
                path="/payment-failed"
                element={
                  <PublicLayout>
                    <h2 className="text-center text-red-600 font-semibold mt-10">
                      ❌ Payment Failed. Please try again or contact support.
                    </h2>
                  </PublicLayout>
                }
              />
            </Route>

            {/* Public Pages */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/call-ended" element={<CallEnded />} />
            <Route path="/video/:id" element={<VideoCall />} />

            <Route element={<PublicLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* ---------- MAIN DASHBOARD ---------- */}
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointment-form"
                element={
                  <ProtectedRoute>
                    <AppointmentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointment-list"
                element={
                  <ProtectedRoute>
                    <AppointmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medicines"
                element={
                  <ProtectedRoute>
                    <MedicineForm />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ---------- PATIENT SECTION ---------- */}
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute roleRequired="patient">
                  <PatientProvider>
                    <PatientLayout />
                  </PatientProvider>
                </ProtectedRoute>
              }
            />

            {/* ---------- DOCTOR SECTION ---------- */}
            <Route
              path="/doctor/*"
              element={
                <ProtectedRoute roleRequired="doctor">
                  <DoctorProvider>
                    <DoctorLayout />
                  </DoctorProvider>
                </ProtectedRoute>
              }
            />

          </Routes>

        </AppointmentsProvider>
      </ToastProvider>
    </Suspense>

  </BrowserRouter>
);

reportWebVitals();
