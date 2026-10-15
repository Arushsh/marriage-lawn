import React from "react";
import { Hall, Facility } from "@/types/api";

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
    <section className="py-12 sm:py-16 border-b border-border bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-border p-6 text-center sm:text-left transition-colors"
            >
              <span className="block font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight">
                {item.value}
              </span>
              <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.16em] mt-1.5 block">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
