
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Service = {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  technicianName?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const categories = [
  "Electronics",
  "AC & Cooling",
  "Appliance Repair",
  "Electrical",
  "Plumbing",
  "Cleaning",
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [initialized, setInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Read initial search and category from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const initialSearch = params.get("search") || "";
    const initialCategory = params.get("category") || "";

    setSearch(initialSearch);
    setAppliedSearch(initialSearch);
    setCategory(initialCategory);
    setInitialized(true);
  }, []);

  // Fetch services from backend
  useEffect(() => {
    if (!initialized) return;

    const controller = new AbortController();

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (appliedSearch.trim()) {
          params.set("search", appliedSearch.trim());
        }

        if (category) {
          params.set("category", category);
        }

        if (sort === "price_asc" || sort === "price_desc") {
          params.set("sort", sort);
        }

        const response = await fetch(
          `${API_URL}/services?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Failed to load services."
          );
        }

        setServices(
          Array.isArray(data.services) ? data.services : []
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => controller.abort();
  }, [initialized, appliedSearch, category, sort, retryCount]);

  // Search
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setCategory("");
    setSort("newest");
  };

  // Retry fetching services
  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  return (
    <main className="min-h-screen bg-[#101820] text-[#F5F7FA]">

      {/* PAGE HERO */}
      <section className="border-b border-white/10 bg-[#172630]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <p className="text-xs font-black tracking-[0.2em] text-[#21C7C7]">
            EXPLORE FIXMATE
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Find the right service
            <br />
            for your <span className="text-[#B7F34A]">home.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Browse available home services, compare prices and find the help
            you need.
          </p>

          {/* SEARCH FORM */}
          <form
            onSubmit={handleSearch}
            className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-[#21C7C7]/40 bg-[#101820] p-2 sm:flex-row"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AC repair, plumbing, electrical..."
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              className="rounded-xl bg-[#B7F34A] px-7 py-3 text-sm font-black text-[#101820] hover:bg-[#caff65]"
            >
              Search ↗
            </button>
          </form>
        </div>
      </section>

      {/* SERVICES CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black tracking-widest text-[#21C7C7]">
              OUR SERVICES
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Available services
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {!initialized || loading
                ? "Loading services..."
                : `${services.length} services found`}
            </p>
          </div>

          {/* FILTERS */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#192630] px-4 py-3 text-sm text-white outline-none focus:border-[#21C7C7]"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#192630] px-4 py-3 text-sm text-white outline-none focus:border-[#21C7C7]"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="mt-7 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
              !category
                ? "border-[#B7F34A] bg-[#B7F34A] text-[#101820]"
                : "border-white/15 text-slate-300 hover:border-[#B7F34A]"
            }`}
          >
            All Services
          </button>

          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                category === item
                  ? "border-[#B7F34A] bg-[#B7F34A] text-[#101820]"
                  : "border-white/15 text-slate-300 hover:border-[#B7F34A]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {(!initialized || loading) && (
          <div className="grid gap-5 pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl border border-white/10 bg-[#192630]"
              />
            ))}
          </div>
        )}

        {/* ERROR */}
        {initialized && !loading && error && (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="font-bold text-red-300">{error}</p>

            <p className="mt-2 text-sm text-slate-400">
              Please check that your backend server is running on port 5000.
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 rounded-lg bg-[#B7F34A] px-5 py-2 text-sm font-bold text-[#101820]"
            >
              Try again
            </button>
          </div>
        )}

        {/* SERVICE CARDS */}
        {initialized && !loading && !error && services.length > 0 && (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service._id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#192630] transition duration-300 hover:-translate-y-1 hover:border-[#21C7C7]/50"
              >
                <div className="relative h-52 overflow-hidden bg-[#263744]">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1C3540] to-[#263744]">
                      <span className="text-6xl text-[#21C7C7]">
                        ⌂
                      </span>
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-[#101820]/85 px-3 py-1.5 text-[10px] font-black text-[#B7F34A]">
                    {service.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-extrabold">
                    {service.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] font-bold tracking-widest text-slate-500">
                        STARTING PRICE
                      </p>

                      <p className="mt-1 text-xl font-black text-[#B7F34A]">
                        ${Number(service.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <a
                      href={`/services/${encodeURIComponent(service._id)}`}
                      className="rounded-xl bg-[#B7F34A] px-4 py-3 text-xs font-black text-[#101820] transition hover:bg-[#caff65]"
                    >
                      View Details ↗
                    </a>
                  </div>

                  {service.technicianName && (
                    <p className="mt-4 text-[11px] text-slate-500">
                      Technician: {service.technicianName}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {initialized && !loading && !error && services.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#192630] px-5 py-16 text-center">
            <div className="text-5xl">⌕</div>

            <h3 className="mt-5 text-xl font-black">
              No services found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Try another search or select a different category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-[#B7F34A] px-5 py-3 text-sm font-black text-[#101820]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
