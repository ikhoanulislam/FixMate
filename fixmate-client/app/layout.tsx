
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FixMate | Home Services Made Easier",
    template: "%s | FixMate",
  },
  description:
    "Discover and book reliable home services with FixMate. Connect with technicians for electrical, plumbing, AC repair and more.",
  applicationName: "FixMate",
  keywords: [
    "FixMate",
    "Home Services",
    "Technician",
    "AC Repair",
    "Electrical Services",
    "Plumbing",
    "Home Repair Bangladesh",
  ],
  authors: [{ name: "FixMate" }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex flex-1 flex-col">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
