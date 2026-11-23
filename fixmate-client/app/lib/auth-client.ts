import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { createAccessControl } from "better-auth/plugins/access";

import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  fixmate: ["access"],
};

const ac = createAccessControl(statement);

const adminRole = ac.newRole({
  ...adminAc.statements,
  fixmate: ["access"],
});

const customerRole = ac.newRole({
  fixmate: ["access"],
});

const technicianRole = ac.newRole({
  fixmate: ["access"],
});

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000",

  fetchOptions: {
    credentials: "include",
  },

  plugins: [
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        customer: customerRole,
        technician: technicianRole,
      },
    }),
  ],
});