"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, PhoneCall } from "lucide-react";
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
      const timer = setTimeout(() => setIsScrolledPastHero(true), 0);
      return () => clearTimeout(timer);
    }

    const checkScroll = () => {
      // Transparent over the night hero and the palace film; the glass
      // bar solidifies over the content passages.
      const navBottom = 72;
      const home = document.getElementById("home");
      const film = document.getElementById("palace-film");
      const overHome = home ? home.getBoundingClientRect().bottom > navBottom : false;
      const filmRect = film?.getBoundingClientRect();
      const overFilm = filmRect
        ? filmRect.top < navBottom && filmRect.bottom > navBottom
        : false;
      setIsScrolledPastHero(!(overHome || overFilm));
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, [isHomepage]);

  const navLinks = [
    { label: "Venue", href: "/#venue" },
    { label: "Experiences", href: "/#palace-film" },
    { label: "Gallery", href: "/gallery" },
    { label: "Packages", href: "/packages" },
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent border-b border-transparent"
            : "bg-[#100F0D]/90 backdrop-blur-md border-b border-[#D6B779]/20 shadow-lg"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
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
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rotate-45 border border-[#D6B779]/80 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-[135deg] bg-[#100F0D]/40">
                  <span className="-rotate-45 font-serif text-[11px] tracking-widest text-[#D6B779] inline-block transition-transform duration-500 group-hover:-rotate-[135deg]">
                    SPL
                  </span>
                </span>
                <div className="flex flex-col">
                  <span className="font-serif text-lg sm:text-xl tracking-[0.03em] text-[#F7F0E4]">
                    {site.venue_name}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#D6B779]">
                    Wedding Estate &amp; Lawn
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.16em] relative py-1.5 transition-colors group font-medium ${
                    active
                      ? "text-[#D6B779] font-semibold"
                      : "text-[#C8C0B3] hover:text-[#F7F0E4]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-[1.5px] bg-[#D6B779] transition-all duration-300 origin-left ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-3.5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 border border-[#D6B779]/30 bg-[#100F0D]/50 text-[#C8C0B3] hover:text-[#F7F0E4] hover:border-[#D6B779]/60 backdrop-blur-md"
              title="Request instant AI phone call"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#D6B779]" />
              <span>AI Call</span>
            </button>

            {/* Refined Gold-Outline Book a Visit button */}
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="h-10 px-6 rounded-full border border-[#D6B779] text-[#F7F0E4] hover:bg-[#D6B779] hover:text-[#100F0D] text-xs uppercase tracking-[0.16em] font-semibold transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(214,183,121,0.15)] hover:shadow-[0_0_22px_rgba(214,183,121,0.35)] active:scale-95"
            >
              Book a Visit
            </button>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-2.5 rounded-lg border border-[#D6B779]/30 text-[#F7F0E4] bg-[#100F0D]/60"
              aria-label="Request AI Call"
            >
              <PhoneCall className="w-4 h-4 text-[#D6B779]" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg border border-[#D6B779]/30 text-[#F7F0E4] bg-[#100F0D]/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B779]"
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

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="md:hidden bg-[#100F0D]/95 backdrop-blur-xl border-b border-[#D6B779]/20 px-5 py-6 space-y-4"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-xs uppercase tracking-[0.16em] py-3.5 px-3 rounded-lg flex items-center justify-between transition-colors ${
                      active
                        ? "text-[#D6B779] font-semibold bg-white/5"
                        : "text-[#F7F0E4] hover:text-[#D6B779] hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-[#D6B779]/60">◆</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#D6B779]/20 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsVoiceModalOpen(true);
                }}
                className="w-full h-11 rounded-lg border border-[#D6B779]/30 bg-white/5 text-[#F7F0E4] text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#D6B779]" />
                <span>Instant AI Voice Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsBookingModalOpen(true);
                }}
                className="w-full h-12 rounded-lg border border-[#D6B779] bg-[#D6B779] text-[#100F0D] text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center cursor-pointer shadow-[0_0_18px_rgba(214,183,121,0.25)]"
              >
                Book a Visit
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
