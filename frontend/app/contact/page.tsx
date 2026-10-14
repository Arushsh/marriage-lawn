import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/api";
import { constructMetadata } from "@/lib/seo";
import { ContactSection } from "@/components/sections/ContactSection";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return constructMetadata(site, {
    title: `Contact & Location | ${site.venue_name}`,
    description: `Get in touch with ${site.venue_name} at ${site.city}. View location map, visiting hours, phone numbers, or submit your event enquiry.`,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const site = await getSiteSettings();

  return (
    <div className="w-full min-h-[75vh]">
      <ContactSection site={site} />
    </div>
  );
}
