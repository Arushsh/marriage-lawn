import React from "react";
import Link from "next/link";
import { SiteSettings } from "@/types/api";
import { openCookieSettings } from "@/components/layout/CookieConsent";

interface FooterProps {
  site: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ site }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-ground-deep border-t border-border py-14 lg:py-20 text-ink overflow-hidden">
      {/* Pure CSS rising ember particles — zero JS overhead */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: "8%",  delay: "0s",    dur: "8s"  },
          { left: "19%", delay: "2.1s",  dur: "11s" },
          { left: "33%", delay: "0.7s",  dur: "9s"  },
          { left: "48%", delay: "3.4s",  dur: "7s"  },
          { left: "61%", delay: "1.2s",  dur: "10s" },
          { left: "74%", delay: "4.0s",  dur: "8.5s"},
          { left: "86%", delay: "0.4s",  dur: "12s" },
          { left: "94%", delay: "2.8s",  dur: "9.5s"},
        ].map((e, i) => (
          <div
            key={i}
            className="absolute bottom-0 w-[2px] h-[2px] rounded-full bg-[#ffb454]"
            style={{ left: e.left, opacity: 0, animation: `emberDrift ${e.dur} ease-out ${e.delay} infinite` }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Venue & Monogram */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rotate-45 border border-zari/70 flex items-center justify-center shrink-0">
                <span className="-rotate-45 font-serif text-zari text-[11px] font-semibold tracking-wider">
                  SPL
                </span>
              </span>
              <h3 className="font-serif text-2xl text-ink leading-[1.2]">
                {site.venue_name}
              </h3>
            </div>
            <p className="text-sm text-muted max-w-sm">
              {site.address || `${site.city}, Uttar Pradesh`}
            </p>
            <p className="text-sm text-diya font-medium pt-1">
              <a href={`tel:${site.phone}`} className="hover:underline tracking-wider">
                {site.phone}
              </a>
            </p>
          </div>

          {/* Visiting Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-zari">
              Estate Visiting Hours
            </h4>
            <p className="text-sm text-ink-soft">
              {site.opening_hours || "Open daily 9:00 AM – 8:00 PM for private walkthroughs."}
            </p>
            {site.google_maps_url && (
              <p className="pt-1">
                <a
                  href={site.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.14em] text-diya hover:underline inline-flex items-center gap-1"
                >
                  View on Google Maps →
                </a>
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-zari">
              Curated Navigation
            </h4>
            <div className="flex flex-col space-y-2 text-xs uppercase tracking-[0.14em] text-muted">
              <Link href="/gallery" className="hover:text-zari-bright transition-colors">
                Photo Portfolio
              </Link>
              <Link href="/menu" className="hover:text-zari-bright transition-colors">
                Royal Catering Menu
              </Link>
              <Link href="/packages" className="hover:text-zari-bright transition-colors">
                Wedding Packages &amp; Pricing
              </Link>
              <Link href="/book" className="hover:text-zari-bright transition-colors">
                Online Date Booking
              </Link>
              <Link href="/contact" className="hover:text-zari-bright transition-colors">
                Reserve Date &amp; Location
              </Link>
              <Link href="/privacy" className="hover:text-zari-bright transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-zari-bright transition-colors">
                Cookie Policy
              </Link>
              <Link href="/terms" className="hover:text-zari-bright transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wider text-muted">
          <p>© {currentYear} {site.venue_name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openCookieSettings}
              className="uppercase tracking-[0.15em] text-[11px] hover:text-zari-bright transition-colors cursor-pointer"
            >
              Cookie Settings
            </button>
            <span className="uppercase tracking-[0.15em] text-[11px] text-zari/70">
              Banarasi Nights
            </span>
            <Link
              href="/admin/login"
              className="uppercase tracking-[0.15em] text-[11px] text-muted/50 hover:text-zari-bright transition-colors"
              title="Venue owner sign-in"
            >
              Owner Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
