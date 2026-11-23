
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Booking {
  _id: string;
  status: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  basePrice?: number;
  image?: string;
  estimatedDuration?: string;
  serviceMode?: "onsite" | "remote" | "both";
  serviceArea?: string;
  status: "pending" | "approved" | "rejected";
  isAvailable?: boolean;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  bookings?: Booking[];
  services?: Service[];
  service?: Service;
}

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  price: string;
  image: string;
  estimatedDuration: string;
  serviceMode: "onsite" | "remote" | "both";
  serviceArea: string;
}

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  image: "",
  estimatedDuration: "",
  serviceMode: "onsite",
  serviceArea: "",
};

async function readResponse(response: Response): Promise<ApiResponse> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function TechnicianDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [serviceMessage, setServiceMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const fetchBookings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/bookings/technician`, {
        credentials: "include",
        cache: "no-store",
        signal,
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error ? err.message : "Failed to load bookings."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      setServiceLoading(true);

      const response = await fetch(`${API_URL}/services/my`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your services.");
      }

      setServices(Array.isArray(data.services) ? data.services : []);
    } catch (err) {
      setServiceMessage(
        err instanceof Error ? err.message : "Failed to load services."
      );
    } finally {
      setServiceLoading(false);
    }
  }, []);

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
    void fetchServices();

    return () => controller.abort();
  }, [session, isPending, router, fetchBookings, fetchServices]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setServiceMessage("");
    setShowForm(true);
  };

  const openEditForm = (service: Service) => {
    setEditingId(service._id);
    setForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: String(service.basePrice ?? service.price),
      image: service.image || "",
      estimatedDuration: service.estimatedDuration || "",
      serviceMode: service.serviceMode || "onsite",
      serviceArea: service.serviceArea || "",
    });
    setServiceMessage("");
    setShowForm(true);
  };

  const handleFormChange = (
    field: keyof ServiceForm,
    value: string
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleServiceSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    setServiceMessage("");

    try {
      const url = editingId
        ? `${API_URL}/services/${editingId}`
        : `${API_URL}/services`;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          basePrice: Number(form.price),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to save service.");
      }

      setServiceMessage(data.message || "Service saved successfully.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchServices();
    } catch (err) {
      setServiceMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  if (isPending || !session?.user || session.user.role !== "technician") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading Technician Dashboard...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading Technician Dashboard...</p>
      </main>
    );
  }

  const totalBookings = bookings.length;
  const newRequests = bookings.filter(
    (booking) => booking.status === "requested"
  ).length;
  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      description: "All your booking requests",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "New Requests",
      value: newRequests,
      description: "Waiting for your response",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Completed Jobs",
      value: completedJobs,
      description: "Successfully completed jobs",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const statusStyle: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">FIXMATE</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Technician Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome, {session.user.name || "Technician"}! Manage your
              bookings and services.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void fetchBookings();
              void fetchServices();
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                <span className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {stat.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {stat.description}
              </p>
            </div>
          ))}
        </section>

        {/* Service Management */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                My Services
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage your service listings.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Add New Service
            </button>
          </div>

          {serviceMessage && (
            <p role="status" className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              {serviceMessage}
            </p>
          )}

          {/* Add / Edit Form */}
          {showForm && (
            <form
              onSubmit={handleServiceSubmit}
              className="mt-6 space-y-4 rounded-xl border border-blue-200 bg-blue-50/40 p-5"
            >
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Service" : "Add New Service"}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Service Title *
                  <input
                    required
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="e.g. AC Repair Service"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Category *
                  <input
                    required
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                    placeholder="e.g. AC & Cooling"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Price (USD) *
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    placeholder="e.g. 50"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Estimated Duration
                  <input
                    value={form.estimatedDuration}
                    onChange={(e) => handleFormChange("estimatedDuration", e.target.value)}
                    placeholder="e.g. 2 hours"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  />
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Service Mode
                  <select
                    value={form.serviceMode}
                    onChange={(e) =>
                      handleFormChange("serviceMode", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="both">Both</option>
                  </select>
                </label>

                <label className="text-sm font-medium text-gray-700">
                  Service Area
                  <input
                    value={form.serviceArea}
                    onChange={(e) => handleFormChange("serviceArea", e.target.value)}
                    placeholder="e.g. Gopalganj"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Image URL
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => handleFormChange("image", e.target.value)}
                  placeholder="https://example.com/service-image.jpg"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Description *
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Describe your service..."
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Service" : "Submit Service"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500">
                New and edited services will be submitted for Admin approval.
              </p>
            </form>
          )}

          {/* Services List */}
          <div className="mt-6">
            {serviceLoading ? (
              <p className="py-8 text-center text-gray-500">
                Loading your services...
              </p>
            ) : services.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <h3 className="font-semibold text-gray-800">
                  No Services Yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Click Add New Service to publish your first service listing.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {services.map((service) => (
                  <article
                    key={service._id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="mb-4 h-40 w-full rounded-lg object-cover"
                      />
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {service.title}
                      </h3>

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle[service.status] || "bg-gray-100 text-gray-700"}`}>
                        {service.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {service.category}
                    </p>

                    <p className="mt-3 text-sm text-gray-600">
                      {service.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-lg font-bold text-blue-700">
                        ${Number(service.basePrice ?? service.price).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => openEditForm(service)}
                        className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Edit Service
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <p className="mt-2 text-gray-600">
            Manage customer requests and track your work.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/dashboard/technician/requests"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              View Booking Requests
            </Link>

            <Link
              href="/services"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Browse Services
            </Link>
          </div>
        </section>

        {/* Booking Overview */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Booking Overview
          </h2>

          <p className="mt-2 text-gray-600">
            You currently have {totalBookings} booking(s).
          </p>

          {totalBookings === 0 ? (
            <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No bookings found yet. New customer requests will appear here.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">
                <span className="font-medium text-gray-700">
                  Pending Requests
                </span>
                <span className="font-bold text-amber-700">
                  {newRequests}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
                <span className="font-medium text-gray-700">
                  Completed Jobs
                </span>
                <span className="font-bold text-green-700">
                  {completedJobs}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
