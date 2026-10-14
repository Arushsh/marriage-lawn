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
    <section id="facilities" className="py-20 sm:py-32">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 space-y-16">
        {/* Halls & Event Spaces */}
        <div className="space-y-8">
          <FadeUp>
            <div className="space-y-2">
              <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
                Halls &amp; Spaces
              </h2>
              <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch]">
                Dedicated spaces for wedding rituals, receptions, and gatherings with clear seating and floating capacities.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {halls.map((hall, idx) => (
              <FadeUp key={hall.id || idx} delay={idx * 0.08}>
                <Card className="flex flex-col h-full overflow-hidden p-0 rounded-2xl border border-black/[0.08] bg-surface">
                  <div className="relative h-48 w-full bg-black/5">
                    <Image
                      src={
                        (hall.image && hall.image.trim())
                          ? hall.image
                          : idx === 0
                          ? "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                          : idx === 1
                          ? "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
                          : "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={hall.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="object-cover"
                      priority={idx === 0}
                    />
                    <div className="absolute top-3 right-3 bg-surface/95 text-text text-xs px-2.5 py-1 rounded-md border border-black/10 font-medium">
                      {hall.is_ac ? "Air Conditioned" : "Open Lawn"}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif text-[20px] sm:text-[24px] font-normal leading-[1.25] text-primary">
                        {hall.name}
                      </h3>
                      {hall.description && (
                        <p className="text-sm text-text/75 leading-relaxed">
                          {hall.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-text/80">
                      <div>
                        <span className="text-muted block text-[11px]">Seating</span>
                        <span className="font-medium text-sm text-text">
                          {hall.seating_capacity} guests
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted block text-[11px]">Floating</span>
                        <span className="font-medium text-sm text-primary">
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
          <div className="space-y-6 pt-6 border-t border-black/[0.06]">
            <FadeUp>
              <div className="space-y-2">
                <h3 className="font-serif text-[20px] sm:text-[24px] font-normal leading-[1.25] text-primary">
                  Venue Facilities &amp; Amenities
                </h3>
                <p className="text-sm text-muted max-w-[60ch]">
                  Key amenities and logistics available on site for guests and vendors.
                </p>
              </div>
            </FadeUp>

            {/* Simple two-column list with thin dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 divide-y sm:divide-y-0 border-t border-b border-black/[0.06] py-2">
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
