import React from "react";
import type { Metadata } from "next";
import { getSiteSettings, getPaginatedGallery } from "@/lib/api";
import { constructMetadata } from "@/lib/seo";
import { GalleryPageClient } from "./GalleryPageClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return constructMetadata(site, {
    title: `Photo Gallery | ${site.venue_name}`,
    description: `Explore the photo and video gallery of ${site.venue_name}, ${site.city}. View images of our expansive marriage lawn, decorated mandap, air-conditioned banquets, and illuminated evening events.`,
    path: "/gallery",
  });
}

export default async function GalleryPage() {
  const [site, galleryData] = await Promise.all([
    getSiteSettings(),
    getPaginatedGallery(1, "all"),
  ]);

  return (
    <main className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[1120px] mx-auto">
        <GalleryPageClient
          initialImages={galleryData.results}
          initialCount={galleryData.count}
          initialNext={galleryData.next}
          site={site}
        />
      </div>
    </main>
  );
}
