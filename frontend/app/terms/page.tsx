import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/api";
import { constructMetadata } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return constructMetadata(site, {
    title: `Terms & Conditions | ${site.venue_name}`,
    description: `Booking terms, payment schedule, and cancellation policy for events at ${site.venue_name}, ${site.city}.`,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const site = await getSiteSettings();

  return (
    <main className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[720px] mx-auto space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back to Home
          </Link>
          <h1 className="font-serif text-[28px] sm:text-[40px] text-primary font-normal leading-[1.2]">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-muted mt-2">
            Effective Date: October 2026 • {site.venue_name}, {site.city}
          </p>
        </div>

        <div className="space-y-8 text-[15px] sm:text-[16px] text-text/85 leading-[1.75]">
          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              1. Bookings &amp; Reservations
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-text/80">
              <li>
                A date is reserved only after the booking is confirmed on this
                website or agreed with our team in writing (phone/WhatsApp
                confirmation or email).
              </li>
              <li>
                Online bookings are held per hall and time slot. Our system
                prevents double-booking of the same hall and slot — if a date
                shows available, the reservation is secured the moment your
                advance payment is verified.
              </li>
              <li>
                Bookings pending advance payment are not guaranteed and may be
                released if the advance is not completed promptly.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              2. Payment Schedule
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-text/80">
              <li>
                A 30% advance of the total estimated amount is required to
                confirm a booking and block the date.
              </li>
              <li>
                The balance is payable as per the schedule agreed in your
                booking confirmation, and in full before the event.
              </li>
              <li>
                Prices quoted are indicative and the final amount depends on
                package, guest count, catering selections, decor, applicable
                taxes (including GST), and seasonal dates.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              3. Cancellation &amp; Refunds
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-text/80">
              <li>
                Cancellation requests must be made in writing (email or
                WhatsApp to our official number).
              </li>
              <li>
                The advance payment is non-refundable if the cancellation is
                made less than 60 days before the event date.
              </li>
              <li>
                For cancellations made more than 60 days before the event, a
                service charge may be deducted from the refundable portion.
              </li>
              <li>
                Refunds, where applicable, are processed to the original
                payment method within 10–15 working days.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              4. Catering &amp; External Vendors
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-text/80">
              <li>
                Menu selections and final guest counts should be confirmed
                within the timelines shared at booking; later changes may be
                subject to availability.
              </li>
              <li>
                Outside caterers or vendors are permitted only with prior
                approval and may attract additional charges.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              5. Venue Rules
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-text/80">
              <li>
                Guests are requested to respect the premises. The venue
                reserves the right to stop any activity that may cause damage
                or safety risk.
              </li>
              <li>
                Music and event timings must comply with local regulations and
                the slot timings of your booking.
              </li>
              <li>
                The venue is not responsible for personal belongings or
                valuables brought by guests or vendors.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              6. Contact
            </h2>
            <p>
              For any questions about these terms, call{" "}
              <a href={`tel:${site.phone}`} className="text-primary hover:underline">
                {site.phone}
              </a>{" "}
              or message us on{" "}
              <a
                href={`https://wa.me/${site.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp
              </a>
              . These terms are governed by the laws of India with jurisdiction
              in {site.city}, Uttar Pradesh.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
