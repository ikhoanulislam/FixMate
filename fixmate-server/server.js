
import "dotenv/config";

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import connectDB from "./src/config/db.js";
import auth, { mongoClient } from "./src/config/auth.js";

import {
  verifyToken,
  verifyCustomer,
  verifyTechnician,
  verifyAdmin,
} from "./src/middleware/authMiddleware.js";

import adminRoutes from "./src/routes/adminRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// 1. Environment Configuration Check
// =====================================

console.log(
  "STRIPE_CURRENCY:",
  JSON.stringify(process.env.STRIPE_CURRENCY)
);

// =====================================
// 2. CORS Configuration
// =====================================

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

// =====================================
// 3. Better Auth Handler
// =====================================

app.all("/api/auth/{*any}", toNodeHandler(auth));

// =====================================
// 4. JSON Middleware
// =====================================

app.use(express.json());

// =====================================
// 5. API Routes
// =====================================

app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// =====================================
// 6. Home Route
// =====================================

app.get("/", (req, res) => {
  res.status(200).send("FixMate Server is Running!");
});

// =====================================
// 7. Authentication Test
// =====================================

app.get("/api/test/protected", verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authentication successful!",
    user: req.user,
  });
});

// =====================================
// 8. Customer Test
// =====================================

app.get("/api/test/customer", verifyToken, verifyCustomer, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Customer access granted!",
  });
});

// =====================================
// 9. Technician Test
// =====================================

app.get("/api/test/technician", verifyToken, verifyTechnician, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Technician access granted!",
  });
});

// =====================================
// 10. Admin Test
// =====================================

app.get("/api/test/admin", verifyToken, verifyAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin access granted!",
  });
});

// =====================================
// 11. Start Server
// =====================================

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    if (!process.env.BETTER_AUTH_SECRET) {
      throw new Error("BETTER_AUTH_SECRET is missing from .env");
    }

    if (!process.env.BETTER_AUTH_URL) {
      throw new Error("BETTER_AUTH_URL is missing from .env");
    }

    await mongoClient.connect();

    console.log("Better Auth MongoDB Connected");

    await connectDB();

    app.listen(PORT, () => {
      console.log(`FixMate Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    await mongoClient.close().catch(() => {});

    process.exit(1);
  }
};

startServer();
