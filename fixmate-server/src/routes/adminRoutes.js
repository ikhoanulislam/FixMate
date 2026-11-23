
import express from "express";
import mongoose from "mongoose";

import { mongoClient } from "../config/auth.js";
import Service from "../models/Service.js";

import {
  verifyToken,
  verifyAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const db = mongoClient.db();

// =====================================
// 1. Assign Technician Role
// =====================================

router.patch(
  "/assign-technician",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const email = req.body.email?.trim().toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "User email is required.",
        });
      }

      const users = db.collection("user");

      const user = await users.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Only customer accounts can become technicians
      if (user.role !== "customer") {
        return res.status(400).json({
          success: false,
          message:
            "Only customer accounts can be assigned as technicians.",
        });
      }

      // Update role only if the user is still a customer
      const result = await users.updateOne(
        {
          _id: user._id,
          role: "customer",
        },
        {
          $set: {
            role: "technician",
          },
        }
      );

      if (result.modifiedCount !== 1) {
        return res.status(409).json({
          success: false,
          message: "User role could not be updated. Please try again.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Technician role assigned successfully.",
      });
    } catch (error) {
      console.error("Role Assignment Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to assign technician role.",
      });
    }
  }
);

// =====================================
// 2. Get All Pending Services
// =====================================

router.get(
  "/pending-services",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const services = await Service.find({
        status: "pending",
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: services.length,
        services,
      });
    } catch (error) {
      console.error("Get Pending Services Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch pending services.",
      });
    }
  }
);

// =====================================
// 3. Approve Service
// =====================================

router.patch(
  "/services/:id/approve",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service ID.",
        });
      }

      const service = await Service.findOneAndUpdate(
        {
          _id: id,
          status: "pending",
        },
        {
          $set: {
            status: "approved",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Pending service not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Service approved successfully.",
        service,
      });
    } catch (error) {
      console.error("Approve Service Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to approve service.",
      });
    }
  }
);

// =====================================
// 4. Reject Service
// =====================================

router.patch(
  "/services/:id/reject",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service ID.",
        });
      }

      const service = await Service.findOneAndUpdate(
        {
          _id: id,
          status: "pending",
        },
        {
          $set: {
            status: "rejected",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Pending service not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Service rejected successfully.",
        service,
      });
    } catch (error) {
      console.error("Reject Service Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to reject service.",
      });
    }
  }
);

export default router;
