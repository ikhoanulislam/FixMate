
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Booking = {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  technicianName?: string;
  preferredDate?: string;
  basePrice?: number;
  finalAmount?: number;
  status: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  bookings?: Booking[];
};

async function readResponse(response: Response): Promise<ApiResponse> {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    throw new Error("Invalid server response.");
  }
}

function formatDate(date?: string) {
  if (!date) return "Date not specified";

  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not specified";
  }

  return parsedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount?: number) {
  const value = Number(amount ?? 0);

  if (!Number.isFinite(value)) return "$0.00";

  return `$${value.toFixed(2)}`;
}

function formatStatus(status: string) {
  return status.replace(/-/g, " ");
}

export default function CustomerDashboard() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/bookings/customer`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your bookings.");
      }

      setBookings(
        Array.isArray(data.bookings) ? data.bookings : []
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Customer role protection and booking fetch
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const role = session.user.role;

    if (role !== "customer") {
      const roleRoutes: Record<string, string> = {
        admin: "/dashboard/admin",
        technician: "/dashboard/technician",
      };

      const destination = role ? roleRoutes[role] : undefined;

      router.replace(destination || "/sign-in");
      return;
    }

    const controller = new AbortController();

    void fetchBookings(controller.signal);

    return () => {
      controller.abort();
    };
  }, [session, isPending, router, fetchBookings]);

  // Authentication loading
  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Checking your account...</p>
      </main>
    );
  }

  // Redirecting unauthorized users
  if (!session?.user || session.user.role !== "customer") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting...</p>
      </main>
    );
  }

  // Booking loading
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading your dashboard...</p>
      </main>
    );
  }

  const totalRequests = bookings.length;

  const activeJobs = bookings.filter((booking) =>
    ["requested", "accepted", "in-progress"].includes(
      booking.status
    )
  ).length;

  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const stats = [
    {
      title: "Total Requests",
      value: totalRequests,
      description: "All your service requests",
      icon: "📋",
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Active Jobs",
      value: activeJobs,
      description: "Currently active requests",
      icon: "🔧",
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      title: "Completed Jobs",
      value: completedJobs,
      description: "Successfully completed",
      icon: "✅",
      color: "text-green-600",
      background: "bg-green-50",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Welcome, {session.user.name || "Customer"}!
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your repair requests and track your jobs.
            </p>
          </div>

          <Link
            href="/services"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Book a Service
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <p className={`mt-3 text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${stat.background}`}
                >
                  {stat.icon}
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void fetchBookings()}
              disabled={loading}
              className="mt-2 font-semibold underline disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}

        {/* Recent Bookings */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Track your latest service requests.
              </p>
            </div>

            <Link
              href="/dashboard/customer/bookings"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mb-4 text-5xl">🛠️</div>

              <h3 className="text-lg font-semibold text-gray-800">
                No Bookings Yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                You haven't requested any repair services yet.
              </p>

              <Link
                href="/services"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {booking.serviceImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle || "Service"}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                        🔧
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {booking.serviceTitle || "Service"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Technician: {booking.technicianName || "Not assigned"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(booking.preferredDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                      {formatStatus(booking.status || "requested")}
                    </span>

                    <span className="font-semibold text-gray-800">
                      {formatAmount(
                        booking.finalAmount ?? booking.basePrice
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Links */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href="/dashboard/customer/bookings"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="text-2xl">📋</div>

            <h3 className="mt-3 font-bold text-gray-900">
              My Bookings
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View and manage all your service requests.
            </p>
          </Link>

          <Link
            href="/dashboard/customer/payments"
            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="text-2xl">💳</div>

            <h3 className="mt-3 font-bold text-gray-900">
              Payment History
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Check your previous transactions.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
