import React from "react";
import Link from "next/link";
import { SiteSettings } from "@/types/api";

interface FooterProps {
  site: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ site }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark border-t border-accent py-14 lg:py-20 text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Venue & Monogram */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 border border-accent flex items-center justify-center font-serif text-accent text-sm font-semibold tracking-wider">
                GRL
              </span>
              <h3 className="font-serif text-2xl text-white font-normal leading-[1.2]">
                {site.venue_name}
              </h3>
            </div>
            <p className="text-sm text-white/70 max-w-sm">
              {site.address || `${site.city}, Uttar Pradesh`}
            </p>
            <p className="text-sm text-accent font-medium pt-1">
              <a href={`tel:${site.phone}`} className="hover:underline tracking-wider">
                {site.phone}
              </a>
            </p>
          </div>

          {/* Visiting Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Estate Visiting Hours
            </h4>
            <p className="text-sm text-white/75">
              {site.opening_hours || "Open daily 9:00 AM – 8:00 PM for private walkthroughs."}
            </p>
            {site.google_maps_url && (
              <p className="pt-1">
                <a
                  href={site.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.14em] text-accent hover:underline inline-flex items-center gap-1"
                >
                  View on Google Maps →
                </a>
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Curated Navigation
            </h4>
            <div className="flex flex-col space-y-2 text-xs uppercase tracking-[0.14em] text-white/75">
              <Link href="/gallery" className="hover:text-accent transition-colors">
                Photo Portfolio
              </Link>
              <Link href="/packages" className="hover:text-accent transition-colors">
                Wedding Packages &amp; Pricing
              </Link>
              <Link href="/contact" className="hover:text-accent transition-colors">
                Reserve Date &amp; Location
              </Link>
              <Link href="/privacy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Line: One line of credit */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wider text-white/60">
          <p>© {currentYear} {site.venue_name}. All rights reserved.</p>
          <p className="uppercase tracking-[0.15em] text-[11px]">Royal Heritage Gazette</p>
        </div>
      </div>
    </footer>
  );
};
