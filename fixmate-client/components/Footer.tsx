
import Link from "next/link";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "All Services", href: "/services" },
  { name: "Sign In", href: "/sign-in" },
];

const serviceLinks = [
  { name: "Electrical Services", href: "/services?category=Electrical" },
  { name: "AC & Cooling", href: "/services?category=AC%20%26%20Cooling" },
  { name: "Plumbing", href: "/services?category=Plumbing" },
  { name: "Appliance Repair", href: "/services?category=Appliance%20Repair" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#080D18] text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3282F6] to-[#06B6D4] text-xl font-bold text-white">
                F
              </div>

              <span className="text-2xl font-bold text-white">
                Fix<span className="text-[#3282F6]">Mate</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7">
              Your trusted platform for discovering and booking home services.
              Connect with technicians and make everyday repairs easier.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-gray-300 transition hover:border-[#3282F6] hover:bg-[#3282F6] hover:text-white"
              >
                f
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-gray-300 transition hover:border-[#3282F6] hover:bg-[#3282F6] hover:text-white"
              >
                ig
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-sm font-bold text-gray-300 transition hover:border-[#3282F6] hover:bg-[#3282F6] hover:text-white"
              >
                in
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition hover:pl-1 hover:text-[#3282F6]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-white">
              Our Services
            </h3>

            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition hover:pl-1 hover:text-[#3282F6]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-white">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-[#06B6D4]">✉</span>
                <span>Contact information coming soon</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-[#06B6D4]">⌖</span>
                <span>Bangladesh</span>
              </li>
            </ul>

            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3282F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Explore Services
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs sm:text-sm">
            © 2026 FixMate. All rights reserved.
          </p>

          <p className="text-xs text-gray-500">
            Making home services easier.
          </p>
        </div>
      </div>
    </footer>
  );
}
