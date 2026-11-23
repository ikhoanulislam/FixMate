
import auth from "../config/auth.js";
import { fromNodeHeaders } from "better-auth/node";

// =====================================
// 1. Verify User Authentication
// =====================================

export const verifyToken = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Attach authenticated user and session
    req.user = session.user;
    req.session = session.session;

    return next();
  } catch (error) {
    console.error("Authentication Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify authentication.",
    });
  }
};

// =====================================
// 2. Verify User Role
// =====================================

const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permission.",
      });
    }

    return next();
  };
};

// =====================================
// 3. Role-based Middleware
// =====================================

export const verifyCustomer = verifyRole("customer");

export const verifyTechnician = verifyRole("technician");

export const verifyAdmin = verifyRole("admin");
