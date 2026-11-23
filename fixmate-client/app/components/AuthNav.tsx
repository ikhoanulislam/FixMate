
"use client";

import Link from "next/link";
import { authClient } from "../lib/auth-client";

export default function AuthNav() {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;

  const roleRoutes: Record<string, string> = {
    customer: "/services",
    technician: "/dashboard/technician/requests",
    admin: "/dashboard",
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      window.location.assign("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isPending) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="text-sm font-semibold text-white hover:text-blue-400"
        >
          Sign in
        </Link>

        <Link
          href="/sign-up"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Get started ↗
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-white">
          {user.name || "User"}
        </p>
        <p className="text-xs capitalize text-gray-400">
          {role || "customer"}
        </p>
      </div>

      <Link
        href={roleRoutes[role || ""] || "/services"}
        className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-500 hover:text-white"
      >
        Dashboard
      </Link>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
