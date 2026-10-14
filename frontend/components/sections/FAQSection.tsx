"use client";

import React, { useState } from "react";
import { FAQ } from "@/types/api";
import { ChevronDown } from "lucide-react";
import { FadeUp } from "@/components/ui/FadeUp";

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
    <section
      id="faq"
      className="py-20 sm:py-32 bg-surface border-t border-black/[0.06]"
    >
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 space-y-12 sm:space-y-16">
        <FadeUp>
          <div className="space-y-2">
            <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
              Frequently Asked Questions
            </h2>
            <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch]">
              Common queries about booking procedures, vendor policies, and venue timings.
            </p>
          </div>
        </FadeUp>

        {/* Clean accordion list with generous spacing and thin dividers */}
        <div className="max-w-[800px] divide-y divide-black/[0.08] border-y border-black/[0.08]">
          {displayedFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-answer-${faq.id}`;
            const headerId = `faq-question-${faq.id}`;

            return (
              <div key={faq.id} className="py-5 sm:py-6">
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between text-left gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg py-1"
                >
                  <span className="font-serif text-[18px] sm:text-[20px] font-normal text-text group-hover:text-primary transition-colors leading-[1.3]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="pt-3 pr-8 sm:pr-12 text-[15px] sm:text-[16px] text-muted leading-[1.65]"
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
