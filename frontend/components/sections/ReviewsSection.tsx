"use client";

import React, { useState } from "react";
import { Review, SiteSettings } from "@/types/api";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";

interface ReviewsSectionProps {
  reviews: Review[];
  site: SiteSettings;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  site,
}) => {
  // We show 1 review on mobile and 3 on desktop per slide
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hide section if empty
  if (!reviews || reviews.length === 0) {
    return null;
  }

  // We can calculate slides based on total reviews
  // On mobile (single item): max index is reviews.length - 1
  // On desktop (window of 3): max index is Math.max(0, reviews.length - 3)
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < reviews.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Visible window of reviews:
  // For mobile, it's just [reviews[currentIndex]]
  // For desktop, it's 3 items starting from currentIndex, or clamped
  const desktopStartIndex = Math.min(
    currentIndex,
    Math.max(0, reviews.length - 3)
  );
  const desktopReviews = reviews.slice(desktopStartIndex, desktopStartIndex + 3);

  return (
    <section
      id="reviews"
      className="py-20 sm:py-32 bg-bg border-b border-border"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <FadeUp>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
                Patron Impressions
              </span>
              <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-primary">
                Words from Families
              </h2>
              <p className="text-[15px] sm:text-[17px] text-muted leading-[1.65] max-w-[62ch]">
                Genuine impressions from hosts and couples celebrated at {site.venue_name}.
              </p>
            </div>

            {/* Navigation Arrows */}
            {reviews.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className="w-10 h-10 rounded-none border border-border bg-white flex items-center justify-center text-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5 text-text" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="w-10 h-10 rounded-none border border-border bg-white flex items-center justify-center text-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5 text-text" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Mobile View: 1 review at a time */}
        <div className="md:hidden">
          {reviews[currentIndex] && (
            <div className="bg-white rounded-none p-6 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-accent" aria-label={`${reviews[currentIndex].rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < reviews[currentIndex].rating
                          ? "fill-accent text-accent"
                          : "text-stone-300"
                      }`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-accent font-semibold uppercase tracking-[0.16em]">
                  {reviews[currentIndex].source || "Google Review"}
                </span>
              </div>

              <p className="text-[15px] sm:text-[16px] text-text font-serif italic leading-[1.65]">
                &ldquo;{reviews[currentIndex].text}&rdquo;
              </p>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                <span className="font-semibold text-primary uppercase tracking-wider">
                  {reviews[currentIndex].author_name}
                </span>
                {reviews[currentIndex].date && (
                  <span className="uppercase tracking-wider">{reviews[currentIndex].date}</span>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 text-center text-xs text-muted uppercase tracking-wider">
            {currentIndex + 1} of {reviews.length}
          </div>
        </div>

        {/* Desktop View: 3 reviews at a time */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {desktopReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-none p-7 border border-border flex flex-col justify-between space-y-4 transition-colors hover:border-accent"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent" aria-label={`${rev.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? "fill-accent text-accent"
                            : "text-stone-300"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-accent font-semibold uppercase tracking-[0.16em]">
                    {rev.source || "Google Review"}
                  </span>
                </div>

                <p className="text-[15px] text-text font-serif italic leading-[1.65]">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                <span className="font-semibold text-primary uppercase tracking-wider">
                  {rev.author_name}
                </span>
                {rev.date && <span className="uppercase tracking-wider">{rev.date}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Google Reviews Link */}
        {site.google_reviews_url && (
          <div className="pt-4 text-center">
            <a
              href={site.google_reviews_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                rightIcon={<ExternalLink className="w-4 h-4" strokeWidth={1.5} />}
              >
                See all reviews on Google
              </Button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
