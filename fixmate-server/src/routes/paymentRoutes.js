
import express from "express";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import stripe from "../config/stripe.js";

import {
  verifyToken,
  verifyCustomer,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const getUserId = (user) => String(user?.id || user?._id || "");

const isValidId = (id) =>
  typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

const getClientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, "");

const getCurrency = () =>
  (process.env.STRIPE_CURRENCY || "").trim().toLowerCase();

const getTransactionId = (paymentIntent) => {
  if (typeof paymentIntent === "string") return paymentIntent;
  return paymentIntent?.id || "";
};

// =====================================
// 1. Customer: Create Stripe Checkout
// =====================================

router.post(
  "/checkout-session",
  verifyToken,
  verifyCustomer,
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "Stripe is not configured.",
        });
      }

      const currency = getCurrency();

      if (!/^[a-z]{3}$/.test(currency)) {
        return res.status(503).json({
          success: false,
          message: "Please configure a valid STRIPE_CURRENCY.",
        });
      }

      const { bookingId } = req.body || {};
      const customerId = getUserId(req.user);

      if (!isValidId(bookingId) || !customerId) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking or customer ID.",
        });
      }

      const booking = await Booking.findOne({
        _id: bookingId,
        customer: customerId,
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      if (booking.status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Payment is available only after service completion.",
        });
      }

      if (booking.paymentStatus === "paid") {
        return res.status(400).json({
          success: false,
          message: "This booking has already been paid.",
        });
      }

      const amount = Number(booking.finalAmount);
      const unitAmount = Math.round(amount * 100);

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isSafeInteger(unitAmount) ||
        unitAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking amount.",
        });
      }

      // Find or create one Payment record per booking.
      let payment = await Payment.findOne({
        booking: booking._id,
      });

      if (payment && payment.status === "paid") {
        return res.status(400).json({
          success: false,
          message: "This booking has already been paid.",
        });
      }

      if (!payment) {
        try {
          payment = await Payment.create({
            booking: booking._id,
            customer: customerId,
            technician: String(booking.technician),
            amount,
            status: "pending",
            paymentMethod: "stripe",
          });
        } catch (error) {
          if (error.code !== 11000) throw error;

          payment = await Payment.findOne({
            booking: booking._id,
          });

          if (!payment) throw error;
        }
      }

      if (
        payment.customer !== customerId ||
        payment.status !== "pending"
      ) {
        return res.status(409).json({
          success: false,
          message: "This payment cannot be processed.",
        });
      }

      // Reuse an existing Checkout Session if it is still open.
      // v3 avoids conflicts with previous failed idempotent requests.
      let idempotencyKey =
        `fixmate-checkout-v3-${booking._id}-${payment._id}`;

      if (payment.stripeSessionId) {
        try {
          const existingSession =
            await stripe.checkout.sessions.retrieve(
              payment.stripeSessionId
            );

          if (
            existingSession.status === "open" &&
            existingSession.url
          ) {
            return res.status(200).json({
              success: true,
              message: "Existing checkout session retrieved.",
              url: existingSession.url,
            });
          }

          if (existingSession.status === "complete") {
            return res.status(409).json({
              success: false,
              message:
                "A checkout session has already been completed. Please return to the payment success page.",
            });
          }

          // An expired session needs a new idempotency key.
          idempotencyKey =
            `fixmate-checkout-v3-${booking._id}-${payment._id}-${payment.stripeSessionId}`;
        } catch (error) {
          if (error.statusCode === 404) {
            idempotencyKey =
              `fixmate-checkout-v3-${booking._id}-${payment._id}-${payment.stripeSessionId}`;
          } else {
            throw error;
          }
        }
      }

      const clientUrl = getClientUrl();

      const checkoutSession =
        await stripe.checkout.sessions.create(
          {
            mode: "payment",

            customer_email: booking.customerEmail || undefined,

            line_items: [
              {
                price_data: {
                  currency,
                  product_data: {
                    name: booking.serviceTitle || "FixMate Service",
                    description: `Booking ID: ${booking._id}`,
                  },
                  unit_amount: unitAmount,
                },
                quantity: 1,
              },
            ],

            metadata: {
              bookingId: String(booking._id),
              customerId,
              technicianId: String(booking.technician),
            },

            success_url:
              `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url: `${clientUrl}/payment/cancel`,
          },
          {
            idempotencyKey,
          }
        );

      payment.stripeSessionId = checkoutSession.id;
      payment.amount = amount;
      await payment.save();

      return res.status(201).json({
        success: true,
        message: "Stripe Checkout Session created successfully.",
        url: checkoutSession.url,
      });
    } catch (error) {
      console.error("Create Checkout Session Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create Stripe Checkout Session.",
      });
    }
  }
);

// =====================================
// 2. Customer: Verify Stripe Payment
// =====================================

router.get(
  "/verify-session",
  verifyToken,
  verifyCustomer,
  async (req, res) => {
    let mongoSession;

    try {
      if (!stripe) {
        return res.status(503).json({
          success: false,
          message: "Stripe is not configured.",
        });
      }

      const sessionId = req.query.session_id;
      const customerId = getUserId(req.user);
      const currency = getCurrency();

      if (
        typeof sessionId !== "string" ||
        !sessionId.startsWith("cs_") ||
        !customerId
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid Checkout Session ID.",
        });
      }

      if (!/^[a-z]{3}$/.test(currency)) {
        return res.status(503).json({
          success: false,
          message: "Invalid STRIPE_CURRENCY configuration.",
        });
      }

      // Verify payment directly with Stripe.
      const stripeSession =
        await stripe.checkout.sessions.retrieve(sessionId);

      if (
        stripeSession.payment_status !== "paid" ||
        stripeSession.status !== "complete"
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment has not been completed.",
        });
      }

      const {
        bookingId,
        customerId: sessionCustomerId,
        technicianId,
      } = stripeSession.metadata || {};

      if (
        !isValidId(bookingId) ||
        sessionCustomerId !== customerId ||
        stripeSession.currency !== currency
      ) {
        return res.status(403).json({
          success: false,
          message: "Payment verification failed.",
        });
      }

      const expectedAmount = stripeSession.amount_total;

      if (
        !Number.isSafeInteger(expectedAmount) ||
        expectedAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid Stripe payment amount.",
        });
      }

      const transactionId = getTransactionId(
        stripeSession.payment_intent
      );

      // Find the exact Payment record for this Stripe Session.
      const existingPayment = await Payment.findOne({
        booking: bookingId,
        customer: customerId,
        stripeSessionId: stripeSession.id,
      });

      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found.",
        });
      }

      // Handle repeated verification safely.
      if (existingPayment.status === "paid") {
        const paidBooking = await Booking.findOne({
          _id: bookingId,
          customer: customerId,
          paymentStatus: "paid",
        });

        if (paidBooking) {
          return res.status(200).json({
            success: true,
            message: "Payment has already been verified.",
            amount: existingPayment.amount,
            currency,
            transactionId:
              existingPayment.transactionId || transactionId,
            payment: existingPayment,
            booking: paidBooking,
          });
        }
      }

      // Match Stripe amount with the saved Payment record.
      const expectedPaymentAmount = Math.round(
        Number(existingPayment.amount) * 100
      );

      if (expectedPaymentAmount !== expectedAmount) {
        return res.status(400).json({
          success: false,
          message: "Payment amount does not match the payment record.",
        });
      }

      mongoSession = await mongoose.startSession();

      let result;

      await mongoSession.withTransaction(async () => {
        const booking = await Booking.findOne({
          _id: bookingId,
          customer: customerId,
          status: "completed",
        }).session(mongoSession);

        if (!booking) {
          throw new Error("Completed booking not found.");
        }

        if (
          Math.round(Number(booking.finalAmount) * 100) !==
          expectedAmount
        ) {
          throw new Error("Payment amount does not match the booking.");
        }

        const payment = await Payment.findOne({
          booking: booking._id,
          customer: customerId,
          stripeSessionId: stripeSession.id,
        }).session(mongoSession);

        if (!payment) {
          throw new Error("Payment record not found.");
        }

        if (payment.status === "paid") {
          if (booking.paymentStatus !== "paid") {
            throw new Error("Payment records are inconsistent.");
          }

          result = {
            payment,
            booking,
            alreadyPaid: true,
          };

          return;
        }

        if (payment.status !== "pending") {
          throw new Error("Payment is not in a payable state.");
        }

        if (booking.paymentStatus === "paid") {
          throw new Error("This booking has already been paid.");
        }

        if (
          String(booking.technician) !== String(technicianId)
        ) {
          throw new Error("Technician verification failed.");
        }

        // Update both records atomically.
        booking.paymentStatus = "paid";

        payment.status = "paid";
        payment.transactionId = transactionId;

        await booking.save({ session: mongoSession });
        await payment.save({ session: mongoSession });

        result = {
          payment,
          booking,
          alreadyPaid: false,
        };
      });

      return res.status(200).json({
        success: true,
        message: result?.alreadyPaid
          ? "Payment has already been verified."
          : "Payment verified successfully.",
        amount: result?.payment?.amount,
        currency,
        transactionId:
          result?.payment?.transactionId || transactionId,
        payment: result?.payment,
        booking: result?.booking,
      });
    } catch (error) {
      console.error("Verify Payment Error:", error);

      if (error.message === "Completed booking not found.") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "This booking has already been paid." ||
        error.message === "Payment records are inconsistent."
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    } finally {
      if (mongoSession) {
        await mongoSession.endSession();
      }
    }
  }
);

// =====================================
// 3. Customer: Get Payment History
// =====================================

router.get(
  "/customer",
  verifyToken,
  verifyCustomer,
  async (req, res) => {
    try {
      const customerId = getUserId(req.user);

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID.",
        });
      }

      const payments = await Payment.find({
        customer: customerId,
      })
        .populate("booking", "serviceTitle status paymentStatus")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: payments.length,
        payments,
      });
    } catch (error) {
      console.error("Customer Payment History Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment history.",
      });
    }
  }
);

export default router;
