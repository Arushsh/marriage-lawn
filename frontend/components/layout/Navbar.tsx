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
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-black/[0.08]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {site.logo ? (
            <div className="relative h-9 w-32">
              <Image
                src={site.logo}
                alt={site.venue_name}
                fill
                sizes="128px"
                className="object-contain object-left"
              />
            </div>
          ) : (
            <span className="font-serif text-xl sm:text-2xl text-primary font-normal">
              {site.venue_name}
            </span>
          )}
        </Link>

        {/* Desktop Nav Links: 4 max */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[15px] transition-colors relative py-1 ${
                  active
                    ? "font-medium text-primary border-b-2 border-primary"
                    : "font-normal text-text hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Enquire CTA */}
        <div className="hidden md:flex items-center">
          <Link href="/contact">
            <Button size="sm" variant="primary">
              Enquire
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text hover:text-primary transition-colors cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={1.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="md:hidden bg-surface border-b border-black/[0.08] px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base transition-colors py-1.5 flex items-center justify-between ${
                    active
                      ? "text-primary font-medium pl-2 border-l-2 border-primary"
                      : "text-text hover:text-primary"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-black/[0.06]">
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center !h-12" variant="primary">
                Enquire
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
