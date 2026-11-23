
import express from "express";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

import {
  verifyToken,
  verifyCustomer,
  verifyTechnician,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Better Auth User ID
const getUserId = (user) => String(user?.id || user?._id || "");

// Validate MongoDB ObjectId
const isValidId = (id) =>
  typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

// Validate non-empty string
const isValidString = (value) =>
  typeof value === "string" && value.trim().length > 0;

// Validate preferred date (YYYY-MM-DD)
const parsePreferredDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  // Reject invalid calendar dates
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  // Reject past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return null;
  }

  return date;
};

// =====================================
// 1. Customer: Create Booking
// =====================================

router.post("/", verifyToken, verifyCustomer, async (req, res) => {
  try {
    const {
      serviceId,
      customerPhone,
      address,
      preferredDate,
      problemDescription,
    } = req.body || {};

    // Validate required fields
    if (
      !isValidId(serviceId) ||
      !isValidString(customerPhone) ||
      !isValidString(address) ||
      !isValidString(problemDescription)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking information.",
      });
    }

    // Validate field lengths
    if (customerPhone.trim().length > 20) {
      return res.status(400).json({
        success: false,
        message: "Phone number cannot exceed 20 characters.",
      });
    }

    if (address.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Address cannot exceed 500 characters.",
      });
    }

    if (
      problemDescription.trim().length < 10 ||
      problemDescription.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Problem description must be between 10 and 2000 characters.",
      });
    }

    // Validate preferred date
    const bookingDate = parsePreferredDate(preferredDate);

    if (!bookingDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid future or current date.",
      });
    }

    // Get Customer ID
    const customerId = getUserId(req.user);

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // Find approved and available service
    const service = await Service.findOne({
      _id: serviceId,
      status: "approved",
      isAvailable: { $ne: false },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or unavailable.",
      });
    }

    // Get Technician ID
    const technicianId = String(service.technician || "");

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician information.",
      });
    }

    // Create Booking
    const booking = await Booking.create({
      serviceId: service._id,
      serviceTitle: service.title,
      serviceImage: service.image || "",
      category: service.category,
      basePrice: service.basePrice ?? service.price,

      technician: technicianId,
      technicianName: service.technicianName || "",
      technicianEmail: service.technicianEmail || "",

      customer: customerId,
      customerName: req.user.name || "",
      customerEmail: req.user.email || "",
      customerPhone: customerPhone.trim(),

      address: address.trim(),
      preferredDate: bookingDate,
      problemDescription: problemDescription.trim(),

      status: "requested",
      paymentStatus: "unpaid",
    });

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking.",
    });
  }
});

// =====================================
// 2. Customer: Get Own Bookings
// =====================================

router.get("/customer", verifyToken, verifyCustomer, async (req, res) => {
  try {
    const customerId = getUserId(req.user);

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const bookings = await Booking.find({
      customer: customerId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Customer Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
    });
  }
});

// =====================================
// 3. Customer: Cancel Requested Booking
// =====================================

router.patch(
  "/:id/cancel",
  verifyToken,
  verifyCustomer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = getUserId(req.user);

      if (!isValidId(id) || !customerId) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking or customer ID.",
        });
      }

      const booking = await Booking.findOneAndUpdate(
        {
          _id: id,
          customer: customerId,
          status: "requested",
        },
        {
          $set: { status: "cancelled" },
        },
        { new: true, runValidators: true }
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or cannot be cancelled.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully.",
        booking,
      });
    } catch (error) {
      console.error("Cancel Booking Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to cancel booking.",
      });
    }
  }
);

// =====================================
// 4. Technician: Get Own Booking Requests
// =====================================

router.get(
  "/technician",
  verifyToken,
  verifyTechnician,
  async (req, res) => {
    try {
      const technicianId = getUserId(req.user);

      if (!technicianId) {
        return res.status(400).json({
          success: false,
          message: "Invalid technician ID.",
        });
      }

      const bookings = await Booking.find({
        technician: technicianId,
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } catch (error) {
      console.error("Technician Bookings Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch technician bookings.",
      });
    }
  }
);

// =====================================
// 5. Technician: Update Booking Status
// =====================================

router.patch(
  "/:id/status",
  verifyToken,
  verifyTechnician,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, finalAmount } = req.body || {};

      const technicianId = getUserId(req.user);

      if (!isValidId(id) || !technicianId) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking or technician ID.",
        });
      }

      if (typeof status !== "string") {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid booking status.",
        });
      }

      // Allowed Status Transitions
      const allowedTransitions = {
        requested: ["accepted", "rejected"],
        accepted: ["in-progress"],
        "in-progress": ["completed"],
      };

      const booking = await Booking.findOne({
        _id: id,
        technician: technicianId,
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      const allowedStatuses = allowedTransitions[booking.status] || [];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status transition.",
        });
      }

      // Prepare update data
      const updateData = { status };

      // Validate final amount before completing
      if (status === "completed") {
        const amount = Number(finalAmount);

        if (
          finalAmount === undefined ||
          finalAmount === null ||
          finalAmount === "" ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid final amount greater than 0.",
          });
        }

        updateData.finalAmount = amount;
      }

      booking.set(updateData);
      await booking.save();

      return res.status(200).json({
        success: true,
        message: "Booking status updated successfully.",
        booking,
      });
    } catch (error) {
      console.error("Update Booking Status Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update booking status.",
      });
    }
  }
);

export default router;
