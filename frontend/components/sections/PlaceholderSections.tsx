import React from "react";
import { SiteSettings } from "@/types/api";
import { Button } from "@/components/ui/Button";

interface PlaceholdersProps {
  site: SiteSettings;
}

export const ReviewsPlaceholder: React.FC<PlaceholdersProps> = ({ site }) => {
  return (
    <section id="reviews" className="py-20 sm:py-32 bg-[#FFFBF4] border-t border-black/[0.04]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8">
        <div className="bg-surface rounded-2xl p-8 sm:p-14 border border-black/[0.08] text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-sm font-serif text-accent block">
            ★ {site.rating_value} out of 5 ({site.rating_count} reviews)
          </span>
          <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
            Customer Reviews
          </h2>
          <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch] mx-auto">
            Families trust {site.venue_name} for memorable celebrations and attentive hospitality.
          </p>
          {site.google_reviews_url && (
            <div className="pt-2">
              <a href={site.google_reviews_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md">
                  View Google Reviews
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
