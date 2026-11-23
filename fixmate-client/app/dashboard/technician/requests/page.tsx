
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const PAYMENT_CURRENCY =
  process.env.NEXT_PUBLIC_STRIPE_CURRENCY || "usd";

type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

interface Booking {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  category: string;
  basePrice: number;
  technicianName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount?: number;
  paymentStatus: "paid" | "unpaid";
  createdAt?: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  bookings?: Booking[];
}

const statusStyles: Record<BookingStatus, string> = {
  requested: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
};

function formatCurrency(amount?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: PAYMENT_CURRENCY.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

async function readResponse(
  response: Response
): Promise<ApiResponse> {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    throw new Error("Invalid server response.");
  }
}

export default function TechnicianRequestsPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [finalAmounts, setFinalAmounts] = useState<
    Record<string, string>
  >({});

  // Fetch Technician Bookings
  const fetchBookings = useCallback(
    async (signal?: AbortSignal, showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_URL}/bookings/technician`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal,
          }
        );

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load bookings."
          );
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
            : "Something went wrong. Please try again."
        );
      } finally {
        if (showLoading && !signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Authentication and Technician Role Protection
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const role = session.user.role;

    if (role !== "technician") {
      const roleRoutes: Record<string, string> = {
        admin: "/dashboard/admin",
        customer: "/dashboard/customer",
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
  }, [session, isPending, fetchBookings, router]);

  // Update Booking Status
  const updateStatus = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    if (updatingId) return;

    if (status === "rejected") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this booking?"
      );

      if (!confirmed) return;
    }

    if (status === "completed") {
      const confirmed = window.confirm(
        "Are you sure this job is completed?"
      );

      if (!confirmed) return;
    }

    const body: {
      status: BookingStatus;
      finalAmount?: number;
    } = { status };

    if (status === "completed") {
      const rawAmount = finalAmounts[bookingId];

      if (!rawAmount?.trim()) {
        setError("Please enter the final amount.");
        return;
      }

      const amount = Number(rawAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        setError("Final amount must be greater than zero.");
        return;
      }

      body.finalAmount = amount;
    }

    try {
      setUpdatingId(bookingId);
      setError("");

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Status update failed."
        );
      }

      // Refresh bookings without showing the full-page loader.
      await fetchBookings(undefined, false);

      if (status === "completed") {
        setFinalAmounts((previous) => {
          const updated = { ...previous };
          delete updated[bookingId];
          return updated;
        });
      }

      window.alert(
        data.message || "Booking updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Status update failed."
      );
    } finally {
      setUpdatingId("");
    }
  };

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading booking requests...
        </p>
      </main>
    );
  }

  if (
    !session?.user ||
    session.user.role !== "technician"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading booking requests...
        </p>
      </main>
    );
  }

  const requestedCount = bookings.filter(
    (booking) => booking.status === "requested"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              TECHNICIAN DASHBOARD
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Booking Requests
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your customer service requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchBookings()}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              New Requests
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {requestedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {completedCount}
            </p>
          </div>
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

        {/* Booking List */}
        {bookings.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              No Booking Requests Yet
            </h2>

            <p className="mt-2 text-gray-500">
              New customer bookings will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <article
                key={booking._id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                {/* Booking Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                  <div className="flex items-center gap-4">
                    {booking.serviceImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}

                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {booking.serviceTitle}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {booking.category}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[booking.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {booking.status.replace("-", " ")}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="grid gap-6 p-5 md:grid-cols-2">
                  <section>
                    <h3 className="mb-3 font-semibold text-gray-800">
                      Customer Information
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Name:</strong>{" "}
                        {booking.customerName}
                      </p>

                      <p>
                        <strong>Email:</strong>{" "}
                        {booking.customerEmail}
                      </p>

                      <p>
                        <strong>Phone:</strong>{" "}
                        {booking.customerPhone}
                      </p>

                      <p>
                        <strong>Address:</strong>{" "}
                        {booking.address}
                      </p>

                      <p>
                        <strong>Preferred Date:</strong>{" "}
                        {booking.preferredDate &&
                        !Number.isNaN(
                          Date.parse(booking.preferredDate)
                        )
                          ? new Date(
                              booking.preferredDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 font-semibold text-gray-800">
                      Service Information
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Base Price:</strong>{" "}
                        {formatCurrency(booking.basePrice)}
                      </p>

                      <p>
                        <strong>Problem:</strong>
                      </p>

                      <p className="rounded-lg bg-gray-50 p-3">
                        {booking.problemDescription ||
                          "No description provided."}
                      </p>

                      <p>
                        <strong>Payment:</strong>{" "}
                        <span
                          className={
                            booking.paymentStatus === "paid"
                              ? "font-semibold capitalize text-green-700"
                              : "font-semibold capitalize text-amber-700"
                          }
                        >
                          {booking.paymentStatus || "unpaid"}
                        </span>
                      </p>
                    </div>
                  </section>
                </div>

                {/* Accept / Reject */}
                {booking.status === "requested" && (
                  <div className="flex flex-wrap gap-3 border-t bg-gray-50 p-5">
                    <button
                      type="button"
                      disabled={Boolean(updatingId)}
                      onClick={() =>
                        void updateStatus(
                          booking._id,
                          "accepted"
                        )
                      }
                      className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === booking._id
                        ? "Updating..."
                        : "Accept"}
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(updatingId)}
                      onClick={() =>
                        void updateStatus(
                          booking._id,
                          "rejected"
                        )
                      }
                      className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {updatingId === booking._id
                        ? "Updating..."
                        : "Reject"}
                    </button>
                  </div>
                )}

                {/* Start Work */}
                {booking.status === "accepted" && (
                  <div className="border-t bg-gray-50 p-5">
                    <button
                      type="button"
                      disabled={Boolean(updatingId)}
                      onClick={() =>
                        void updateStatus(
                          booking._id,
                          "in-progress"
                        )
                      }
                      className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updatingId === booking._id
                        ? "Updating..."
                        : "Start Work"}
                    </button>
                  </div>
                )}

                {/* Complete Job */}
                {booking.status === "in-progress" && (
                  <div className="flex flex-wrap items-end gap-3 border-t bg-gray-50 p-5">
                    <div>
                      <label
                        htmlFor={`amount-${booking._id}`}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Final Amount ({PAYMENT_CURRENCY.toUpperCase()})
                      </label>

                      <input
                        id={`amount-${booking._id}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={finalAmounts[booking._id] || ""}
                        onChange={(event) =>
                          setFinalAmounts((previous) => ({
                            ...previous,
                            [booking._id]: event.target.value,
                          }))
                        }
                        placeholder="Enter final amount"
                        className="w-52 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm outline-none [color-scheme:light] focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={Boolean(updatingId)}
                      onClick={() =>
                        void updateStatus(
                          booking._id,
                          "completed"
                        )
                      }
                      className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === booking._id
                        ? "Updating..."
                        : "Complete Job"}
                    </button>
                  </div>
                )}

                {/* Completed */}
                {booking.status === "completed" && (
                  <div className="border-t bg-green-50 p-5 text-sm text-green-800">
                    Job completed. Final Amount:{" "}
                    <strong>
                      {formatCurrency(booking.finalAmount)}
                    </strong>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
