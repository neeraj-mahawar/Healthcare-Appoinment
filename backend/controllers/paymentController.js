import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// ========== STRIPE INIT ==========
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// ========== PAYPAL INIT ==========
const environment =
  process.env.PAYPAL_MODE === "live"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );
const client = new paypal.core.PayPalHttpClient(environment);

// ========== NODEMAILER ==========
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

// ========== EMAIL TEMPLATE ==========
const paymentSuccessTemplate = (
  userEmail,
  amount,
  method,
  transactionId = "AUTO_GEN_TXN"
) => `
<div style="margin:0;padding:0;background:#f4fbf9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:30px 10px;">
        <table width="680" cellspacing="0" cellpadding="0" border="0"
          style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;
          box-shadow:0 6px 30px rgba(0,0,0,0.08);border:1px solid #eaf2ef;">
          <tr>
            <td bgcolor="#00bfa6"
              style="background:linear-gradient(135deg,#00bfa6,#00a2e0);
              padding:40px 30px;color:#ffffff;">
              <h1 style="margin:0;font-size:26px;font-weight:700;">Payment Confirmed 💳</h1>
              <p style="margin:6px 0 0;font-size:15px;opacity:0.95;">Your transaction was successful! 🎉</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;color:#1a1a1a;">
              <p style="font-size:16px;margin:0 0 10px;">Dear <strong>${userEmail}</strong>,</p>
              <p style="font-size:15px;color:#555;margin-bottom:25px;line-height:1.6;">
                We’ve successfully received your payment for your online consultation. 
                Thank you for choosing <strong>HealthPrime</strong>.
              </p>
              <table width="100%" cellspacing="0" cellpadding="0" border="0"
                style="margin-bottom:25px;background:#f8fffb;border:1px solid #def3ed;border-radius:14px;">
                <tr>
                  <td style="padding:18px;font-size:15px;color:#222;">
                    💰 <strong>Amount Paid:</strong> ₹${amount}<br/>
                    🆔 <strong>Transaction ID:</strong> ${transactionId}<br/>
                    💳 <strong>Payment Method:</strong> ${method}
                  </td>
                </tr>
              </table>
              <div style="text-align:center;margin-top:30px;">
                <a href="${process.env.CLIENT_URL}/dashboard"
                  style="font-size:16px;font-weight:600;text-decoration:none;color:#fff;
                  background:linear-gradient(90deg,#00bfa6,#00a2e0);
                  padding:14px 38px;border-radius:50px;display:inline-block;">
                  🎥 Join Video Consultation
                </a>
              </div>
              <p style="font-size:13px;color:#777;margin-top:30px;text-align:center;">
                Keep this email as proof of your payment and appointment confirmation.
              </p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#f9fafb"
              style="padding:18px 20px;border-top:1px solid #edf1f2;
              text-align:center;font-size:13px;color:#666;">
              © ${new Date().getFullYear()} <strong>HealthPrime</strong> • 
              <a href="${process.env.CLIENT_URL}/privacy"
                style="color:#00a2e0;text-decoration:none;">Privacy</a> • 
              <a href="${process.env.CLIENT_URL}/support"
                style="color:#00a2e0;text-decoration:none;">Support</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
`;

// ========== STRIPE: CREATE SESSION ==========
export const createStripeSession = async (req, res) => {
  try {
    const { amount, currency = "inr", userEmail } = req.body;

    if (!amount || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Consultation Payment" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/patient?tab=book-appointment&payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/patient?tab=book-appointment&payment=failed`,

    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("❌ Stripe Session Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ========== STRIPE: WEBHOOK ==========
export const stripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;
      const amount = session.amount_total / 100;

      // Send Confirmation Email
      await transporter.sendMail({
        from: `"HealthPrime" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "✅ Payment Confirmed - HealthPrime",
        html: paymentSuccessTemplate(email, amount, "Stripe", session.id),
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Stripe Webhook Error:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// ========== PAYPAL: CREATE ORDER ==========
export const createPayPalOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount required" });
    }

    const order = new paypal.orders.OrdersCreateRequest();
    order.prefer("return=representation");
    order.requestBody({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
    });

    const response = await client.execute(order);
    res.json({ id: response.result.id });
  } catch (error) {
    console.error("❌ PayPal Create Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ========== PAYPAL: CAPTURE ORDER ==========
export const capturePayPalOrder = async (req, res) => {
  try {
    const { orderID, userEmail } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const response = await client.execute(request);

    const amount =
      response.result.purchase_units[0].payments.captures[0].amount.value;
    const txn = response.result.id;

    await transporter.sendMail({
      from: `"HealthPrime" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: "✅ Payment Confirmed - HealthPrime",
      html: paymentSuccessTemplate(userEmail, amount, "PayPal", txn),
    });

    res.json(response.result);
  } catch (error) {
    console.error("❌ PayPal Capture Error:", error);
    res.status(500).json({ error: error.message });
  }
};
