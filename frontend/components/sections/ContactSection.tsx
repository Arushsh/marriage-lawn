"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { SiteSettings } from "@/types/api";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { FadeUp } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

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
    <section id="contact" className="relative py-20 sm:py-32 bg-ground-deep border-t border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <FadeUp>
          <div className="space-y-4 max-w-3xl">
            <AnimatedHeading
              as="h2"
              className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
            >
              Contact &amp; Private Walkthrough
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
              We welcome prospective couples and families for venue walkthroughs daily. Reach
              out via the form or visit in person.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Contact details, hours & map */}
          <div className="lg:col-span-5 space-y-8">
            <div className="gota-glass rounded-2xl space-y-6 p-6 text-sm text-ink">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-diya shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] block">
                    Estate Address
                  </span>
                  <p className="text-ink-soft mt-1 leading-relaxed">
                    {site.address || `${site.venue_name}, ${site.city}`}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-border">
                <Phone className="w-5 h-5 text-diya shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] block">
                    Concierge Telephone
                  </span>
                  <a
                    href={`tel:${site.phone}`}
                    className="text-teal hover:text-zari-bright hover:underline mt-1 block font-semibold tracking-wide"
                  >
                    {site.phone}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-border">
                <Clock className="w-5 h-5 text-diya shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] block">
                    Visiting Hours
                  </span>
                  <p className="text-ink-soft mt-1">
                    {site.opening_hours || "10:00 AM – 8:00 PM (Daily)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Embed (Lazy Loaded on View) */}
            <div className="space-y-4">
              <div
                ref={mapContainerRef}
                className="relative w-full h-[240px] rounded-2xl overflow-hidden border border-border bg-surface-2 flex items-center justify-center"
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
                    className="grayscale-[0.35] contrast-[1.05]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted text-xs p-4 text-center">
                    <MapPin className="w-6 h-6 text-diya" strokeWidth={1.5} />
                    <span className="uppercase tracking-wider">Map loads as you scroll</span>
                  </div>
                )}
              </div>

              {site.google_maps_url && (
                <a
                  href={site.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto"
                >
                  <Button
                    variant="secondary"
                    size="md"
                    className="gap-2 w-full sm:w-auto !h-12"
                    leftIcon={<Navigation className="w-4 h-4 text-diya" strokeWidth={1.5} />}
                  >
                    Get GPS Directions
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
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
