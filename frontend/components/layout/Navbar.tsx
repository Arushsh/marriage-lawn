"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteSettings } from "@/types/api";

interface NavbarProps {
  site: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ site }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Exactly 4 links as specified: Gallery, Packages, Availability, Contact
  const navLinks = [
    { label: "Gallery", href: "/gallery" },
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

  return (
    <header className="sticky top-0 z-40 bg-bg border-b border-border">
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
              <span className="w-8 h-8 border border-accent flex items-center justify-center font-serif text-primary text-sm font-semibold tracking-wider">
                GRL
              </span>
              <span className="font-serif text-lg sm:text-xl text-primary tracking-[0.05em] uppercase font-medium">
                {site.venue_name}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Nav Links: 4 max, tracked uppercase */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs uppercase tracking-[0.14em] transition-colors relative py-1.5 ${
                  active
                    ? "font-semibold text-primary border-b border-accent"
                    : "font-medium text-text hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {site.phone && (
            <a
              href={`tel:${site.phone}`}
              className="text-xs uppercase tracking-[0.12em] font-medium text-text hover:text-primary transition-colors"
            >
              {site.phone}
            </a>
          )}
          <Link href="/contact">
            <Button size="sm" variant="primary">
              Reserve Date
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center md:hidden">
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

          <div className="pt-3 border-t border-border">
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center !h-12" variant="primary">
                Reserve Date
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
