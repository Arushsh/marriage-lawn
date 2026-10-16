"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, PhoneCall, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteSettings } from "@/types/api";
import { InstantCallModal } from "@/components/voice/InstantCallModal";
import { OnlineBookingModal } from "@/components/booking/OnlineBookingModal";

interface NavbarProps {
  site: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ site }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const pathname = usePathname();

  const isHomepage = pathname === "/";

  React.useEffect(() => {
    if (!isHomepage) {
      setIsScrolledPastHero(true);
      return;
    }

    const checkScroll = () => {
      // Threshold: when user scrolls near the end of the Hero (approx 2.5 screens)
      const threshold = window.innerHeight * 2.6;
      setIsScrolledPastHero(window.scrollY > threshold);
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, [isHomepage]);

  const navLinks = [
    { label: "360° Lawn View", href: "/#virtual-tour" },
    { label: "Gallery", href: "/gallery" },
    { label: "Menu", href: "/menu" },
    { label: "Packages", href: "/packages" },
    { label: "Availability", href: "/#availability" },
    { label: "Contact", href: "/contact" },
  ];

  const isLinkActive = (href: string) => {
    if (href.startsWith("/#")) {
      return false;
    }
    return pathname === href;
  };

  const isTransparent = isHomepage && !isScrolledPastHero;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-stone-950/85 backdrop-blur-md border-b border-amber-500/20 text-white shadow-xl"
            : "bg-bg/95 backdrop-blur-md border-b border-border text-text shadow-sm"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          {/* Brand / Logo with Royal Heritage Monogram */}
          <Link href="/" className="flex items-center gap-3">
            {site.logo ? (
              <div className="relative h-10 w-36">
                <Image
                  src={site.logo}
                  alt={site.venue_name}
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-8 px-3 border-2 rounded-lg flex items-center justify-center font-serif text-sm font-semibold tracking-wider transition-colors shrink-0 ${
                    isTransparent
                      ? "border-amber-400 text-amber-300"
                      : "border-accent text-primary"
                  }`}
                >
                  SPL
                </span>
                <span
                  className={`font-serif text-lg sm:text-xl tracking-[0.05em] uppercase font-medium transition-colors ${
                    isTransparent ? "text-white drop-shadow" : "text-primary"
                  }`}
                >
                  {site.venue_name}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.14em] transition-colors relative py-1.5 ${
                    active
                      ? isTransparent
                        ? "font-semibold text-amber-300 border-b border-amber-400"
                        : "font-semibold text-primary border-b border-accent"
                      : isTransparent
                      ? "font-medium text-white/80 hover:text-white"
                      : "font-medium text-text hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* AI Call Me Trigger Button */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-full border text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm group ${
                isTransparent
                  ? "border-amber-400/50 bg-stone-900/60 hover:bg-stone-900/80 text-amber-300 backdrop-blur-md"
                  : "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-primary"
              }`}
              title="Request instant AI phone call"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 animate-pulse group-hover:scale-110 transition-transform" />
              <span>AI Call Me</span>
            </button>

            {/* Direct Booking Modal Button */}
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="cursor-pointer"
            >
              <Button
                size="sm"
                variant={isTransparent ? "secondary" : "primary"}
                className={
                  isTransparent
                    ? "bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-2 border-amber-300 rounded-lg shadow-lg shadow-amber-500/20"
                    : ""
                }
              >
                Book Online
              </Button>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-2 text-primary border border-accent/40 rounded bg-accent/10"
              aria-label="Request AI Call"
            >
              <PhoneCall className="w-4 h-4 text-accent animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text hover:text-primary transition-colors cursor-pointer rounded-none border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden bg-bg border-b border-border px-4 py-6 space-y-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-xs uppercase tracking-[0.14em] transition-colors py-2 flex items-center justify-between ${
                      active
                        ? "text-primary font-semibold pl-2 border-l-2 border-accent"
                        : "text-text hover:text-primary"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsVoiceModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded border border-amber-500/50 bg-amber-500/10 text-primary text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-accent" />
                <span>Instant AI Voice Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsBookingModalOpen(true);
                }}
                className="w-full"
              >
                <Button className="w-full justify-center !h-12" variant="primary">
                  Book Online
                </Button>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <InstantCallModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      <OnlineBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
};
