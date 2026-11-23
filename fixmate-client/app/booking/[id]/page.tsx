
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { authClient } from "@/app/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Service = {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  technicianName?: string;
};

type CustomerForm = {
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  service?: Service;
  booking?: {
    _id: string;
  };
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

function getLocalDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function BookingPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params.id;

  const { data: session, isPending: authLoading } =
    authClient.useSession();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<CustomerForm>({
    customerPhone: "",
    address: "",
    preferredDate: "",
    problemDescription: "",
  });

  // Authentication and customer role protection
  useEffect(() => {
    if (authLoading) return;

    if (!session?.user) {
      router.replace(
        `/sign-in?redirect=${encodeURIComponent(`/booking/${id}`)}`
      );
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
    }
  }, [authLoading, session, router, id]);

  // Fetch selected service
  useEffect(() => {
    if (
      authLoading ||
      !session?.user ||
      session.user.role !== "customer"
    ) {
      return;
    }

    if (!id) {
      setError("Invalid service ID.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/services/${encodeURIComponent(id)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const data = await readResponse(response);

        if (!response.ok || !data.success || !data.service) {
          throw new Error(data.message || "Service not found.");
        }

        setService(data.service);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load service information."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchService();

    return () => controller.abort();
  }, [id, authLoading, session]);

  // Handle form changes
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit booking
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting || success) return;

    setError("");

    if (!session?.user || session.user.role !== "customer") {
      setError("Please sign in with a customer account.");
      return;
    }

    if (!service) {
      setError("Service information is unavailable.");
      return;
    }

    if (!form.customerPhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (form.customerPhone.trim().length > 20) {
      setError("Phone number cannot exceed 20 characters.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter your service address.");
      return;
    }

    if (form.address.trim().length > 500) {
      setError("Address cannot exceed 500 characters.");
      return;
    }

    if (!form.preferredDate) {
      setError("Please select your preferred service date.");
      return;
    }

    if (form.preferredDate < getLocalDate()) {
      setError("Please select today or a future date.");
      return;
    }

    if (form.problemDescription.trim().length < 10) {
      setError("Problem description must be at least 10 characters.");
      return;
    }

    if (form.problemDescription.trim().length > 2000) {
      setError("Problem description cannot exceed 2000 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          serviceId: id,
          customerPhone: form.customerPhone.trim(),
          address: form.address.trim(),
          preferredDate: form.preferredDate,
          problemDescription: form.problemDescription.trim(),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok || !data.booking?._id) {
        throw new Error(data.message || "Failed to submit booking.");
      }

      setBookingId(data.booking._id);
      setSuccess(
        "Your booking request has been submitted successfully!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B7F34A]">
        Loading booking form...
      </div>
    );
  }

  // Authentication check
  if (!session?.user || session.user.role !== "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B7F34A]">
        Redirecting...
      </div>
    );
  }

  // Service error
  if (error && !service) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#101820] px-5 text-center text-white">
        <h1 className="text-3xl font-black">Service Not Found</h1>

        <p className="mt-3 text-slate-400">{error}</p>

        <Link
          href="/services"
          className="mt-6 rounded-xl bg-[#B7F34A] px-6 py-3 font-bold text-[#101820]"
        >
          Back to Services
        </Link>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-[#101820] text-[#F5F7FA]">
      {/* Hero */}
      <section className="border-b border-white/10 bg-[#192630]">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-xs font-black tracking-[0.25em] text-[#21C7C7]">
            FIXMATE BOOKING
          </p>

          <h1 className="mt-4 text-3xl font-black sm:text-5xl">
            Book your <span className="text-[#B7F34A]">service.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Tell us what you need. Our technician will review your request.
          </p>
        </div>
      </section>

      {/* Booking Content */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_380px] lg:py-14">
        {/* Booking Form */}
        <div className="rounded-3xl border border-white/10 bg-[#192630] p-6 sm:p-9">
          <div className="mb-8">
            <p className="text-xs font-black tracking-widest text-[#21C7C7]">
              BOOKING DETAILS
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Your information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="mb-4 font-bold">
                01. Customer Information
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Full Name
                  </label>

                  <input
                    id="customerName"
                    value={session.user.name || ""}
                    readOnly
                    className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm text-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customerEmail"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email Address
                  </label>

                  <input
                    id="customerEmail"
                    type="email"
                    value={session.user.email || ""}
                    readOnly
                    className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm text-slate-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="customerPhone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={form.customerPhone}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm outline-none focus:border-[#B7F34A]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Address */}
            <div>
              <h3 className="mb-4 font-bold">
                02. Service Location
              </h3>

              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold"
              >
                Full Address *
              </label>

              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                required
                autoComplete="street-address"
                placeholder="House, road, area, city..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm outline-none focus:border-[#B7F34A]"
              />
            </div>

            <div className="border-t border-white/10" />

            {/* Preferred Date */}
            <div>
              <h3 className="mb-4 font-bold">
                03. Preferred Schedule
              </h3>

              <label
                htmlFor="preferredDate"
                className="mb-2 block text-sm font-semibold"
              >
                Preferred Service Date *
              </label>

              <input
                id="preferredDate"
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                min={getLocalDate()}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm text-white outline-none focus:border-[#B7F34A] sm:max-w-sm"
              />
            </div>

            <div className="border-t border-white/10" />

            {/* Problem Description */}
            <div>
              <h3 className="mb-4 font-bold">
                04. Describe Your Problem
              </h3>

              <label
                htmlFor="problemDescription"
                className="mb-2 block text-sm font-semibold"
              >
                Problem Description *
              </label>

              <textarea
                id="problemDescription"
                name="problemDescription"
                value={form.problemDescription}
                onChange={handleChange}
                rows={5}
                minLength={10}
                maxLength={2000}
                required
                placeholder="Describe your appliance problem..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm outline-none focus:border-[#B7F34A]"
              />
            </div>

            {/* Success Message */}
            {success && (
              <div
                role="status"
                className="rounded-xl border border-[#B7F34A]/30 bg-[#B7F34A]/10 p-4 text-sm text-[#B7F34A]"
              >
                <p className="font-bold">Booking Successful!</p>

                <p className="mt-2">{success}</p>

                {bookingId && (
                  <p className="mt-2 break-all">
                    Booking ID: {bookingId}
                  </p>
                )}

                <Link
                  href="/dashboard/customer"
                  className="mt-4 inline-block font-bold underline"
                >
                  Go to My Dashboard
                </Link>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              >
                {error}
              </p>
            )}

            {/* Information */}
            <div className="rounded-xl border border-[#21C7C7]/20 bg-[#21C7C7]/5 p-4">
              <p className="text-xs leading-6 text-slate-400">
                Your request will be reviewed by the technician. Booking
                confirmation will be available after submission.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || Boolean(success)}
              className="w-full rounded-xl bg-[#B7F34A] px-6 py-4 text-sm font-black text-[#101820] transition hover:bg-[#caff65] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : success
                  ? "Booking Submitted"
                  : "Submit Booking Request ↗"}
            </button>
          </form>
        </div>

        {/* Selected Service */}
        <aside>
          <div className="sticky top-6 overflow-hidden rounded-3xl border border-white/10 bg-[#192630]">
            {service.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.image}
                alt={service.title}
                className="h-52 w-full object-cover"
              />
            ) : (
              <div className="flex h-52 items-center justify-center bg-gradient-to-br from-[#1C3540] to-[#263744]">
                <span className="text-6xl text-[#21C7C7]">⌂</span>
              </div>
            )}

            <div className="p-6">
              <p className="text-xs font-black tracking-widest text-[#21C7C7]">
                YOUR SELECTED SERVICE
              </p>

              <h2 className="mt-3 text-xl font-black">
                {service.title}
              </h2>

              <span className="mt-3 inline-block rounded-full bg-[#B7F34A]/10 px-3 py-1.5 text-xs font-bold text-[#B7F34A]">
                {service.category}
              </span>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                {service.description}
              </p>

              <div className="my-6 border-t border-white/10" />

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">
                  Starting Price
                </span>

                <span className="text-2xl font-black text-[#B7F34A]">
                  ${Number(service.price || 0).toFixed(2)}
                </span>
              </div>

              <div className="my-6 border-t border-white/10" />

              <p className="text-sm font-bold">
                {service.technicianName || "FixMate Technician"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Service Provider
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B7F34A]">
          Loading booking form...
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
