import React from "react";
import { Package, SiteSettings } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";

interface PackagesSectionProps {
  packages: Package[];
  site: SiteSettings;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages = [],
}) => {
  return (
    <section id="packages" className="py-20 sm:py-32 bg-surface border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Heading */}
        <FadeUp>
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
              Transparent Estate Buyouts
            </span>
            <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-primary">
              Wedding Packages &amp; Investment
            </h2>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.65] max-w-[62ch]">
              Curated celebrations tailored to season, auspicious muhurat dates, and personalized hospitality requirements.
            </p>
          </div>
        </FadeUp>

        {/* 3 Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {packages.map((pkg, idx) => {
            const isPopular = pkg.is_popular;
            const formattedPrice =
              pkg.show_price && pkg.price_from
                ? `₹${Number(pkg.price_from).toLocaleString("en-IN")}`
                : "Custom Quote";

            // Max 5 inclusions as specified
            const visibleInclusions = (pkg.inclusions || []).slice(0, 5);

            return (
              <FadeUp key={pkg.id || idx} delay={idx * 0.08} className="h-full">
                <Card
                  className={`flex flex-col justify-between h-full p-8 rounded-none border transition-colors ${
                    isPopular
                      ? "border-accent bg-white shadow-none ring-1 ring-accent"
                      : "border-border bg-white shadow-none hover:border-accent"
                  }`}
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-[22px] font-normal leading-[1.25] text-primary">
                          {pkg.name}
                        </h3>
                        {isPopular && (
                          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-white bg-primary px-2.5 py-0.5 border border-accent">
                            Curated Selection
                          </span>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-muted mt-2 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="py-5 border-y border-border">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent block">
                        {pkg.show_price && pkg.price_from
                          ? "Starting From"
                          : "Private Estimate"}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-serif text-3xl sm:text-4xl font-normal text-text">
                          {formattedPrice}
                        </span>
                        {pkg.show_price && pkg.price_from && (
                          <span className="text-xs uppercase tracking-wider text-muted font-medium">/ event</span>
                        )}
                      </div>
                      <span className="text-xs text-muted block mt-1.5">
                        {pkg.price_note || "Varies by wedding season & muhurat date"}
                      </span>
                    </div>

                    {/* Inclusions */}
                    {visibleInclusions.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-accent block">
                          Estate Inclusions:
                        </span>
                        <ul className="space-y-2.5 text-sm text-text">
                          {visibleInclusions.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="text-accent text-xs shrink-0 mt-0.5">◆</span>
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Single CTA Button */}
                  <div className="pt-8">
                    <a href="#contact" className="block w-full">
                      <Button
                        variant={isPopular ? "primary" : "secondary"}
                        size="md"
                        className="w-full justify-center !h-12"
                      >
                        Inquire for {pkg.name}
                      </Button>
                    </a>
                  </div>
                </Card>
              </FadeUp>
            );
          })}
        </div>

        {/* Pricing disclaimer */}
        <p className="text-xs text-muted text-center pt-2 max-w-[60ch] mx-auto uppercase tracking-wider">
          Prices vary by wedding season, auspicious dates (muhurat), and guest count. Contact concierge for formal quotation.
        </p>
      </div>
    </section>
  );
};
