
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

type Booking = {
  _id: string;
  serviceTitle?: string;
  serviceImage?: string;
  status: string;
  paymentStatus?: "unpaid" | "paid";
  preferredDate?: string;
  address?: string;
  problemDescription?: string;
  finalAmount?: number;
  createdAt?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  bookings?: Booking[];
};

type CheckoutResponse = {
  success?: boolean;
  message?: string;
  url?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    requested: "bg-yellow-500/10 text-yellow-400",
    accepted: "bg-blue-500/10 text-blue-400",
    rejected: "bg-red-500/10 text-red-400",
    "in-progress": "bg-cyan-500/10 text-cyan-400",
    completed: "bg-green-500/10 text-green-400",
    cancelled: "bg-gray-500/10 text-gray-400",
  };

  return styles[status] || "bg-gray-500/10 text-gray-400";
}

function formatDate(date?: string) {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount?: number) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CustomerBookingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [payingBookingId, setPayingBookingId] = useState<string | null>(
    null
  );

  const fetchBookings = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/bookings/customer`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal,
        });

        const data: ApiResponse = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load your bookings.");
        }

        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // =====================================
  // Authentication
  // =====================================

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    if (session.user.role !== "customer") {
      router.replace("/dashboard");
      return;
    }

    const controller = new AbortController();

    fetchBookings(controller.signal);

    return () => controller.abort();
  }, [session, isPending, router, fetchBookings]);

  // =====================================
  // Stripe: Pay Now
  // =====================================

  const handlePayment = async (bookingId: string) => {
    try {
      setPaymentError("");
      setPayingBookingId(bookingId);

      const response = await fetch(
        `${API_URL}/payments/checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bookingId }),
        }
      );

      const data: CheckoutResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !data.success || !data.url) {
        throw new Error(
          data.message || "Unable to start payment. Please try again."
        );
      }

      // Redirect to Stripe Checkout
      window.location.assign(data.url);
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : "Payment could not be started."
      );

      setPayingBookingId(null);
    }
  };

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0F1C] text-white">
        <p className="animate-pulse font-semibold text-[#3282F6]">
          Loading your bookings...
        </p>
      </main>
    );
  }

  if (!session?.user || session.user.role !== "customer") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0F1C] text-white">
        Redirecting...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0F1C] px-5 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#06B6D4]">
              CUSTOMER DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-black">
              My Bookings
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Track and manage your service bookings.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fetchBookings()}
              disabled={loading || payingBookingId !== null}
              className="rounded-xl border border-[#374151] px-4 py-3 text-sm font-bold transition hover:bg-[#1F2937] disabled:opacity-50"
            >
              Refresh
            </button>

            <Link
              href="/services"
              className="rounded-xl bg-[#3282F6] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
            >
              + Book Service
            </Link>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-sm text-red-400">{error}</p>

            <button
              onClick={() => fetchBookings()}
              className="mt-3 text-sm font-bold text-white underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* PAYMENT ERROR */}
        {paymentError && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-sm text-red-400">{paymentError}</p>
          </div>
        )}

        {/* BOOKING COUNT */}
        {!error && (
          <div className="mt-8 rounded-2xl border border-[#374151] bg-[#111827] p-5">
            <p className="text-sm text-gray-400">Total Bookings</p>

            <p className="mt-2 text-3xl font-black text-[#3282F6]">
              {bookings.length}
            </p>
          </div>
        )}

        {/* BOOKING LIST */}
        {!error && (
          <section className="mt-8">
            {bookings.length === 0 ? (
              <div className="rounded-3xl border border-[#374151] bg-[#111827] px-5 py-16 text-center">
                <div className="text-5xl">📋</div>

                <h2 className="mt-5 text-xl font-black">
                  No Bookings Yet
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  You haven't booked any services yet.
                </p>

                <Link
                  href="/services"
                  className="mt-6 inline-block rounded-xl bg-[#3282F6] px-6 py-3 text-sm font-bold text-white hover:bg-blue-600"
                >
                  Explore Services
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map((booking) => {
                  const canPay =
                    booking.status === "completed" &&
                    booking.paymentStatus === "unpaid";

                  const isPaid = booking.paymentStatus === "paid";

                  return (
                    <article
                      key={booking._id}
                      className="rounded-2xl border border-[#374151] bg-[#111827] p-5 transition hover:border-[#3282F6]/50 sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-bold">
                            {booking.serviceTitle || "Service Booking"}
                          </h2>

                          <p className="mt-2 text-xs text-gray-500">
                            Booking ID: {booking._id}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${getStatusStyle(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace("-", " ")}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 border-t border-[#374151] pt-5 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-gray-500">
                            Preferred Date
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatDate(booking.preferredDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Final Amount
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatCurrency(booking.finalAmount)}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500">
                            Service Address
                          </p>

                          <p className="mt-1 text-sm text-gray-300">
                            {booking.address || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {booking.problemDescription && (
                        <div className="mt-4 rounded-xl bg-[#0A0F1C] p-4">
                          <p className="text-xs text-gray-500">
                            Problem Description
                          </p>

                          <p className="mt-2 text-sm text-gray-300">
                            {booking.problemDescription}
                          </p>
                        </div>
                      )}

                      {/* PAYMENT STATUS */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#374151] pt-5">
                        <div>
                          <p className="text-xs text-gray-500">
                            Payment Status
                          </p>

                          <p
                            className={`mt-1 text-sm font-bold ${
                              isPaid
                                ? "text-green-400"
                                : canPay
                                  ? "text-yellow-400"
                                  : "text-gray-400"
                            }`}
                          >
                            {isPaid
                              ? "Paid"
                              : canPay
                                ? "Unpaid"
                                : "Payment Pending"}
                          </p>
                        </div>

                        {canPay && (
                          <button
                            onClick={() => handlePayment(booking._id)}
                            disabled={payingBookingId !== null}
                            className="rounded-xl bg-[#3282F6] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {payingBookingId === booking._id
                              ? "Redirecting to Payment..."
                              : "Pay Now →"}
                          </button>
                        )}

                        {isPaid && (
                          <span className="rounded-xl bg-green-500/10 px-5 py-3 text-sm font-bold text-green-400">
                            ✓ Payment Completed
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* BACK LINK */}
        <div className="mt-8">
          <Link
            href="/dashboard/customer"
            className="text-sm font-semibold text-[#06B6D4] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
