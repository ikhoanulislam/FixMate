
"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "../lib/auth-client";

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        setError(
          result.error.message || "Invalid email or password."
        );
        return;
      }

      // Verify login session
      const sessionResult = await authClient.getSession();

      if (sessionResult.error || !sessionResult.data?.user) {
        await authClient.signOut();

        setError(
          "Unable to verify your login session. Please try again."
        );
        return;
      }

      const user = sessionResult.data.user;
      const role =
        typeof user.role === "string" ? user.role : "";

      // Default destination for each role
      const roleRoutes: Record<string, string> = {
        customer: "/services",
        technician: "/dashboard/technician/requests",
        admin: "/dashboard",
      };

      const roleHome = roleRoutes[role];

      if (!roleHome) {
        await authClient.signOut();
        setError("Your account has an invalid role.");
        return;
      }

      // Validate requested redirect
      let destination = roleHome;

      if (redirectTo) {
        if (role === "customer") {
          const isBookingRoute =
            /^\/booking\/[a-fA-F0-9]{24}$/.test(redirectTo);

          if (redirectTo === "/services" || isBookingRoute) {
            destination = redirectTo;
          }
        }

        if (
          role === "technician" &&
          redirectTo === "/dashboard/technician/requests"
        ) {
          destination = redirectTo;
        }

        if (role === "admin" && redirectTo === "/dashboard") {
          destination = redirectTo;
        }
      }

      // Navigate after successful authentication
      window.location.replace(destination);
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101820] px-5 py-12 text-[#F5F7FA]">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#192630] p-7 shadow-2xl sm:p-10">
        <Link href="/" className="text-2xl font-black">
          Fix<span className="text-[#B7F34A]">Mate</span>
        </Link>

        <p className="mt-10 text-xs font-black tracking-[0.25em] text-[#21C7C7]">
          WELCOME BACK
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Sign in to FixMate
        </h1>

        <p className="mt-3 text-sm text-slate-400">
          Access your account and manage your repair bookings.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 outline-none focus:border-[#B7F34A]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 outline-none focus:border-[#B7F34A]"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#B7F34A] py-4 font-black text-[#101820] transition hover:bg-[#caff65] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Back to{" "}
          <Link href="/" className="font-bold text-[#B7F34A]">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B7F34A]">
          Loading...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
