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
    <section id="packages" className="py-20 sm:py-32 bg-[#FFFBF4] border-t border-black/[0.04]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Heading */}
        <FadeUp>
          <div className="space-y-2">
            <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
              Packages &amp; Pricing
            </h2>
            <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch]">
              Standard event options and custom quotes tailored to season, guest count, and catering choice.
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
                : "Get Quote";

            // Max 5 inclusions as specified
            const visibleInclusions = (pkg.inclusions || []).slice(0, 5);

            return (
              <FadeUp key={pkg.id || idx} delay={idx * 0.08} className="h-full">
                <Card
                  className={`flex flex-col justify-between h-full p-8 rounded-2xl border transition-colors ${
                    isPopular
                      ? "border-primary/40 bg-surface shadow-sm"
                      : "border-black/[0.07] bg-surface"
                  }`}
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-[20px] sm:text-[24px] font-normal leading-[1.25] text-primary">
                          {pkg.name}
                        </h3>
                        {isPopular && (
                          <span className="text-xs uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                            Popular
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
                    <div className="py-4 border-y border-black/[0.06]">
                      <span className="text-xs text-muted block">
                        {pkg.show_price && pkg.price_from
                          ? "Starting from"
                          : "Custom Quote"}
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="font-serif text-3xl sm:text-4xl font-normal text-text">
                          {formattedPrice}
                        </span>
                        {pkg.show_price && pkg.price_from && (
                          <span className="text-xs text-muted">/ event</span>
                        )}
                      </div>
                      <span className="text-xs text-muted block mt-1.5">
                        {pkg.price_note || "Varies by season and guest count"}
                      </span>
                    </div>

                    {/* Inclusions */}
                    {visibleInclusions.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs uppercase tracking-wider font-medium text-muted block">
                          Included:
                        </span>
                        <ul className="space-y-2.5 text-sm text-text/80">
                          {visibleInclusions.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
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
                        variant={isPopular ? "primary" : "outline"}
                        size="md"
                        className="w-full justify-center !h-12"
                      >
                        Enquire for {pkg.name}
                      </Button>
                    </a>
                  </div>
                </Card>
              </FadeUp>
            );
          })}
        </div>

        {/* Pricing disclaimer */}
        <p className="text-xs text-muted text-center pt-2 max-w-[60ch] mx-auto">
          Prices vary by wedding season, auspicious dates (muhurat), and guest count. Contact venue for final quotation.
        </p>
      </div>
    </section>
  );
};
