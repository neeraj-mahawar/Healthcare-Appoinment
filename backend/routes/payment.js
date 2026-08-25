import express from "express";
import {
  createStripeSession,
  createPayPalOrder,
  capturePayPalOrder,
  stripeWebhook
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/stripe/create-session", createStripeSession);
router.post("/paypal/create-order", createPayPalOrder);
router.post("/paypal/capture-order", capturePayPalOrder);
// Stripe webhook (important for confirming payments)
// router.post("/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
