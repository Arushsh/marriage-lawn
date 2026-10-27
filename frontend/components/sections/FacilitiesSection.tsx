"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Car,
  BedDouble,
  Zap,
  UtensilsCrossed,
  Utensils,
  Music2,
  Sparkles,
  Bath,
  ShieldCheck,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";
import { Hall, Facility } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";
import { FlipIn } from "@/components/animations/FlipIn";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

interface FacilitiesSectionProps {
  halls?: Hall[];
  facilities?: Facility[];
}

// Icon key mapper with strokeWidth 1.5 and fallback
function getFacilityIcon(iconKey: string, name: string): LucideIcon {
  const key = (iconKey || name).toLowerCase();
  if (key.includes("park")) return Car;
  if (key.includes("room") || key.includes("bridal") || key.includes("suite")) return BedDouble;
  if (key.includes("generator") || key.includes("power")) return Zap;
  if (key.includes("outside")) return Utensils;
  if (key.includes("cater") || key.includes("food")) return UtensilsCrossed;
  if (key.includes("dj") || key.includes("music") || key.includes("sound")) return Music2;
  if (key.includes("decor") || key.includes("flower")) return Sparkles;
  if (key.includes("washroom") || key.includes("toilet") || key.includes("bath")) return Bath;
  if (key.includes("security") || key.includes("cctv")) return ShieldCheck;
  return CheckCircle2; // Robust neutral fallback icon
}

export const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({
  halls = [],
  facilities = [],
}) => {
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  const topFacilities = showAllFacilities ? facilities : facilities.slice(0, 8);

  return (
    <section id="facilities" className="relative py-20 sm:py-32 bg-bg border-t border-border overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-16">
        {/* Halls & Event Spaces */}
        <div className="space-y-10">
          <FadeUp>
            <div className="space-y-4 max-w-2xl">
              <AnimatedHeading
                as="h2"
                className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
              >
                Halls &amp; Event Lawns
              </AnimatedHeading>
              <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
                Dedicated spaces for sacred rituals, regal receptions, and gatherings with
                clear seating and floating capacities.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {halls.map((hall, idx) => (
              <FlipIn key={hall.id || idx} delay={idx * 0.08} from={14}>
                <article className="silk-panel rounded-2xl flex flex-col h-full overflow-hidden royal-card-hover">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={
                        hall.image && hall.image.trim()
                          ? hall.image
                          : idx === 0
                          ? "/palace-colonnade.jpg"
                          : idx === 1
                          ? "/palace-hall.jpg"
                          : "/palace-lawn.jpg"
                      }
                      alt={hall.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-700 ease-out hover:scale-[1.05]"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04101a]/55 via-transparent to-transparent" />
                    <div className="absolute top-3.5 right-3.5 gota-glass rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-zari-bright">
                      {hall.is_ac ? "Air Conditioned" : "Open Lawn"}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif text-[22px] leading-[1.25] text-ink">
                        {hall.name}
                      </h3>
                      {hall.description && (
                        <p className="text-sm text-muted leading-relaxed">
                          {hall.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold block">
                          Seating
                        </span>
                        <span className="font-semibold text-base text-ink mt-0.5 block">
                          {hall.seating_capacity}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold block">
                          Floating
                        </span>
                        <span className="font-semibold text-base text-teal mt-0.5 block">
                          {hall.floating_capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </FlipIn>
            ))}
          </div>
        </div>

        {/* Facilities & Amenities List */}
        {facilities.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-border">
            <FadeUp>
              <div className="space-y-3 max-w-2xl">
                <h3 className="font-serif text-[24px] sm:text-[30px] leading-[1.2] text-ink">
                  Estate Facilities &amp; Amenities
                </h3>
                <p className="text-sm text-muted max-w-[62ch]">
                  Key amenities and logistics available on site for guests, families, and decorators.
                </p>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 border-t border-b border-border py-2">
              <div className="divide-y divide-border/70">
                {topFacilities
                  .slice(0, Math.ceil(topFacilities.length / 2))
                  .map((fac, idx) => {
                    const IconComp = getFacilityIcon(fac.icon, fac.name);
                    return (
                      <div
                        key={fac.id || idx}
                        className="py-3.5 flex items-center justify-between gap-4 text-sm group"
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className="w-5 h-5 text-teal shrink-0 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                          <span className="font-medium text-ink">{fac.name}</span>
                        </div>
                        {fac.detail && (
                          <span className="text-muted text-right text-xs sm:text-sm">
                            {fac.detail}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="divide-y divide-border/70 sm:border-l sm:border-border/70">
                {topFacilities
                  .slice(Math.ceil(topFacilities.length / 2))
                  .map((fac, idx) => {
                    const IconComp = getFacilityIcon(fac.icon, fac.name);
                    return (
                      <div
                        key={fac.id || idx}
                        className="py-3.5 flex items-center justify-between gap-4 text-sm group sm:pl-12"
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className="w-5 h-5 text-teal shrink-0 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                          <span className="font-medium text-ink">{fac.name}</span>
                        </div>
                        {fac.detail && (
                          <span className="text-muted text-right text-xs sm:text-sm">
                            {fac.detail}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {facilities.length > 8 && !showAllFacilities && (
              <div className="text-center pt-2">
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setShowAllFacilities(true)}
                >
                  View all {facilities.length} amenities
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
