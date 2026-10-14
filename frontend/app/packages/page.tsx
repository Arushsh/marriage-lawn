import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings, getPackages } from "@/lib/api";
import { constructMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Check, ArrowLeft, MessageSquare } from "lucide-react";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return constructMetadata(site, {
    title: `Wedding Packages & Pricing | ${site.venue_name}`,
    description: `Explore all-inclusive wedding, reception, and celebration packages at ${site.venue_name}, ${site.city}. View pricing, inclusions, and custom quotes.`,
    path: "/packages",
  });
}

export default async function PackagesPage() {
  const [site, packages] = await Promise.all([
    getSiteSettings(),
    getPackages(),
  ]);

  const whatsappHref = buildWhatsAppUrl(
    site.whatsapp_number,
    buildGeneralInquiryMessage(site.venue_name)
  );

  return (
    <main className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[1120px] mx-auto space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back to Home
          </Link>
          <div className="space-y-2">
            <h1 className="font-serif text-[32px] sm:text-[44px] text-primary font-normal leading-[1.2]">
              Event Packages &amp; Pricing
            </h1>
            <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[65ch]">
              Curated packages designed to accommodate events of every scale at {site.venue_name}. All options can be tailored to your guest count, catering needs, and decor specifications.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {(!packages || packages.length === 0) && (
          <div className="bg-surface rounded-2xl p-12 text-center border border-black/[0.08] max-w-xl mx-auto space-y-4">
            <h2 className="font-serif text-2xl text-primary font-normal">
              Custom Quotes Available
            </h2>
            <p className="text-sm text-muted">
              We provide tailored quotes depending on your chosen event date, seasonal muhurat, and catering preferences.
            </p>
            <Link href="/contact" className="inline-block pt-2">
              <Button variant="primary" size="md">
                Contact for Custom Quote
              </Button>
            </Link>
          </div>
        )}

        {/* Package Cards Grid */}
        {packages && packages.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {packages.map((pkg) => {
              const isPopular = pkg.is_popular;
              const formattedPrice =
                pkg.show_price && pkg.price_from
                  ? `₹${Number(pkg.price_from).toLocaleString("en-IN")}`
                  : "Get Quote";

              return (
                <Card
                  key={pkg.id}
                  className={`flex flex-col justify-between p-8 rounded-2xl border transition-colors ${
                    isPopular
                      ? "border-primary/40 bg-surface shadow-xs"
                      : "border-black/[0.07] bg-surface"
                  }`}
                >
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-serif text-[22px] sm:text-[26px] font-normal leading-[1.25] text-primary">
                          {pkg.name}
                        </h2>
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

                    <div className="py-4 border-y border-black/[0.06]">
                      <span className="text-xs text-muted block">
                        {pkg.show_price && pkg.price_from
                          ? "Starting from"
                          : "Tailored Pricing"}
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
                        {pkg.price_note || "Varies with guest count & seasonal dates"}
                      </span>
                    </div>

                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <div className="space-y-3">
                        <span className="text-xs uppercase tracking-wider font-medium text-muted block">
                          Included In Package:
                        </span>
                        <ul className="space-y-2.5 text-sm text-text/85">
                          {pkg.inclusions.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-8">
                    <Link
                      href={`/contact?package=${encodeURIComponent(pkg.name)}`}
                      className="block w-full"
                    >
                      <Button
                        variant={isPopular ? "primary" : "outline"}
                        size="md"
                        className="w-full justify-center !h-12"
                      >
                        Enquire for {pkg.name}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom Consultation Strip */}
        <div className="bg-surface rounded-2xl p-8 sm:p-12 border border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-serif text-[20px] sm:text-[24px] text-primary font-normal">
              Need a Custom Wedding Package?
            </h3>
            <p className="text-sm text-muted max-w-[50ch]">
              We accommodate multi-day celebrations, destination weddings, and custom catering setups.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button
                variant="whatsapp"
                size="md"
                leftIcon={<MessageSquare className="w-4 h-4" strokeWidth={1.5} />}
              >
                Discuss on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
