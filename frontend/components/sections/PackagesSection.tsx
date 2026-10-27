import React from "react";
import { Package, SiteSettings } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";
import { TiltCard } from "@/components/animations/TiltCard";

interface PackagesSectionProps {
  packages: Package[];
  site: SiteSettings;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages = [],
}) => {
  return (
    <section id="packages" className="relative py-20 sm:py-32 bg-bg border-t border-border overflow-hidden">
      {/* One declared light: a rani glow pools behind the popular card column */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 40% at 50% 42%, var(--c-diya-soft), transparent 70%)",
        }}
      />
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Heading */}
        <FadeUp>
          <div className="space-y-4 max-w-2xl">
            <AnimatedHeading
              as="h2"
              className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
            >
              Wedding Packages &amp; Investment
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
              Curated celebrations tailored to season, auspicious muhurat dates, and
              personalized hospitality requirements.
            </p>
          </div>
        </FadeUp>

        {/* Package cards — each a silk bolt, the popular one carries the pallu */}
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
                <TiltCard className="h-full">
                  <article
                    className={`silk-panel rounded-2xl flex flex-col justify-between h-full p-8 royal-card-hover relative overflow-hidden ${
                      isPopular ? "border-rani/50 ring-1 ring-rani/40" : ""
                    }`}
                  >
                    {/* The pallu edge on the curated selection */}
                    {isPopular && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rani-deep via-rani to-rani-deep"
                      />
                    )}

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-[22px] leading-[1.25] text-ink">
                            {pkg.name}
                          </h3>
                          {isPopular && (
                            <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] font-semibold text-white bg-rani px-2.5 py-1 rounded-md">
                              Curated
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
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted block">
                          {pkg.show_price && pkg.price_from
                            ? "Starting From"
                            : "Private Estimate"}
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-serif text-3xl sm:text-4xl text-ink">
                            {formattedPrice}
                          </span>
                          {pkg.show_price && pkg.price_from && (
                            <span className="text-xs uppercase tracking-wider text-muted font-medium">
                              / event
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted block mt-1.5">
                          {pkg.price_note || "Varies by wedding season & muhurat date"}
                        </span>
                      </div>

                      {/* Inclusions */}
                      {visibleInclusions.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-muted block">
                            Estate Inclusions:
                          </span>
                          <ul className="space-y-2.5 text-sm text-ink-soft">
                            {visibleInclusions.map((inc, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="text-zari text-xs shrink-0 mt-0.5" aria-hidden="true">◆</span>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

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
                  </article>
                </TiltCard>
              </FadeUp>
            );
          })}
        </div>

        {/* Pricing disclaimer */}
        <p className="text-xs text-muted text-center pt-2 max-w-[60ch] mx-auto uppercase tracking-wider">
          Prices vary by wedding season, auspicious dates (muhurat), and guest count. Contact
          concierge for formal quotation.
        </p>
      </div>
    </section>
  );
};
