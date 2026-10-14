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
    <section className="py-10 sm:py-14 border-b border-black/[0.06] bg-surface/50">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8">
        <div className="flex flex-nowrap sm:grid sm:grid-cols-4 gap-8 sm:gap-0 overflow-x-auto no-scrollbar divide-x divide-black/[0.08]">
          {items.map((item, i) => (
            <div
              key={i}
              className="min-w-[140px] sm:min-w-0 flex-shrink-0 px-4 sm:px-8 first:pl-0 last:pr-0 text-center sm:text-left"
            >
              <span className="block font-serif text-3xl sm:text-4xl font-normal text-primary">
                {item.value}
              </span>
              <span className="text-sm text-muted mt-0.5 block">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
