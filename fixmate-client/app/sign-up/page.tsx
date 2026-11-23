
"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "../lib/auth-client";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      if (result.error) {
        setError(
          result.error.message || "Unable to create account."
        );
        return;
      }

      // Verify the newly created user's session
      const sessionResult = await authClient.getSession();

      if (sessionResult.error || !sessionResult.data?.user) {
        setError(
          "Your account was created, but automatic login failed. Please sign in."
        );
        return;
      }

      const user = sessionResult.data.user;

      // Public registration should only create customer accounts.
      if (user.role !== "customer") {
        await authClient.signOut();

        setError(
          "Account role verification failed. Please contact support."
        );
        return;
      }

      // Only allow approved customer destinations.
      const allowedRedirects = ["/services"];

      const destination =
        redirectTo && allowedRedirects.includes(redirectTo)
          ? redirectTo
          : "/services";

      router.replace(destination);
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
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
          JOIN FIXMATE
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Create Account
        </h1>

        <p className="mt-3 text-sm text-slate-400">
          Create your account to book trusted repair services.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              minLength={2}
              className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 outline-none focus:border-[#B7F34A]"
            />
          </div>

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
              autoComplete="email"
              required
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
              placeholder="Minimum 8 characters"
              minLength={8}
              autoComplete="new-password"
              required
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
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-[#B7F34A]"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B7F34A]">
          Loading...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
