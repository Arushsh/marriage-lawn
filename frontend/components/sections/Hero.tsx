"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SiteSettings, Hall } from "@/types/api";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";
import { FadeUp } from "@/components/ui/FadeUp";

interface HeroProps {
  site: SiteSettings;
  halls?: Hall[];
}

export const Hero: React.FC<HeroProps> = ({ site, halls = [] }) => {
  const maxCapacity = halls.reduce(
    (max, h) => Math.max(max, h.floating_capacity || h.seating_capacity || 0),
    0
  );
  const capacityText =
    maxCapacity > 0
      ? `Capacity up to ${maxCapacity.toLocaleString()} guests`
      : "Spacious lawn and banquet hall";

  const whatsappHref = buildWhatsAppUrl(
    site.whatsapp_number,
    buildGeneralInquiryMessage(site.venue_name)
  );

  return (
    <section
      id="home"
      className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center bg-stone-950 overflow-hidden"
    >
      {/* Background Image / Video */}
      <div className="absolute inset-0 z-0">
        {site.hero_video_url ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster={site.hero_image || undefined}
          >
            <source src={site.hero_video_url} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={
              site.hero_image ||
              "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80"
            }
            alt={site.venue_name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
      </div>

      {/* Solid Dark Contrast Overlay to guarantee 4.5:1 text readability */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      {/* Hero Content: strictly <= 3 elements below headline */}
      <div className="relative z-10 max-w-[1120px] mx-auto px-4 sm:px-8 py-24 sm:py-32 text-center text-white">
        <FadeUp>
          {/* Headline */}
          <h1 className="font-serif text-[40px] sm:text-[64px] font-normal leading-[1.2] text-white max-w-4xl mx-auto">
            {site.venue_name}
          </h1>

          {/* Element 1: One plain fact line (max 60ch) */}
          <p className="mt-4 text-[16px] sm:text-[17px] text-stone-200 font-normal leading-[1.65] max-w-[60ch] mx-auto">
            Wedding lawn and air-conditioned banquet hall in {site.city}. {capacityText}.
          </p>

          {/* Element 2: Exactly two buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <a href="#availability" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Check Availability
              </Button>
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="whatsapp" size="md" className="w-full sm:w-auto">
                WhatsApp Us
              </Button>
            </a>
          </div>

          {/* Element 3: Single inline line of text */}
          <p className="mt-6 text-sm text-stone-300 font-normal">
            Rated {site.rating_value}/5 on Google · Over {site.weddings_hosted} weddings hosted
          </p>
        </FadeUp>
      </div>
    </section>
  );
};
