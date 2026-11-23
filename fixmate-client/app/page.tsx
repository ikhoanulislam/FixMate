
import Link from "next/link";

const categories = [
  {
    name: "AC & Cooling",
    icon: "❄",
    href: "/services?category=AC%20%26%20Cooling",
  },
  {
    name: "Appliance Repair",
    icon: "⌂",
    href: "/services?category=Appliance%20Repair",
  },
  {
    name: "Electrical",
    icon: "ϟ",
    href: "/services?category=Electrical",
  },
  {
    name: "Plumbing",
    icon: "♧",
    href: "/services?category=Plumbing",
  },
  {
    name: "Cleaning",
    icon: "✦",
    href: "/services?category=Cleaning",
  },
  {
    name: "Electronics",
    icon: "▣",
    href: "/services?category=Electronics",
  },
];

const services = [
  {
    name: "AC Repair & Servicing",
    category: "COOLING & COMFORT",
    icon: "❄",
    image:
      "https://images.unsplash.com/photo-1631545806609-5c3c7c1d6a3b?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Refrigerator Repair",
    category: "HOME APPLIANCES",
    icon: "▣",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Electrical Services",
    category: "HOME ELECTRICAL",
    icon: "ϟ",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Plumbing Services",
    category: "PLUMBING & FIXTURES",
    icon: "♧",
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=85",
  },
];

