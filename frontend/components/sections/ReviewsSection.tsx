"use client";

import React, { useState } from "react";
import { Review, SiteSettings } from "@/types/api";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

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

  const desktopStartIndex = Math.min(
    currentIndex,
    Math.max(0, reviews.length - 3)
  );
  const desktopReviews = reviews.slice(desktopStartIndex, desktopStartIndex + 3);

  const stars = (rating: number, key: string | number) => (
    <div className="flex items-center gap-1 text-diya" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={`${key}-${i}`}
          className={`w-4 h-4 ${
            i < rating ? "fill-diya text-diya" : "text-border-strong"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );

  return (
    <section id="reviews" className="relative py-20 sm:py-32 bg-bg border-t border-border overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 12% 0%, var(--c-diya-soft), transparent 70%)",
        }}
      />
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <FadeUp>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <AnimatedHeading
                as="h2"
                className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
              >
                Words from Families
              </AnimatedHeading>
              <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
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
                  className="w-10 h-10 rounded-lg border border-border bg-transparent flex items-center justify-center text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:border-zari/60 hover:text-zari-bright transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="w-10 h-10 rounded-lg border border-border bg-transparent flex items-center justify-center text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:border-zari/60 hover:text-zari-bright transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Mobile View: 1 review at a time */}
        <div className="md:hidden">
          {reviews[currentIndex] && (
            <FadeUp key={currentIndex} rise={18}>
              <div className="gota-glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  {stars(reviews[currentIndex].rating, "m")}
                  <span className="text-[10px] text-zari font-semibold uppercase tracking-[0.16em]">
                    {reviews[currentIndex].source || "Google Review"}
                  </span>
                </div>

                <p className="text-[15px] sm:text-[16px] text-ink font-serif italic leading-[1.7]">
                  &ldquo;{reviews[currentIndex].text}&rdquo;
                </p>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-teal uppercase tracking-wider">
                    {reviews[currentIndex].author_name}
                  </span>
                  {reviews[currentIndex].date && (
                    <span className="uppercase tracking-wider">{reviews[currentIndex].date}</span>
                  )}
                </div>
              </div>
            </FadeUp>
          )}

          <div className="pt-3 text-center text-xs text-muted uppercase tracking-wider">
            {currentIndex + 1} of {reviews.length}
          </div>
        </div>

        {/* Desktop View: 3 reviews at a time */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {desktopReviews.map((rev) => (
            <FadeUp key={rev.id} rise={22} className="h-full">
              <div className="gota-glass rounded-2xl p-7 flex flex-col justify-between space-y-4 h-full transition-all duration-500 hover:-translate-y-1 hover:border-border-strong">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {stars(rev.rating, rev.id)}
                    <span className="text-[10px] text-zari font-semibold uppercase tracking-[0.16em]">
                      {rev.source || "Google Review"}
                    </span>
                  </div>

                  <p className="text-[15px] text-ink font-serif italic leading-[1.7]">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-teal uppercase tracking-wider">
                    {rev.author_name}
                  </span>
                  {rev.date && <span className="uppercase tracking-wider">{rev.date}</span>}
                </div>
              </div>
            </FadeUp>
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
