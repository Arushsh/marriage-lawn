import React from "react";
import { getSiteSettings, getHalls, getPackages } from "@/lib/api";
import { BookingClient } from "./BookingClient";

export const metadata = {
  title: "Online Booking & Availability | Shree Palace Lawn",
  description:
    "Secure your royal wedding date online. Select lawns, catering packages, royal add-ons, transparent server-calculated pricing, and verified advance booking.",
};

export default async function BookPage() {
  const [site, halls, packages] = await Promise.all([
    getSiteSettings(),
    getHalls(),
    getPackages(),
  ]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-accent/60 bg-surface text-accent text-xs uppercase font-semibold tracking-widest mb-4">
            <span>Instant Date Reservation</span>
            <span>◆</span>
            <span>256-bit Secure Verification</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-primary tracking-tight">
            Reserve Your Royal Wedding
          </h1>
          <p className="mt-4 text-muted text-sm sm:text-base leading-relaxed">
            Select your preferred lawn or air-conditioned banquet hall, customize your royal catering menu, and reserve your sacred date with instant advance confirmation.
          </p>
        </div>

        {/* Client Booking Stepper App */}
        <BookingClient site={site} halls={halls} packages={packages} />
      </div>
    </div>
  );
}
