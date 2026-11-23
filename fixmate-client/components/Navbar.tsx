
"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
];

const dashboardRoutes: Record<string, string> = {
  admin: "/dashboard/admin",
  technician: "/dashboard/technician",
  customer: "/dashboard/customer",
};

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const role = user?.role || "";
  const dashboardLink = dashboardRoutes[role] || "/dashboard";

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      await authClient.signOut();

      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0F1C]/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3282F6] to-[#06B6D4] text-xl font-bold text-white shadow-lg shadow-blue-500/20">
            F
          </div>

          <span className="text-xl font-bold tracking-tight text-white">
            Fix<span className="text-[#3282F6]">Mate</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#3282F6]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
          ) : user ? (
            <>
              <Link
                href={dashboardLink}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-[#3282F6] hover:text-white"
              >
                Dashboard
              </Link>

              <div className="flex items-center gap-3">
                <span className="max-w-32 truncate text-sm text-gray-300">
                  {user.name || user.email}
                </span>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                >
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-300 transition hover:text-white"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-[#3282F6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white transition hover:bg-white/10 md:hidden"
        >
          {mobileMenuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#0A0F1C] px-4 py-5 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive(link.href)
                    ? "bg-[#3282F6]/10 text-[#3282F6]"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="my-2 border-t border-white/10" />

            {isPending ? (
              <p className="px-4 py-3 text-sm text-gray-400">
                Loading account...
              </p>
            ) : user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-white">
                    {user.name || "Welcome"}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    {user.email}
                  </p>
                </div>

                <Link
                  href={dashboardLink}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-gray-200 transition hover:bg-white/5"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="rounded-lg bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-[#3282F6] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#0A0F1C]" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
