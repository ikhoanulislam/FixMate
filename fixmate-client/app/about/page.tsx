
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Explore Services",
    description:
      "Browse available home services and find the one that matches your needs.",
    icon: "⌕",
  },
  {
    number: "02",
    title: "Submit a Booking",
    description:
      "Choose a service, provide your details and submit a booking request.",
    icon: "▤",
  },
  {
    number: "03",
    title: "Get Connected",
    description:
      "Follow your booking status and connect with the assigned technician.",
    icon: "↗",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#101820] text-[#F5F7FA]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#172630]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#21C7C7]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#B7F34A]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <p className="text-xs font-black tracking-[0.25em] text-[#21C7C7]">
            ABOUT FIXMATE
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Making home services
            <span className="text-[#B7F34A]"> easier </span>
            for everyone.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-400 sm:text-base">
            FixMate is a home service platform designed to connect customers
            with technicians. Our goal is to make finding and booking everyday
            home services simple and convenient.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/services"
              className="rounded-xl bg-[#B7F34A] px-7 py-4 text-sm font-black text-[#101820] transition hover:bg-[#caff65]"
            >
              Explore Services ↗
            </Link>

            <Link
              href="/sign-up"
              className="rounded-xl border border-white/20 px-7 py-4 text-sm font-bold text-white transition hover:border-[#21C7C7] hover:text-[#21C7C7]"
            >
              Join FixMate
            </Link>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-[#21C7C7]">
            WHO WE ARE
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Your home service,
            <span className="text-[#B7F34A]"> simplified.</span>
          </h2>

          <p className="mt-6 text-sm leading-8 text-slate-400">
            Finding a reliable technician for home repairs can be challenging.
            FixMate aims to simplify that experience through a single platform
            where customers can discover available services and submit booking
            requests.
          </p>

          <p className="mt-4 text-sm leading-8 text-slate-400">
            We also provide technicians with an opportunity to showcase their
            services and connect with customers who need their skills.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#192630] p-8 sm:p-12">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#21C7C7]/10 blur-2xl" />

          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#B7F34A] text-3xl font-black text-[#101820]">
              F
            </div>

            <h3 className="mt-7 text-2xl font-black">
              Fix<span className="text-[#B7F34A]">Mate</span>
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Connecting people with the right home service professionals,
              one booking at a time.
            </p>

            <div className="mt-8 h-1.5 w-24 rounded-full bg-[#B7F34A]" />
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="border-y border-white/10 bg-[#172630]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black tracking-[0.2em] text-[#21C7C7]">
              OUR PURPOSE
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              What drives us
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-[#101820] p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B7F34A]/10 text-2xl text-[#B7F34A]">
                ◎
              </div>

              <h3 className="mt-6 text-2xl font-black">Our Mission</h3>

              <p className="mt-4 text-sm leading-8 text-slate-400">
                To make home service discovery and booking easier by connecting
                customers with service providers through a convenient digital
                platform.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#101820] p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#21C7C7]/10 text-2xl text-[#21C7C7]">
                ◈
              </div>

              <h3 className="mt-6 text-2xl font-black">Our Vision</h3>

              <p className="mt-4 text-sm leading-8 text-slate-400">
                To build a convenient and accessible home service ecosystem
                where customers can find help and skilled technicians can
                connect with more opportunities.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black tracking-[0.2em] text-[#21C7C7]">
            SIMPLE PROCESS
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            How FixMate works
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Finding a home service should not be complicated. Here is how
            customers can get started.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-3xl border border-white/10 bg-[#192630] p-8 transition hover:-translate-y-1 hover:border-[#21C7C7]/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-[#B7F34A]">
                  {step.number}
                </span>

                <span className="text-3xl text-[#21C7C7]">
                  {step.icon}
                </span>
              </div>

              <h3 className="mt-8 text-xl font-black">{step.title}</h3>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* WHO CAN USE FIXMATE */}
      <section className="border-y border-white/10 bg-[#172630]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black tracking-[0.2em] text-[#21C7C7]">
              BUILT FOR BOTH SIDES
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              One platform, two opportunities
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-[#101820] p-8">
              <div className="text-4xl">⌂</div>

              <h3 className="mt-6 text-2xl font-black">For Customers</h3>

              <ul className="mt-6 space-y-4 text-sm text-slate-400">
                <li>✓ Discover available home services</li>
                <li>✓ Compare service descriptions and prices</li>
                <li>✓ Submit service booking requests</li>
                <li>✓ Track booking progress</li>
              </ul>

              <Link
                href="/services"
                className="mt-8 inline-block rounded-xl bg-[#B7F34A] px-6 py-3 text-sm font-black text-[#101820] transition hover:bg-[#caff65]"
              >
                Find a Service ↗
              </Link>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#101820] p-8">
              <div className="text-4xl">⚒</div>

              <h3 className="mt-6 text-2xl font-black">For Technicians</h3>

              <ul className="mt-6 space-y-4 text-sm text-slate-400">
                <li>✓ Submit services for admin review</li>
                <li>✓ Manage customer booking requests</li>
                <li>✓ Update booking progress</li>
                <li>✓ Connect with customers</li>
              </ul>

              <p className="mt-8 text-xs leading-6 text-slate-500">
                Technician registration will be available through the
                dedicated technician registration flow.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#B7F34A] px-7 py-14 text-center text-[#101820] sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-black sm:text-4xl">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#101820]/70">
              Discover services, connect with technicians and make your home
              service experience simpler with FixMate.
            </p>

            <Link
              href="/services"
              className="mt-8 inline-block rounded-xl bg-[#101820] px-8 py-4 text-sm font-black text-white transition hover:bg-[#263744]"
            >
              Explore Services ↗
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
