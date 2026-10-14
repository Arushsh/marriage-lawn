"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { SiteSettings } from "@/types/api";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { FadeUp } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";

interface ContactSectionProps {
  site: SiteSettings;
  selectedDate?: string;
  onClearSelectedDate?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  site,
  selectedDate,
  onClearSelectedDate,
}) => {
  const [mapInView, setMapInView] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMapInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const mapQuery = encodeURIComponent(`${site.venue_name}, ${site.address || site.city}`);
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contact" className="py-20 sm:py-32 bg-[#FFFBF4] border-t border-black/[0.04]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 space-y-12">
        <FadeUp>
          <div className="space-y-2">
            <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
              Contact &amp; Visit Us
            </h2>
            <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch]">
              We welcome prospective couples and families for venue visits daily. Reach out via the form or visit in person.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Contact details, hours & Google Map embed (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-5 text-sm text-text/85">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="font-medium block text-text">Address</span>
                  <p className="text-text/75 mt-0.5 leading-relaxed">
                    {site.address || `${site.venue_name}, ${site.city}`}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="font-medium block text-text">Phone</span>
                  <a
                    href={`tel:${site.phone}`}
                    className="text-primary hover:underline mt-0.5 block font-medium"
                  >
                    +91 {site.phone}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="font-medium block text-text">Visiting Hours</span>
                  <p className="text-text/75 mt-0.5">
                    {site.opening_hours || "10:00 AM – 8:00 PM (Daily)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Embed (Lazy Loaded on View) */}
            <div className="space-y-3">
              <div
                ref={mapContainerRef}
                className="relative w-full h-[240px] rounded-2xl overflow-hidden border border-black/[0.08] bg-black/5 flex items-center justify-center"
              >
                {mapInView ? (
                  <iframe
                    title={`Location Map for ${site.venue_name}`}
                    src={mapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted text-xs p-4 text-center">
                    <MapPin className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    <span>Map loads as you scroll</span>
                  </div>
                )}
              </div>

              {site.google_maps_url && (
                <a
                  href={site.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    leftIcon={<Navigation className="w-4 h-4 text-primary" strokeWidth={1.5} />}
                  >
                    Get Directions
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Enquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <EnquiryForm
              site={site}
              selectedDate={selectedDate}
              onClearSelectedDate={onClearSelectedDate}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
