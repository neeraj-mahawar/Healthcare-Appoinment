import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, Loader2, Wallet2, HeartPulse } from "lucide-react";

const stripePromise = loadStripe("pk_test_51SNECnPwDagNxzCDtsb0u2o92kTxUGqXxpvetWAllIihwqy0RJvjTimygJIzIZLye5VrVs0gkrauSz2T97W1qzpY00LqorhUf0");

export default function HealthcarePayment({ amount = 500, email = "demo@user.com" }) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const handleStripePayment = async () => {
    setLoading(true);
    try {
   const res = await fetch(
  `${process.env.REACT_APP_BACKEND_URL}/api/payments/stripe/create-session`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, userEmail: email }),
  }
);

      const data = await res.json();
          // 🚀 SUPER FAST REDIRECT — No Stripe SDK needed
    if (data.url) {
      window.location.href = data.url;
      return;
    }
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error("Stripe Error:", err);
      alert("❌ Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] relative overflow-hidden">
      {/* ✨ Animated background glows */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-emerald-400/20 blur-[180px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[180px] bottom-0 right-0 animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_0_40px_rgba(34,211,238,0.2)] text-white"
      >
        <AnimatePresence mode="wait">
          {!paid ? (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ rotate: -15, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shadow-inner mb-3"
                >
                  <HeartPulse className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold">Payment Checkout</h1>
                <p className="text-white/60 text-sm mt-1">Secure & Encrypted Processing</p>
              </div>

              {/* Amount Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 border border-white/20 rounded-xl py-3 px-5 mb-6 backdrop-blur-sm"
              >
                <p className="text-base font-medium">Amount Due</p>
                <h2 className="text-4xl font-bold mt-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  ₹{amount}
                </h2>
              </motion.div>

              {/* Stripe Button */}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34,211,238,0.4)" }}
                whileTap={{ scale: 0.96 }}
                disabled={loading}
                onClick={handleStripePayment}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay with Stripe
                  </>
                )}
              </motion.button>

              <div className="my-6 flex items-center justify-center text-white/50 text-sm">
                <div className="h-px w-16 bg-white/20" />
                <span className="px-2">or</span>
                <div className="h-px w-16 bg-white/20" />
              </div>

              {/* PayPal Section */}
              <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID", currency: "USD" }}>
                  <PayPalButtons
                    style={{ layout: "horizontal", color: "blue", label: "paypal", height: 45 }}
                    createOrder={async () => {
                      const res = await fetch("http://localhost:5000/api/payments/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ amount: (amount / 83).toFixed(2) }),
                      });
                      const order = await res.json();
                      return order.id;
                    }}
                    onApprove={async (data) => {
                      const res = await fetch("http://localhost:5000/api/payments/paypal/capture-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderID: data.orderID, userEmail: email }),
                      });
                      const details = await res.json();
                      setPaid(true);
                      alert(`✅ Payment completed by ${details.payer.name.given_name}`);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </motion.div>
          ) : (
            // ✅ Success State
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-5"
            >
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              <h2 className="text-3xl font-bold">Payment Successful!</h2>
              <p className="text-white/70">🎉 Your consultation is confirmed. A receipt has been emailed.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Go to Dashboard
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
