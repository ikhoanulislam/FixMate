
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950">
          ✕
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          Payment Cancelled
        </h1>

        <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">
          Your payment was not completed. No payment has been charged.
          You can return to your bookings and try again whenever you are ready.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/customer/bookings"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to My Bookings
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
