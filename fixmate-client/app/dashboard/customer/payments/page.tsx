
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const PAYMENT_CURRENCY = (
  process.env.NEXT_PUBLIC_STRIPE_CURRENCY || "USD"
).toUpperCase();

type Payment = {
  _id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  booking?: {
    serviceTitle?: string;
    status?: string;
    paymentStatus?: string;
  };
};

type PaymentsResponse = {
  success?: boolean;
  payments?: Payment[];
  message?: string;
};

export default function CustomerPaymentsPage() {
  const { data: session, isPending } = authClient.useSession();

  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!userId) {
      setLoading(false);
      setError("Please sign in to view your payment history.");
      return;
    }

    if (userRole !== "customer") {
      setLoading(false);
      setError("Only customers can view payment history.");
      return;
    }

    const controller = new AbortController();

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/payments/customer`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const data: PaymentsResponse = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load payments.");
        }

        setPayments(data.payments || []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPayments();

    return () => controller.abort();
  }, [userId, userRole, isPending]);

  const totalPaid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + payment.amount, 0);

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: PAYMENT_CURRENCY,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusStyle = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      case "refunded":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          Loading payment history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>

        {!userId && (
          <Link
            href="/sign-in"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Payment History
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and track all your service payments.
        </p>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Transactions
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {payments.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Paid
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {formatAmount(totalPaid)}
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mb-4 text-5xl">💳</div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No Payments Yet
            </h3>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Your completed service payments will appear here.
            </p>

            <Link
              href="/services"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {payment.booking?.serviceTitle || "Service Booking"}

                      {payment.transactionId && (
                        <p className="mt-1 text-xs text-gray-500">
                          Transaction: {payment.transactionId}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {formatAmount(payment.amount)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(payment.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
