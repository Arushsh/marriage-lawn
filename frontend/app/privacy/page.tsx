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
    title: `Privacy Policy | ${site.venue_name}`,
    description: `Privacy policy and personal data collection guidelines for ${site.venue_name}, ${site.city}.`,
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-muted mt-2">
            Effective Date: October 2026 • {site.venue_name}, {site.city}
          </p>
        </div>

        <div className="space-y-8 text-[15px] sm:text-[16px] text-text/85 leading-[1.75]">
          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              1. What Information We Collect
            </h2>
            <p>
              When you submit an enquiry through our website or contact us via
              WhatsApp/phone, we collect the details you provide to us voluntarily:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-text/80">
              <li>Full Name</li>
              <li>10-digit Mobile Phone Number</li>
              <li>Estimated Event Date and Event Type (e.g. Wedding, Reception)</li>
              <li>Approximate Guest Count Range</li>
              <li>Optional notes, questions, or specific venue requirements</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              2. Why We Collect This Information
            </h2>
            <p>
              We collect your event information solely for genuine business
              communication and customer service purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-text/80">
              <li>To verify date availability on our booking calendar</li>
              <li>To provide custom package quotes and pricing estimates</li>
              <li>To schedule in-person venue visits and guided walkthroughs</li>
              <li>To coordinate booking confirmations and receipts</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              3. Who Sees Your Information
            </h2>
            <p>
              Your personal information is strictly accessible only by the
              internal event coordinators and management team of{" "}
              <strong>{site.venue_name}</strong>.
            </p>
            <p>
              We do not sell, rent, trade, or distribute your personal details to
              third-party telemarketers, advertising networks, or unauthorized vendors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[20px] sm:text-[24px] text-text font-normal leading-[1.25]">
              4. How to Request Deletion
            </h2>
            <p>
              You have the right at any time to request that we delete or update
              your contact information from our database. To do so, please
              contact us directly:
            </p>
            <div className="bg-surface p-5 rounded-xl border border-black/[0.08] text-sm space-y-1.5">
              <p>
                <strong>Venue:</strong> {site.venue_name}
              </p>
              <p>
                <strong>Address:</strong> {site.address || `${site.city}, Uttar Pradesh`}
              </p>
              <p>
                <strong>Phone / WhatsApp:</strong>{" "}
                <a href={`tel:${site.phone}`} className="text-primary underline">
                  +91 {site.phone}
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
