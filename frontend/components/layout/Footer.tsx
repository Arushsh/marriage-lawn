import React from "react";
import Link from "next/link";
import { SiteSettings } from "@/types/api";

interface FooterProps {
  site: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ site }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-black/[0.08] py-12 lg:py-16 text-text">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Venue & Address */}
          <div className="space-y-2">
            <h3 className="font-serif text-[20px] sm:text-[24px] text-primary font-normal leading-[1.25]">
              {site.venue_name}
            </h3>
            <p className="text-sm text-muted">
              {site.address || `${site.city}, Uttar Pradesh`}
            </p>
            <p className="text-sm text-text font-normal pt-1">
              <a href={`tel:${site.phone}`} className="hover:text-primary">
                +91 {site.phone}
              </a>
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Visiting Hours
            </h4>
            <p className="text-sm text-muted">
              {site.opening_hours || "Open daily 9:00 AM – 8:00 PM for site visits."}
            </p>
            {site.google_maps_url && (
              <p className="pt-1">
                <a
                  href={site.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View on Google Maps →
                </a>
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Navigation
            </h4>
            <div className="flex flex-col space-y-1.5 text-sm text-muted">
              <Link href="/gallery" className="hover:text-primary transition-colors">
                Photo Gallery
              </Link>
              <Link href="/packages" className="hover:text-primary transition-colors">
                Packages &amp; Pricing
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact &amp; Location
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Line: One line of credit */}
        <div className="pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {currentYear} {site.venue_name}. All rights reserved.</p>
          <p>Website by Arush</p>
        </div>
      </div>
    </footer>
  );
};
