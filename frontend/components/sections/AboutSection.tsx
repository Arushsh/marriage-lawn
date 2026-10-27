import React from "react";
import Image from "next/image";
import { SiteSettings } from "@/types/api";
import { FadeUp, ThreadSeam } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

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
    <section id="about" className="relative py-20 sm:py-32 bg-bg overflow-hidden">
      {/* A loose zari thread drifts behind the passage (two-layer scroll drift) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 88% 20%, var(--c-diya-soft), transparent 70%)",
        }}
      />
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* The framed photograph: pearl zari mat inside a glass frame */}
          <FadeUp className="h-full" rise={36}>
            <div className="gota-glass rounded-2xl p-3 sm:p-4 h-full">
              <div className="relative h-[340px] sm:h-[480px] overflow-hidden rounded-xl">
                <Image
                  src={site.hero_image || "/palace-exterior.jpg"}
                  alt={`Photographic view of ${site.venue_name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04101a]/45 via-transparent to-transparent" />
              </div>
            </div>
          </FadeUp>

          {/* The story */}
          <FadeUp delay={0.15} className="space-y-8">
            <div className="space-y-4">
              <AnimatedHeading
                as="h2"
                className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
              >
                About {site.venue_name}
              </AnimatedHeading>
              <ThreadSeam className="w-24 h-[2px]" />
              <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[64ch]">
                {site.about_text ||
                  `${site.venue_name} is one of ${site.city}'s most established marriage lawns — a quiet, spacious estate for weddings, receptions, and multi-day family celebrations.`}
              </p>
            </div>

            <ul className="space-y-3.5 border-t border-border pt-7">
              {facts.map((fact, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-ink-soft border-b border-border/60 pb-3.5 last:border-0 last:pb-0"
                >
                  <span className="text-zari text-xs shrink-0" aria-hidden="true">◆</span>
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
