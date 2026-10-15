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
      className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-stone-950 overflow-hidden"
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

      {/* Flat Dark Contrast Layer: No gradients, pure solid contrast to guarantee 4.5:1 text readability */}
      <div className="absolute inset-0 bg-stone-950/65 z-[1]" />

      {/* Hero Content: Royal Heritage Editorial */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 py-24 sm:py-36 text-center text-white">
        <FadeUp>
          {/* Monogram Seal & Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-accent/70 bg-stone-950/40 mb-6 text-accent text-[11px] font-semibold tracking-[0.2em] uppercase">
            <span>Heritage Estate</span>
            <span className="text-accent/60">◆</span>
            <span>Palatial Celebrations</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[38px] sm:text-[62px] font-normal leading-[1.15] text-white max-w-4xl mx-auto tracking-[-0.01em]">
            {site.venue_name}
          </h1>

          {/* Plain fact line */}
          <p className="mt-4 text-[15px] sm:text-[17px] text-stone-200 font-normal leading-[1.6] max-w-[62ch] mx-auto">
            Wedding lawn and air-conditioned banquet hall in {site.city}. {capacityText}.
          </p>

          {/* Exactly two actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <a href="#availability" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto !h-12 !px-8">
                Check Availability
              </Button>
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="secondary" size="lg" className="w-full sm:w-auto !h-12 !px-8 !border-accent !text-white hover:!bg-white/10">
                WhatsApp Concierge
              </Button>
            </a>
          </div>

          {/* Single line of credentials with antique gold diamond delimiters */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-stone-300 uppercase tracking-[0.12em]">
            <span>Google Rating {site.rating_value} / 5</span>
            <span className="text-accent">◆</span>
            <span>{site.weddings_hosted}+ Weddings Hosted</span>
            <span className="text-accent">◆</span>
            <span>2.5 Acre Estate</span>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
