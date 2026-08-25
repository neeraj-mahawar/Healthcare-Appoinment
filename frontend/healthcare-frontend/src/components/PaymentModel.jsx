import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { X, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

const stripePromise = loadStripe("pk_test_51SNECnPwDagNxzCDtsb0u2o92kTxUGqXxpvetWAllIihwqy0RJvjTimygJIzIZLye5VrVs0gkrauSz2T97W1qzpY00LqorhUf0");

export default function PaymentModal({ open, onClose, amount = 500, email = "demo@user.com" }) {
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
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      alert("Stripe Payment Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-white/20 rounded-3xl p-8 w-[90%] max-w-md text-white shadow-[0_0_40px_rgba(0,255,255,0.15)] backdrop-blur-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition"
            >
              <X size={22} />
            </button>

            {!paid ? (
              <div className="text-center">
                <motion.div
                  initial={{ rotate: -15 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-inner"
                >
                  💳
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Secure Payment</h2>
                <p className="text-white/60 mb-5 text-sm">Complete your booking safely</p>

                <div className="bg-white/10 border border-white/20 rounded-xl py-3 mb-5">
                  <p>Amount Due</p>
                  <h3 className="text-4xl font-bold">₹{amount}</h3>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleStripePayment}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 hover:brightness-110 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CreditCard className="h-5 w-5" />Pay with Stripe</>}
                </motion.button>

                <div className="my-4 text-white/50 text-sm">or</div>

                <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                  <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}>
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
                        await fetch("http://localhost:5000/api/payments/paypal/capture-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderID: data.orderID }),
                        });
                        setPaid(true);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4"
              >
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                <p className="text-white/70">Your booking is confirmed 🎉</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={onClose}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition"
                >
                  Close
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
