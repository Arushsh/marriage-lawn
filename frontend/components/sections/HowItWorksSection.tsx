import React from "react";
import { SiteSettings, FAQ } from "@/types/api";
import { FadeUp } from "@/components/ui/FadeUp";

interface HowItWorksSectionProps {
  site: SiteSettings;
  faqs?: FAQ[];
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  site,
  faqs = [],
}) => {
  // Extract advance policy from FAQs if present
  const advanceFaq = faqs.find(
    (f) =>
      f.question.toLowerCase().includes("advance") ||
      f.answer.toLowerCase().includes("advance")
  );

  let advanceDetail = "Confirm your booking with the initial advance payment.";
  if (advanceFaq) {
    // If the answer is concise, use the first sentence
    const firstSentence = advanceFaq.answer.split(".")[0];
    if (firstSentence && firstSentence.length < 90) {
      advanceDetail = `${firstSentence.trim()}.`;
    } else {
      advanceDetail = "Pay the required advance to lock your date and package.";
    }
  }

  const steps = [
    {
      step: "01",
      title: "Check date availability",
      description:
        "Select your preferred event date on our live availability calendar above to see open slots.",
    },
    {
      step: "02",
      title: "Send your enquiry",
      description:
        "Submit your estimated guest count and event details. Our team responds within 2 business hours.",
    },
    {
      step: "03",
      title: "Visit the venue",
      description:
        `Walk through the lawn, banquets, and guest rooms in person at ${site.city} with our manager.`,
    },
    {
      step: "04",
      title: "Confirm with advance",
      description: advanceDetail,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-32 bg-bg border-b border-border"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12 sm:space-y-16">
        <FadeUp>
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
              Ceremonial Timeline &amp; Booking
            </span>
            <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-primary">
              How Reservation Operates
            </h2>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.65] max-w-[62ch]">
              A structured four-step procedure to reserve your wedding date with absolute transparency.
            </p>
          </div>
        </FadeUp>

        {/* Numbered steps in architectural column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className={`relative flex flex-col justify-start pt-5 sm:pt-6 border-t ${
                idx === 0 ? "border-accent" : "border-border"
              }`}
            >
              <span className="font-serif text-lg tracking-widest text-accent font-semibold mb-3">
                {item.step}
              </span>
              <h3 className="font-serif text-[20px] sm:text-[22px] font-normal text-primary leading-[1.25] mb-2">
                {item.title}
              </h3>
              <p className="text-[15px] text-muted leading-[1.6]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
