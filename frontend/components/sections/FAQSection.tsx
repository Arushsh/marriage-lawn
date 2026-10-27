"use client";

import React, { useState } from "react";
import { FAQ } from "@/types/api";
import { ChevronDown } from "lucide-react";
import { FadeUp } from "@/components/ui/FadeUp";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

interface FAQSectionProps {
  faqs: FAQ[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  // Show at most the first 6 questions
  const displayedFaqs = faqs.slice(0, 6);

  // Accordion state: only one open at a time
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!displayedFaqs || displayedFaqs.length === 0) {
    return null;
  }

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="relative py-20 sm:py-32 passage-pearl">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12 sm:space-y-16 flex flex-col items-center">
        <FadeUp>
          <div className="space-y-4 max-w-3xl">
            <AnimatedHeading
              as="h2"
              className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
            >
              Frequently Addressed Inquiries
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
              Important clarifications regarding ceremony bookings, outside vendor protocols,
              catering facilities, and sound curfew.
            </p>
          </div>
        </FadeUp>

        {/* Accordion list with zari hairlines */}
        <div className="max-w-[900px] divide-y divide-border border-y border-border">
          {displayedFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-answer-${faq.id}`;
            const headerId = `faq-question-${faq.id}`;

            return (
              <div key={faq.id} className="py-6">
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between text-left gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani rounded-lg py-1 cursor-pointer"
                >
                  <span className="font-serif text-[19px] sm:text-[22px] text-ink group-hover:text-zari-bright transition-colors leading-[1.3]">
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 border-rani/60 text-rani bg-rani/10"
                        : "border-border text-muted group-hover:text-ink group-hover:border-border-strong"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="pt-3 pr-8 sm:pr-12 text-[15px] sm:text-[16px] text-muted leading-[1.7]"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
