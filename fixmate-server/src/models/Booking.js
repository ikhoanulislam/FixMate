
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Service Information
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    serviceTitle: {
      type: String,
      required: true,
      trim: true,
    },

    serviceImage: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Technician Information
    technician: {
      type: String,
      required: true,
    },

    technicianName: {
      type: String,
      default: "",
      trim: true,
    },

    technicianEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    // Customer Information
    customer: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    // Booking Information
    address: {
      type: String,
      required: true,
      trim: true,
    },

    preferredDate: {
      type: Date,
      required: true,
    },

    problemDescription: {
      type: String,
      required: true,
      trim: true,
    },

    // Booking Status
    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "in-progress",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "requested",
    },

    // Payment Information
    finalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

// Database Indexes
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ technician: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;
