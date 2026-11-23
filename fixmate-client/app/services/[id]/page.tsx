
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

type Service = {
  _id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  basePrice?: number;
  image?: string;
  technicianName?: string;
  technicianEmail?: string;
  estimatedDuration?: string;
  serviceMode?: string;
  serviceArea?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function ServiceDetailsContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: session, isPending: authLoading } =
    authClient.useSession();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/services/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success || !data?.service) {
          throw new Error(data?.message || "Service not found.");
        }

        setService(data.service);
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchService();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101820] text-white">
        <p className="animate-pulse text-lg font-bold text-[#B7F34A]">
          Loading service details...
        </p>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#101820] px-5 text-center text-white">
        <h1 className="text-3xl font-black">Service Not Found</h1>

        <p className="mt-3 text-sm text-slate-400">
          {error || "This service is not available."}
        </p>

        <Link
          href="/services"
          className="mt-6 rounded-xl bg-[#B7F34A] px-6 py-3 font-bold text-[#101820]"
        >
          Back to Services
        </Link>
      </main>
    );
  }

  const finalPrice = Number(service.basePrice ?? service.price ?? 0);

  const isLoggedIn = Boolean(session?.user);

  const bookingUrl = `/booking/${service._id}`;

  const signInUrl = `/sign-in?redirect=${encodeURIComponent(bookingUrl)}`;

  return (
    <main className="min-h-screen bg-[#101820] text-[#F5F7FA]">

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        <div className="text-xs text-slate-500">
          <Link href="/" className="hover:text-[#B7F34A]">
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link href="/services" className="hover:text-[#B7F34A]">
            Services
          </Link>

          <span className="mx-2">/</span>

          <span className="text-[#B7F34A]">
            {service.title}
          </span>
        </div>
      </div>

      {/* DETAILS */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-14">

        {/* LEFT SIDE */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#192630]">
            {service.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.image}
                alt={service.title}
                className="h-[300px] w-full object-cover sm:h-[430px]"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center bg-gradient-to-br from-[#1C3540] to-[#263744] sm:h-[430px]">
                <span className="text-7xl text-[#21C7C7]">⌂</span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <span className="rounded-full bg-[#B7F34A]/10 px-4 py-2 text-xs font-black text-[#B7F34A]">
              {service.category}
            </span>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              {service.title}
            </h1>

            <p className="mt-5 text-sm leading-8 text-slate-400">
              {service.description}
            </p>
          </div>

          {/* SERVICE INFORMATION */}
          <div className="mt-9">
            <h2 className="text-xl font-black">
              Service Information
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-[#192630] p-5">
                <p className="text-xs text-slate-500">
                  Service Category
                </p>
                <p className="mt-2 font-bold">
                  {service.category}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#192630] p-5">
                <p className="text-xs text-slate-500">
                  Service Mode
                </p>
                <p className="mt-2 font-bold">
                  {service.serviceMode || "Onsite"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#192630] p-5">
                <p className="text-xs text-slate-500">
                  Estimated Duration
                </p>
                <p className="mt-2 font-bold">
                  {service.estimatedDuration || "To be confirmed"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#192630] p-5">
                <p className="text-xs text-slate-500">
                  Service Area
                </p>
                <p className="mt-2 font-bold">
                  {service.serviceArea || "To be confirmed"}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <aside>
          <div className="sticky top-6 rounded-3xl border border-white/10 bg-[#192630] p-6 sm:p-8">

            <p className="text-xs font-black tracking-widest text-[#21C7C7]">
              SERVICE PRICE
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#B7F34A]">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(finalPrice)}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Starting price. Final amount may depend on the work required.
            </p>

            <div className="my-7 border-t border-white/10" />

            <h3 className="text-lg font-black">
              Technician Information
            </h3>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#21C7C7]/15 text-2xl text-[#21C7C7]">
                ♙
              </div>

              <div>
                <p className="font-bold">
                  {service.technicianName || "FixMate Technician"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Service provider
                </p>
              </div>
            </div>

            <div className="my-7 border-t border-white/10" />

            <div className="space-y-4 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-400">Service</span>
                <span className="font-bold">Available</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Payment</span>
                <span className="font-bold">Stripe</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Booking</span>
                <span className="font-bold">Online</span>
              </div>

            </div>

            {/* AUTHENTICATION BASED BOOKING */}
            {authLoading ? (
              <div className="mt-8 rounded-xl bg-slate-600 px-5 py-4 text-center text-sm font-bold text-white">
                Checking account...
              </div>
            ) : (
              <Link
                href={isLoggedIn ? bookingUrl : signInUrl}
                className="mt-8 block rounded-xl bg-[#B7F34A] px-5 py-4 text-center text-sm font-black text-[#101820] transition hover:bg-[#caff65]"
              >
                {isLoggedIn
                  ? "Book This Service ↗"
                  : "Sign In to Book ↗"}
              </Link>
            )}

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
              {authLoading
                ? "Please wait while we check your account."
                : isLoggedIn
                  ? "Continue to book this service."
                  : "Sign in to continue with your booking."}
            </p>

          </div>
        </aside>
      </section>
    </main>
  );
}

export default function ServiceDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B7F34A]">
          Loading service details...
        </main>
      }
    >
      <ServiceDetailsContent />
    </Suspense>
  );
}
