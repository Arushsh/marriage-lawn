import type { Metadata } from "next";
import { SiteSettings, FAQ } from "@/types/api";

interface MetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function constructMetadata(
  site: SiteSettings,
  options: MetadataOptions = {}
): Metadata {
  const title = options.title || site.meta_title || `${site.venue_name} | Marriage Lawn & Event Venue in ${site.city}`;
  const description = options.description || site.meta_description || site.about_text || site.tagline;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://example.com";
  const url = options.path ? `${siteUrl}${options.path}` : siteUrl;
  const ogImage = options.image || site.hero_image || site.logo;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    robots: options.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: site.venue_name,
      images: ogImage ? [{ url: ogImage }] : [],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export function generateEventVenueSchema(site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: site.venue_name,
    description: site.about_text || site.tagline,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    geo: site.latitude && site.longitude ? {
      "@type": "GeoCoordinates",
      latitude: site.latitude,
      longitude: site.longitude,
    } : undefined,
    aggregateRating: site.rating_value && site.rating_count ? {
      "@type": "AggregateRating",
      ratingValue: site.rating_value,
      reviewCount: site.rating_count,
    } : undefined,
    openingHours: site.opening_hours,
  };
}

export function generateFAQSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (faqs || []).map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
