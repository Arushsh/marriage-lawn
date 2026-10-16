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
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";

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
    <section id="facilities" className="py-20 sm:py-32 bg-bg border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-16">
        {/* Halls & Event Spaces */}
        <div className="space-y-8">
          <FadeUp>
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
                Palatial Architecture
              </span>
              <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-primary">
                Halls &amp; Event Lawns
              </h2>
              <p className="text-[15px] sm:text-[17px] text-muted leading-[1.65] max-w-[62ch]">
                Dedicated spaces for sacred rituals, regal receptions, and gatherings with clear seating and floating capacities.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {halls.map((hall, idx) => (
              <FadeUp key={hall.id || idx} delay={idx * 0.08}>
                <Card className="flex flex-col h-full overflow-hidden p-0 rounded-none border border-border bg-white transition-colors hover:border-accent">
                  <div className="p-2 bg-white">
                    <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                      <Image
                        src={
                          (hall.image && hall.image.trim())
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
                        className="object-cover"
                        priority={idx === 0}
                      />
                      <div className="absolute top-3 right-3 bg-bg text-primary text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 border border-accent">
                        {hall.is_ac ? "Air Conditioned" : "Open Lawn"}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif text-[22px] font-normal leading-[1.25] text-primary">
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
                        <span className="text-[10px] uppercase tracking-[0.14em] text-accent font-semibold block">
                          Seating Capacity
                        </span>
                        <span className="font-medium text-base text-text mt-0.5 block">
                          {hall.seating_capacity} guests
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-accent font-semibold block">
                          Floating Capacity
                        </span>
                        <span className="font-medium text-base text-primary mt-0.5 block">
                          {hall.floating_capacity} guests
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* Facilities & Amenities List */}
        {facilities.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-border">
            <FadeUp>
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
                  Logistics &amp; Infrastructure
                </span>
                <h3 className="font-serif text-[24px] sm:text-[28px] font-normal leading-[1.25] text-primary">
                  Estate Facilities &amp; Amenities
                </h3>
                <p className="text-sm text-muted max-w-[62ch]">
                  Key amenities and logistics available on site for guests, families, and decorators.
                </p>
              </div>
            </FadeUp>

            {/* Simple two-column list with thin dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 divide-y sm:divide-y-0 border-t border-b border-border py-2">
              <div className="divide-y divide-black/[0.05]">
                {topFacilities
                  .slice(0, Math.ceil(topFacilities.length / 2))
                  .map((fac, idx) => {
                    const IconComp = getFacilityIcon(fac.icon, fac.name);
                    return (
                      <div
                        key={fac.id || idx}
                        className="py-3 flex items-center justify-between gap-4 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
                          <span className="font-medium text-text">{fac.name}</span>
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

              <div className="divide-y divide-black/[0.05]">
                {topFacilities
                  .slice(Math.ceil(topFacilities.length / 2))
                  .map((fac, idx) => {
                    const IconComp = getFacilityIcon(fac.icon, fac.name);
                    return (
                      <div
                        key={fac.id || idx}
                        className="py-3 flex items-center justify-between gap-4 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
                          <span className="font-medium text-text">{fac.name}</span>
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
                  className="text-sm font-medium text-primary"
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
