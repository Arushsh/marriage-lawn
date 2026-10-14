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
    <section id="about" className="py-20 sm:py-32">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <FadeUp delay={0.05}>
            <div className="relative h-[320px] sm:h-[460px] rounded-2xl overflow-hidden bg-black/5">
              <Image
                src={
                  site.hero_image ||
                  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"
                }
                alt={`Photographic view of ${site.venue_name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </FadeUp>

          {/* Text */}
          <FadeUp delay={0.15} className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
                About {site.venue_name}
              </h2>
              <p className="text-[16px] sm:text-[17px] text-text/80 leading-[1.65] max-w-[60ch]">
                {site.about_text ||
                  `${site.venue_name} is one of ${site.city}'s most established marriage lawns — a quiet, spacious venue for weddings, receptions, and family gatherings.`}
              </p>
            </div>

            <ul className="space-y-3 border-t border-black/[0.06] pt-6">
              {facts.map((fact, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-text/75 border-b border-black/[0.04] pb-3 last:border-0 last:pb-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#facilities">
                <Button variant="primary" size="md">
                  See Halls &amp; Lawn
                </Button>
              </a>
              <a href="#contact">
                <Button variant="outline" size="md">
                  Schedule a Visit
                </Button>
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
};
