import React from "react";
import { Hall, Facility } from "@/types/api";
import { FadeUp } from "@/components/ui/FadeUp";

interface HighlightsStripProps {
  halls?: Hall[];
  facilities?: Facility[];
}

export const HighlightsStrip: React.FC<HighlightsStripProps> = ({
  halls = [],
  facilities = [],
}) => {
  const maxCapacity = halls.reduce(
    (max, h) => Math.max(max, h.floating_capacity || h.seating_capacity || 0),
    0
  );

  const parkingFacility = facilities.find((f) =>
    f.name.toLowerCase().includes("parking")
  );
  const roomFacility = facilities.find((f) =>
    f.name.toLowerCase().includes("room")
  );

  const items = [
    {
      value: maxCapacity > 0 ? `${maxCapacity.toLocaleString()}+` : "1,500+",
      label: "guest capacity",
    },
    {
      value: roomFacility?.detail?.split(" ")[0] || "12",
      label: "AC guest rooms",
    },
    {
      value: parkingFacility?.detail?.split(" ")[0] || "150+",
      label: "car parking",
    },
    { value: "100%", label: "power backup" },
  ];

  return (
    <section className="relative py-10 sm:py-14 passage-pearl">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="gota-glass rounded-2xl grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border overflow-hidden">
          {items.map((item, i) => (
            <FadeUp key={i} delay={i * 0.08} rise={16}>
              <div className="p-6 sm:p-7 text-center lg:text-left h-full">
                <span className="block font-serif text-3xl sm:text-4xl text-zari-bright tracking-tight">
                  {item.value}
                </span>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.16em] mt-1.5 block">
                  {item.label}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};
