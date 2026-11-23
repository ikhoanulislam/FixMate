
import express from "express";
import mongoose from "mongoose";

import Service from "../models/Service.js";

import {
  verifyToken,
  verifyTechnician,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getTechnicianId = (user) =>
  String(user?.id || user?._id || "");

const allowedModes = ["onsite", "remote", "both"];

const validateServiceData = (body) => {
  const {
    title,
    description,
    category,
    price,
    basePrice,
    serviceMode,
  } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof category !== "string" ||
    !category.trim()
  ) {
    return "Please provide title, description and category.";
  }

  const rawPrice = basePrice ?? price;
  const numericPrice = Number(rawPrice);

  if (
    rawPrice === undefined ||
    rawPrice === null ||
    rawPrice === "" ||
    !Number.isFinite(numericPrice) ||
    numericPrice <= 0
  ) {
    return "Please provide a valid price greater than 0.";
  }

  if (
    serviceMode !== undefined &&
    !allowedModes.includes(serviceMode)
  ) {
    return "Invalid service mode.";
  }

  return null;
};

const buildServiceData = (body) => {
  const price = Number(body.basePrice ?? body.price);

  return {
    title: body.title.trim(),
    description: body.description.trim(),
    category: body.category.trim(),
    price,
    basePrice: price,
    image:
      typeof body.image === "string" ? body.image.trim() : "",
    estimatedDuration:
      typeof body.estimatedDuration === "string"
        ? body.estimatedDuration.trim()
        : "",
    serviceMode: body.serviceMode || "onsite",
    serviceArea:
      typeof body.serviceArea === "string"
        ? body.serviceArea.trim()
        : "",
  };
};

// =====================================
// 1. Get All Approved Services (Public)
// =====================================

router.get("/", async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {
      status: "approved",
      isAvailable: { $ne: false },
    };

    if (typeof search === "string" && search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (typeof category === "string" && category.trim()) {
      filter.category = {
        $regex: `^${escapeRegex(category.trim())}$`,
        $options: "i",
      };
    }

    let sortOption = { createdAt: -1 };

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const services = await Service.find(filter)
      .sort(sortOption)
      .lean();

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get Services Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch services.",
    });
  }
});

// =====================================
// 2. Get Technician's Own Services
// =====================================

router.get(
  "/my",
  verifyToken,
  verifyTechnician,
  async (req, res) => {
    try {
      const technicianId = getTechnicianId(req.user);

      if (!technicianId) {
        return res.status(401).json({
          success: false,
          message: "Invalid technician account.",
        });
      }

      const services = await Service.find({
        technician: technicianId,
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: services.length,
        services,
      });
    } catch (error) {
      console.error("Get My Services Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch your services.",
      });
    }
  }
);

// =====================================
// 3. Get Single Approved Service
// =====================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findOne({
      _id: id,
      status: "approved",
      isAvailable: { $ne: false },
    }).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get Single Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch service.",
    });
  }
});

// =====================================
// 4. Technician Creates a Service
// =====================================

router.post(
  "/",
  verifyToken,
  verifyTechnician,
  async (req, res) => {
    try {
      const validationError = validateServiceData(req.body);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const technicianId = getTechnicianId(req.user);

      if (!technicianId) {
        return res.status(401).json({
          success: false,
          message: "Invalid technician account.",
        });
      }

      const service = await Service.create({
        ...buildServiceData(req.body),
        technician: technicianId,
        technicianName: req.user.name || "",
        technicianEmail: req.user.email || "",
        status: "pending",
        isAvailable: true,
      });

      return res.status(201).json({
        success: true,
        message: "Service submitted for admin approval.",
        service,
      });
    } catch (error) {
      console.error("Create Service Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create service.",
      });
    }
  }
);

// =====================================
// 5. Technician Updates Own Service
// =====================================

router.patch(
  "/:id",
  verifyToken,
  verifyTechnician,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service ID.",
        });
      }

      const validationError = validateServiceData(req.body);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const technicianId = getTechnicianId(req.user);

      const service = await Service.findOne({
        _id: id,
        technician: technicianId,
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found or access denied.",
        });
      }

      Object.assign(service, buildServiceData(req.body));

      // Edited services require admin approval again.
      service.status = "pending";
      service.isAvailable = true;

      await service.save();

      return res.status(200).json({
        success: true,
        message: "Service updated and submitted for admin approval.",
        service,
      });
    } catch (error) {
      console.error("Update Service Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update service.",
      });
    }
  }
);

export default router;