const steps = [
  {
    number: "01",
    title: "Find your service",
    description:
      "Browse available services and choose exactly what your home needs.",
    icon: "⌕",
  },
  {
    number: "02",
    title: "Book a professional",
    description:
      "Choose a suitable date and send your booking request online.",
    icon: "▦",
  },
  {
    number: "03",
    title: "Enjoy peace of mind",
    description:
      "Track your booking and get your home service completed.",
    icon: "✓",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#101820] text-[#F5F7FA]">
      {/* HERO SECTION */}
      <section className="relative border-b border-white/10">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#B7F34A]/10 blur-[130px]" />

        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#21C7C7]/10 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:px-8 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7F34A]/50 px-4 py-2 text-[11px] font-extrabold tracking-wider text-[#B7F34A]">
              <span className="h-2 w-2 rounded-full bg-[#B7F34A]" />
              A BETTER WAY TO CARE FOR YOUR HOME
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl lg:text-[68px]">
              Your home
              <br />
              deserves the
              <br />
              <span className="text-[#B7F34A]">right care.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              From everyday fixes to essential repairs, find skilled
              home-service professionals and book with confidence.
            </p>

            <form
              action="/services"
              method="GET"
              className="mt-7 flex max-w-xl flex-col gap-2 rounded-2xl border border-[#21C7C7]/50 bg-[#1B2934] p-2 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-3 px-3">
                <span className="text-2xl text-[#21C7C7]">⌕</span>

                <input
                  name="search"
                  type="search"
                  placeholder="What do you need help with?"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#B7F34A] px-6 py-3.5 text-sm font-black text-[#101820] transition hover:bg-[#caff65]"
              >
                Search services ↗
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-300">
              <span>
                <b className="mr-2 text-[#B7F34A]">✓</b>
                Simple booking
              </span>

              <span>
                <b className="mr-2 text-[#B7F34A]">✓</b>
                Skilled technicians
              </span>

              <span>
                <b className="mr-2 text-[#B7F34A]">✓</b>
                Convenient scheduling
              </span>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="relative">
            <div
              className="relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/20 bg-cover bg-center sm:min-h-[490px]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,rgba(10,18,25,.05),rgba(10,18,25,.12) 40%,rgba(10,18,25,.94)),url('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=90')",
              }}
            >
              <span className="absolute left-5 top-5 rounded-full border border-white/30 bg-[#101820]/70 px-4 py-2 text-[10px] font-black tracking-wider backdrop-blur">
                FIXMATE HOME SERVICES
              </span>

              <div className="absolute bottom-7 left-6 right-6">
                <p className="text-xs font-black tracking-widest text-[#B7F34A]">
                  LESS WORRY. MORE COMFORT.
                </p>

                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  We take care
                  <br />
                  of the little things.
                </h2>

                <p className="mt-3 text-sm text-slate-300">
                  Reliable help for the place that matters most.
                </p>

                <Link
                  href="/services"
                  className="mt-5 inline-flex rounded-xl bg-[#B7F34A] px-5 py-3.5 text-sm font-black text-[#101820] transition hover:bg-[#caff65]"
                >
                  Explore services ↗
                </Link>
              </div>
            </div>

            <div className="absolute -bottom-5 right-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#172630] p-3 shadow-xl sm:right-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B7F34A]/20 text-xl text-[#B7F34A]">
                ✓
              </span>

              <div>
                <p className="text-xs font-extrabold">
                  A smoother service experience
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  From booking to completion
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS STRIP */}
      <section className="border-b border-white/10 bg-[#17232D]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-6 sm:grid-cols-4 lg:px-8">
          {[
            ["01", "Easy online booking"],
            ["02", "Service transparency"],
            ["03", "Convenient scheduling"],
            ["04", "Booking status updates"],
          ].map(([number, label]) => (
            <div key={number} className="flex items-center gap-3">
              <span className="text-lg font-black text-[#B7F34A]">
                {number}
              </span>

              <span className="text-xs font-bold text-slate-200 sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[.2em] text-[#21C7C7]">
              FIND WHAT YOU NEED
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Services for every home.
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              One place to find help for your everyday home needs.
            </p>
          </div>

          <Link
            href="/services"
            className="text-sm font-extrabold text-[#B7F34A] transition hover:text-[#21C7C7]"
          >
            Browse all services ↗
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group rounded-2xl border border-white/15 bg-[#192630] p-4 transition hover:-translate-y-1 hover:border-[#21C7C7]/70 hover:bg-[#20323D]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#21C7C7]/10 text-2xl text-[#21C7C7] transition group-hover:bg-[#B7F34A] group-hover:text-[#101820]">
                {category.icon}
              </span>

              <h3 className="mt-3 text-xs font-extrabold sm:text-sm">
                {category.name}
              </h3>

              <p className="mt-3 text-[10px] font-bold text-[#21C7C7]">
                Explore category ↗
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="border-y border-white/10 bg-[#17232D] py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[.2em] text-[#21C7C7]">
                EXPLORE OUR SERVICES
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                A little help goes a long way.
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Explore home services for your everyday needs.
              </p>
            </div>

            <Link
              href="/services"
              className="rounded-xl border border-[#21C7C7]/50 px-4 py-2.5 text-xs font-bold transition hover:bg-[#21C7C7]/10"
            >
              See all services ↗
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.name}
                className="group overflow-hidden rounded-2xl border border-white/15 bg-[#101820] transition hover:-translate-y-1 hover:border-[#21C7C7]/60"
              >
                <Link href="/services" className="block">
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.image}
                      alt={service.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/60 to-transparent" />

                    <span className="absolute left-3 top-3 rounded-full bg-[#101820]/85 px-3 py-1.5 text-[9px] font-black text-[#B7F34A]">
                      {service.category}
                    </span>

                    <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#101820]/80 text-lg text-[#21C7C7]">
                      {service.icon}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-extrabold">
                      {service.name}
                    </h3>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-[10px] font-bold text-slate-400">
                        Explore service
                      </span>

                      <span className="rounded-lg border border-[#B7F34A]/70 px-3 py-2 text-[10px] font-black text-[#B7F34A] transition group-hover:bg-[#B7F34A] group-hover:text-[#101820]">
                        View details ↗
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[.8fr_2fr] md:items-center">
          <div>
            <p className="text-[11px] font-black tracking-[.2em] text-[#21C7C7]">
              A SIMPLE PROCESS
            </p>

            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              Three steps.
              <br />
              One less worry.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Getting the help you need should be the easiest part.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-white/15 bg-[#192630] p-5 transition hover:border-[#21C7C7]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-[#B7F34A]">
                    STEP {step.number}
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#21C7C7]/15 text-xl text-[#21C7C7]">
                    {step.icon}
                  </span>
                </div>

                <h3 className="mt-5 text-sm font-extrabold">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mx-5 mb-16 rounded-3xl border border-[#B7F34A]/40 bg-gradient-to-r from-[#1D3A35] via-[#17323A] to-[#203D35] px-6 py-10 lg:mx-auto lg:max-w-7xl lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <div>
            <p className="text-[10px] font-black tracking-widest text-[#21C7C7]">
              READY WHEN YOU ARE
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Make home care one less thing to worry about.
            </h2>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <p className="max-w-xs text-xs leading-6 text-slate-300">
              Find the right service, book a professional and get back to what
              matters.
            </p>

            <Link
              href="/services"
              className="shrink-0 rounded-xl bg-[#B7F34A] px-6 py-3.5 text-sm font-black text-[#101820] transition hover:bg-[#caff65]"
            >
              Find your service ↗
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
