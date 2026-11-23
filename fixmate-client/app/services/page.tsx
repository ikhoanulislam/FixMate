
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

type Category = {
  name: string;
  description: string;
  image: string;
  icon: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const categories: Category[] = [
  {
    name: "Electronics",
    description: "TV, Computer & Electronics Repair",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=700&q=80",
    icon: "💻",
  },
  {
    name: "AC & Cooling",
    description: "AC Repair, Installation & Cleaning",
    image:
      "https://images.unsplash.com/photo-1631545806609-8b4e3f9f5b3d?w=700&q=80",
    icon: "❄️",
  },
  {
    name: "Appliance Repair",
    description: "Fridge, Washing Machine & Microwave",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=700&q=80",
    icon: "🔧",
  },
  {
    name: "Electrical",
    description: "Wiring, Switch & Lighting",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&q=80",
    icon: "💡",
  },
  {
    name: "Plumbing",
    description: "Pipe, Tap & Bathroom Repair",
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=700&q=80",
    icon: "🚿",
  },
  {
    name: "Cleaning",
    description: "Home, Kitchen & Sofa Cleaning",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=700&q=80",
    icon: "🧹",
  },
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

  // Fetch approved services from backend
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

  // Select category
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);

    document.getElementById("available-services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
            Browse available home services, compare prices and find
            the help you need.
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
              className="rounded-xl bg-[#B7F34A] px-7 py-3 text-sm font-black text-[#101820] transition hover:bg-[#caff65]"
            >
              Search ↗
            </button>
          </form>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-8">
        <div className="mb-7">
          <p className="text-xs font-black tracking-widest text-[#21C7C7]">
            BROWSE BY CATEGORY
          </p>

          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">
                Explore Our Categories
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Find the right professionals for every home need.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCategory("")}
              className={`text-sm font-bold transition ${
                !category
                  ? "text-[#B7F34A]"
                  : "text-slate-400 hover:text-[#B7F34A]"
              }`}
            >
              View All Services →
            </button>
          </div>
        </div>

        {/* CATEGORY CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => {
            const isSelected = category === item.name;

            return (
              <button
                type="button"
                key={item.name}
                onClick={() => handleCategorySelect(item.name)}
                aria-pressed={isSelected}
                className={`group relative overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? "border-[#B7F34A] ring-2 ring-[#B7F34A]/30"
                    : "border-white/10 hover:border-[#21C7C7]/60"
                }`}
              >
                <div className="relative h-52 overflow-hidden bg-[#263744]">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#101820] via-[#101820]/30 to-transparent" />

                  <span className="absolute right-4 top-4 rounded-xl border border-white/15 bg-[#101820]/75 px-3 py-2 text-2xl backdrop-blur-sm">
                    {item.icon}
                  </span>

                  {isSelected && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#B7F34A] px-3 py-1.5 text-[10px] font-black text-[#101820]">
                      SELECTED
                    </span>
                  )}

                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-xl font-black text-white">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-200">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#192630] px-5 py-4">
                  <span className="text-xs font-bold text-slate-400">
                    Explore services
                  </span>

                  <span className="text-lg font-bold text-[#B7F34A] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SERVICES CONTENT */}
      <section
        id="available-services"
        className="mx-auto max-w-7xl scroll-mt-8 px-5 py-14 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black tracking-widest text-[#21C7C7]">
              OUR SERVICES
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {category || "Available services"}
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
                <option key={item.name} value={item.name}>
                  {item.name}
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

        {/* ACTIVE FILTER */}
        {category && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#B7F34A]/30 bg-[#B7F34A]/10 px-4 py-2 text-xs font-bold text-[#B7F34A]">
              {category}
            </span>

            <button
              type="button"
              onClick={() => setCategory("")}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Clear category ✕
            </button>
          </div>
        )}

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
              Please check your backend connection and try again.
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
                      loading="lazy"
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
