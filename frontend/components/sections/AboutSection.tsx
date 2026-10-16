import React from "react";
import Image from "next/image";
import { SiteSettings } from "@/types/api";
import { FadeUp } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";

interface AboutSectionProps {
  site: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ site }) => {
  const facts = [
    `Located in central ${site.city}`,
    `${site.weddings_hosted}+ weddings hosted`,
    "Open lawn and AC banquet hall",
    "In-house decor and catering team",
    "Bridal suites and guest accommodation",
  ];

  return (
    <section id="about" className="py-20 sm:py-32 bg-bg border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Framed Archival Image: 1px hairline border + inset mat */}
          <FadeUp delay={0.05}>
            <div className="p-2 sm:p-3 bg-white border border-border">
              <div className="relative h-[320px] sm:h-[460px] overflow-hidden bg-stone-100">
                <Image
                  src={
                    site.hero_image ||
                    "/palace-exterior.jpg"
                  }
                  alt={`Photographic view of ${site.venue_name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
            </div>
          </FadeUp>

          {/* Editorial Content */}
          <FadeUp delay={0.15} className="space-y-8">
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
                Estate Heritage &amp; Grounds
              </span>
              <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-primary">
                About {site.venue_name}
              </h2>
              <p className="text-[15px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch]">
                {site.about_text ||
                  `${site.venue_name} is one of ${site.city}'s most established marriage lawns — a quiet, spacious estate for weddings, receptions, and multi-day family celebrations.`}
              </p>
            </div>

            <ul className="space-y-3 border-t border-border pt-6">
              {facts.map((fact, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-text border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-accent text-xs flex-shrink-0">◆</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#facilities">
                <Button variant="primary" size="md">
                  View Lawn &amp; Ballroom
                </Button>
              </a>
              <a href="#contact">
                <Button variant="secondary" size="md">
                  Schedule Private Visit
                </Button>
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
};
