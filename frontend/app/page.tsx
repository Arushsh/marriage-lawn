import React from "react";
import {
  getSiteSettings,
  getHalls,
  getFacilities,
  getPackages,
  getGalleryImages,
  getVideos,
  getReviews,
  getFAQs,
  getMenu,
} from "@/lib/api";
import { generateFAQSchema } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { HighlightsStrip } from "@/components/sections/HighlightsStrip";
import { AboutSection } from "@/components/sections/AboutSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { FacilitiesSection } from "@/components/sections/FacilitiesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { MenuSection } from "@/components/sections/MenuSection";
import { BookingFlow } from "@/components/sections/BookingFlow";
import { Lawn360ViewSection } from "@/components/sections/Lawn360ViewSection";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  // Fetch all live data in parallel from the Django API backend
  const [
    site,
    halls,
    facilities,
    packages,
    galleryImages,
    videos,
    reviews,
    faqs,
    menuCategories,
  ] = await Promise.all([
    getSiteSettings(),
    getHalls(),
    getFacilities(),
    getPackages(),
    getGalleryImages(),
    getVideos(),
    getReviews(),
    getFAQs(),
    getMenu(),
  ]);

  const faqSchema = generateFAQSchema(faqs);

  return (
    <div className="w-full">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {/* 6.1 Hero Section */}
      <Hero site={site} halls={halls} />

      {/* 6.2 Quick Highlights Strip */}
      <HighlightsStrip halls={halls} facilities={facilities} />

      {/* 6.3 About the Venue */}
      <AboutSection site={site} />

      {/* 6.4 Photo & Video Gallery with Tabs and Lightbox */}
      <GallerySection images={galleryImages} videos={videos} />

      {/* 6.5 Facilities and Capacity Grid */}
      <FacilitiesSection halls={halls} facilities={facilities} />

      {/* 6.5b Interactive 360° Virtual Lawn Tour */}
      <Lawn360ViewSection />

      {/* 6.6 Packages and Pricing Cards */}
      <PackagesSection packages={packages} site={site} />

      {/* 6.7 Featured Royal Catering Menu */}
      <MenuSection categories={menuCategories} />

      {/* 6.8 to 6.13 Availability Calendar + How It Works + Reviews + FAQ + Contact + Final CTA */}
      <BookingFlow site={site} reviews={reviews} faqs={faqs} />
    </div>
  );
}
