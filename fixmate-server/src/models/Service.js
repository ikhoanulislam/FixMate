
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    // Service Information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    basePrice: {
      type: Number,
      min: 0,
    },

    // Service Details
    estimatedDuration: {
      type: String,
      default: "",
      trim: true,
    },

    serviceMode: {
      type: String,
      enum: ["onsite", "remote", "both"],
      default: "onsite",
    },

    serviceArea: {
      type: String,
      default: "",
      trim: true,
    },

    // Technician Information
    // Better Auth user ID is stored as a String
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

    // Approval Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Database Indexes
serviceSchema.index({ status: 1, isAvailable: 1 });
serviceSchema.index({ technician: 1, createdAt: -1 });
serviceSchema.index({ category: 1 });

const Service =
  mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);

export default Service;
