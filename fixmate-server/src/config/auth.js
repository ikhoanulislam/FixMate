
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { admin as adminPlugin } from "better-auth/plugins";

import { createAccessControl } from "better-auth/plugins/access";

import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/admin/access";

// =====================================
// 1. MongoDB Connection
// =====================================

export const mongoClient = new MongoClient(
  process.env.MONGODB_URI
);

const db = mongoClient.db();

// =====================================
// 2. FixMate Role & Access Control
// =====================================

const statement = {
  ...defaultStatements,
  fixmate: ["access"],
};

const ac = createAccessControl(statement);

// Admin Role
const adminRole = ac.newRole({
  ...adminAc.statements,
  fixmate: ["access"],
});

// Customer Role
const customerRole = ac.newRole({
  fixmate: ["access"],
});

// Technician Role
const technicianRole = ac.newRole({
  fixmate: ["access"],
});

// =====================================
// 3. Better Auth Configuration
// =====================================

const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
  ],

  emailAndPassword: {
    enabled: true,
  },

  // Additional User Fields
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },

      area: {
        type: "string",
        required: false,
      },

      bio: {
        type: "string",
        required: false,
      },
    },
  },

  // Role Management
  plugins: [
    adminPlugin({
      defaultRole: "customer",

      ac,

      roles: {
        admin: adminRole,
        customer: customerRole,
        technician: technicianRole,
      },
    }),
  ],
});

export default auth;
