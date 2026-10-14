"use client";

import React, { useState } from "react";
import { SiteSettings, Review, FAQ } from "@/types/api";
import { AvailabilitySection } from "@/components/sections/AvailabilitySection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

interface BookingFlowProps {
  site: SiteSettings;
  reviews: Review[];
  faqs: FAQ[];
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  site,
  reviews,
  faqs,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  return (
    <>
      {/* 6.7 Interactive Month Availability Calendar */}
      <AvailabilitySection
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate(date)}
      />

      {/* 6.8 How Booking Works (Numbered steps, no boxed cards) */}
      <HowItWorksSection site={site} faqs={faqs} />

      {/* 6.9 Reviews Carousel (Desktop 3, Mobile 1, no autoplay) */}
      <ReviewsSection reviews={reviews} site={site} />

      {/* 6.10 FAQ Accordion (First 6 items, one open at a time) */}
      <FAQSection faqs={faqs} />

      {/* 6.11 Contact Section with Enquiry Form & Map */}
      <ContactSection
        site={site}
        selectedDate={selectedDate}
        onClearSelectedDate={() => setSelectedDate(undefined)}
      />

      {/* 6.12 Final CTA (One headline, one line, two buttons) */}
      <FinalCTA site={site} />
    </>
  );
};
