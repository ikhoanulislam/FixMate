
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PendingService = {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  technicianName?: string;
  technicianEmail?: string;
  createdAt?: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  services?: PendingService[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [technicianEmail, setTechnicianEmail] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Admin access check
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    if (session.user.role !== "admin") {
      if (session.user.role === "technician") {
        router.replace("/dashboard/technician");
      } else if (session.user.role === "customer") {
        router.replace("/dashboard/customer");
      } else {
        router.replace("/sign-in");
      }
    }
  }, [session, isPending, router]);

  // Fetch pending services
  const fetchPendingServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/pending-services`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data: ApiResponse = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Could not load pending services."
        );
      }

      setServices(
        Array.isArray(data.services) ? data.services : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session?.user?.role === "admin") {
      fetchPendingServices();
    }
  }, [isPending, session?.user?.role, fetchPendingServices]);

  // Approve or reject a service
  const handleServiceAction = async (
    serviceId: string,
    action: "approve" | "reject"
  ) => {
    try {
      setActionLoading(serviceId);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/services/${serviceId}/${action}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || `Could not ${action} this service.`
        );
      }

      setMessage(
        action === "approve"
          ? "Service approved successfully."
          : "Service rejected successfully."
      );

      await fetchPendingServices();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setActionLoading("");
    }
  };

  // Assign technician role
  const handleAssignTechnician = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!technicianEmail.trim()) {
      setError("Please enter a technician email.");
      return;
    }

    try {
      setAssignLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/admin/assign-technician`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: technicianEmail.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Could not assign technician role."
        );
      }

      setMessage(
        data.message || "Technician role assigned successfully."
      );
      setTechnicianEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setAssignLoading(false);
    }
  };

  // Access verification screen
  if (isPending || !session?.user || session.user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B7F34A]">
        <p className="animate-pulse font-bold">
          Checking admin access...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#101820] text-[#F5F7FA]">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#0B1219]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="text-2xl font-black">
            Fix<span className="text-[#B7F34A]">Mate</span>
            <span className="ml-2 text-xs font-bold text-slate-500">
              ADMIN
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:block">
              {session.user.name || "Administrator"}
            </span>

            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold hover:border-[#B7F34A] hover:text-[#B7F34A]"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* PAGE TITLE */}
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-[#21C7C7]">
            ADMINISTRATION
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage services, review submissions and manage technician roles.
          </p>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#192630] p-6">
            <p className="text-xs font-bold tracking-widest text-slate-400">
              PENDING SERVICES
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#B7F34A]">
              {services.length}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Services waiting for review
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#192630] p-6">
            <p className="text-xs font-bold tracking-widest text-slate-400">
              ADMIN ACCOUNT
            </p>

            <h2 className="mt-3 text-xl font-black text-[#21C7C7]">
              Active
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Administrator access verified
            </p>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-[#B7F34A]/30 bg-[#B7F34A]/10 p-4 text-sm text-[#B7F34A]">
            {message}
          </div>
        )}

        {/* ASSIGN TECHNICIAN */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-[#192630] p-6 sm:p-8">
          <div>
            <p className="text-xs font-black tracking-widest text-[#21C7C7]">
              USER MANAGEMENT
            </p>

            <h2 className="mt-2 text-xl font-black">
              Assign Technician Role
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Enter an existing customer's email address to assign the technician role.
            </p>
          </div>

          <form
            onSubmit={handleAssignTechnician}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={technicianEmail}
              onChange={(e) => setTechnicianEmail(e.target.value)}
              placeholder="Enter customer email address"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#101820] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#21C7C7]"
            />

            <button
              type="submit"
              disabled={assignLoading}
              className="rounded-xl bg-[#21C7C7] px-6 py-3 text-sm font-black text-[#101820] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assignLoading ? "Assigning..." : "Assign Technician"}
            </button>
          </form>
        </section>

        {/* PENDING SERVICES */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black tracking-widest text-[#21C7C7]">
                SERVICE MANAGEMENT
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Pending Service Requests
              </h2>
            </div>

            <button
              onClick={fetchPendingServices}
              disabled={loading}
              className="rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-slate-300 transition hover:border-[#B7F34A] hover:text-[#B7F34A] disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl border border-white/10 bg-[#192630]"
                />
              ))}
            </div>
          )}

          {/* SERVICE LIST */}
          {!loading && !error && services.length > 0 && (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="rounded-2xl border border-white/10 bg-[#192630] p-6 transition hover:border-[#21C7C7]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[#21C7C7]/10 px-3 py-1.5 text-[10px] font-black text-[#21C7C7]">
                      {service.category}
                    </span>

                    <span className="rounded-full bg-yellow-500/10 px-3 py-1.5 text-[10px] font-bold text-yellow-400">
                      Pending
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    {service.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                    {service.description}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs">
                    <p className="text-slate-400">
                      Technician:{" "}
                      <span className="font-bold text-white">
                        {service.technicianName || "Not provided"}
                      </span>
                    </p>

                    <p className="text-slate-400">
                      Email:{" "}
                      <span className="text-white">
                        {service.technicianEmail || "Not provided"}
                      </span>
                    </p>

                    <p className="text-slate-400">
                      Price:{" "}
                      <span className="font-bold text-[#B7F34A]">
                        ${Number(service.price || 0).toFixed(2)}
                      </span>
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        handleServiceAction(service._id, "approve")
                      }
                      disabled={actionLoading === service._id}
                      className="rounded-xl bg-[#B7F34A] px-4 py-3 text-xs font-black text-[#101820] transition hover:bg-[#caff65] disabled:opacity-50"
                    >
                      {actionLoading === service._id
                        ? "Processing..."
                        : "✓ Approve"}
                    </button>

                    <button
                      onClick={() =>
                        handleServiceAction(service._id, "reject")
                      }
                      disabled={actionLoading === service._id}
                      className="rounded-xl border border-red-500/40 px-4 py-3 text-xs font-black text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && services.length === 0 && (
            <div className="mt-7 rounded-2xl border border-white/10 bg-[#192630] px-5 py-16 text-center">
              <div className="text-5xl">✓</div>

              <h3 className="mt-5 text-xl font-black">
                All caught up!
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                There are no pending services to review right now.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0B1219] px-5 py-6 text-center">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} FixMate Admin Dashboard. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
