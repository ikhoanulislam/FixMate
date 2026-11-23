
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type VerificationResponse = {
  success?: boolean;
  message?: string;
  payment?: {
    amount?: number;
    transactionId?: string;
    status?: string;
  };
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] =
    useState<VerificationResponse["payment"] | null>(null);

  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (isPending) return;

    if (!userId) {
      router.replace("/sign-in");
      return;
    }

    if (userRole !== "customer") {
      router.replace("/dashboard");
      return;
    }

    if (!sessionId) {
      setError("Payment session ID is missing.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `${API_URL}/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data: VerificationResponse = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Payment verification failed."
          );
        }

        setPaymentDetails(data.payment || null);
        setVerified(true);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify your payment."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    verifyPayment();

    return () => controller.abort();
  }, [isPending, userId, userRole, sessionId, router]);

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      return "Not available";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0F1C] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#3282F6]" />

          <p className="mt-5 font-semibold text-[#3282F6]">
            Verifying your payment...
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Please don't close this page.
          </p>
        </div>
      </main>
    );
  }

  if (!userId || userRole !== "customer") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0F1C] text-white">
        Redirecting...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0F1C] px-5 py-10 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-[#374151] bg-[#111827] p-8 text-center sm:p-10">
        {verified ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-5xl text-green-400">
              ✓
            </div>

            <h1 className="mt-7 text-3xl font-black">
              Payment Successful!
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Your payment has been verified successfully.
              Your FixMate booking is now marked as paid.
            </p>

            <div className="mt-8 space-y-4 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Payment Amount
                </p>

                <p className="mt-1 text-2xl font-black text-green-400">
                  {formatCurrency(paymentDetails?.amount)}
                </p>
              </div>

              <div className="border-t border-green-500/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Transaction ID
                </p>

                <p className="mt-2 break-all text-sm font-medium text-white">
                  {paymentDetails?.transactionId || "Not available"}
                </p>
              </div>

              <div className="border-t border-green-500/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Payment Status
                </p>

                <p className="mt-1 font-bold capitalize text-green-400">
                  {paymentDetails?.status || "Paid"}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/customer/bookings"
              className="mt-8 inline-block w-full rounded-xl bg-[#3282F6] px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-600"
            >
              View My Bookings
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-5xl text-red-400">
              !
            </div>

            <h1 className="mt-7 text-2xl font-black">
              Payment Verification Failed
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              {error || "We couldn't verify your payment."}
            </p>

            <p className="mt-3 text-xs text-gray-500">
              If money was deducted, please contact support before
              trying again.
            </p>

            <Link
              href="/dashboard/customer/bookings"
              className="mt-8 inline-block w-full rounded-xl border border-[#374151] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#1F2937]"
            >
              Back to My Bookings
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0A0F1C] px-5 text-white">
          <p className="font-semibold text-[#3282F6]">
            Loading payment status...
          </p>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
