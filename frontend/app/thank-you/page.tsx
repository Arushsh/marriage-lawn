import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/api";
import { constructMetadata } from "@/lib/seo";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return constructMetadata(site, {
    title: `Enquiry Received | ${site.venue_name}`,
    description: `Thank you for contacting ${site.venue_name}. Our event coordinator will get back to you shortly.`,
    path: "/thank-you",
    noIndex: true,
  });
}

export default async function ThankYouPage() {
  const site = await getSiteSettings();
  const whatsappHref = buildWhatsAppUrl(
    site.whatsapp_number,
    buildGeneralInquiryMessage(site.venue_name)
  );

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-20 sm:py-32 px-4 sm:px-8">
      <div className="max-w-[640px] w-full text-center space-y-8 bg-surface p-8 sm:p-14 rounded-2xl border border-black/[0.08]">
        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            Request Received
          </span>
          <h1 className="font-serif text-[28px] sm:text-[40px] text-primary font-normal leading-[1.2]">
            Thank you for reaching out
          </h1>
          <p className="text-[16px] sm:text-[17px] text-text/80 leading-[1.65] max-w-[50ch] mx-auto">
            We have received your enquiry for {site.venue_name}. Our event coordinator will call you shortly to discuss availability, pricing packages, and schedule a personal venue walkthrough.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Return to Home
            </Button>
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="whatsapp" size="md" className="w-full sm:w-auto">
              Chat on WhatsApp
            </Button>
          </a>
        </div>

        <div className="pt-6 border-t border-black/[0.06] text-xs text-muted">
          <p>
            Immediate assistance needed? Call our front desk at{" "}
            <a href={`tel:${site.phone}`} className="text-primary underline">
              +91 {site.phone}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
