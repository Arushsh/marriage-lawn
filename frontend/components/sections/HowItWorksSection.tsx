import React from "react";
import { SiteSettings, FAQ } from "@/types/api";
import { FadeUp } from "@/components/ui/FadeUp";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";
import { CalendarCheck, Send, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { scrollToTarget } from "@/lib/scroll";

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
      badge: "Live Calendar",
      icon: CalendarCheck,
      action: "Check Dates",
      target: "#availability",
      description:
        "Select your preferred event date on our live availability calendar above to see open slots.",
    },
    {
      step: "02",
      title: "Send your enquiry",
      badge: "2-Hr Response",
      icon: Send,
      action: "Send Enquiry",
      target: "#contact",
      description:
        "Submit your estimated guest count and event details. Our team responds within 2 business hours.",
    },
    {
      step: "03",
      title: "Visit the venue",
      badge: "Guided Tour",
      icon: MapPin,
      action: "Explore Grounds",
      target: "#tour360",
      description: `Walk through the lawn, banquets, and guest rooms in person at ${site.city} with our manager.`,
    },
    {
      step: "04",
      title: "Confirm with advance",
      badge: "Date Secured",
      icon: ShieldCheck,
      action: "Book Instantly",
      target: "#contact",
      description: advanceDetail,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 sm:py-32 bg-bg border-t border-border overflow-hidden">
      {/* Ambient background light */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-96 h-96 bg-diya/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12 sm:space-y-16 relative z-10">
        <FadeUp>
          <div className="space-y-4 max-w-2xl">
            <span className="text-[11px] font-semibold text-zari uppercase tracking-[0.22em] block">
              Ceremonial Timeline &amp; Booking
            </span>
            <AnimatedHeading
              as="h2"
              className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
            >
              How Reservation Operates
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
              A structured four-step procedure to reserve your wedding date with absolute
              transparency.
            </p>
          </div>
        </FadeUp>

        {/* ── DESKTOP TIMELINE (md and up) ── */}
        <div className="hidden md:block">
          {/* Continuous Milestone Rail */}
          <div className="relative mb-8">
            {/* Background track line spanning full width */}
            <div className="absolute top-[10px] left-[10px] right-[10px] h-[2px] bg-gradient-to-r from-diya via-zari/35 to-border" aria-hidden="true" />

            <div className="grid grid-cols-4 gap-8 lg:gap-10">
              {steps.map((item, idx) => {
                const isFirst = idx === 0;

                return (
                  <div key={`track-${item.step}`} className="flex flex-col items-center relative">
                    {/* Milestone Knot (Diamond) */}
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <div
                        className={`w-5 h-5 rotate-45 flex items-center justify-center transition-all duration-300 ${
                          isFirst
                            ? "bg-diya border-2 border-diya shadow-[0_0_20px_4px_rgba(255,180,84,0.55)] scale-110"
                            : "bg-surface border border-zari/60 hover:border-diya hover:scale-110"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isFirst ? "bg-bg" : "bg-zari/70"
                          }`}
                        />
                      </div>

                      {/* Auspicious pulse ring for active Step 01 */}
                      {isFirst && (
                        <span className="absolute -inset-1.5 rotate-45 border border-diya/40 animate-ping rounded-none pointer-events-none" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Cards Grid */}
          <div className="grid grid-cols-4 gap-8 lg:gap-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isFirst = idx === 0;

              return (
                <FadeUp key={item.step} delay={idx * 0.1} className="relative h-full">
                  <div
                    className={`group relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all duration-400 border ${
                      isFirst
                        ? "bg-surface/60 border-diya/30 shadow-[0_16px_36px_-16px_rgba(255,180,84,0.12)] hover:border-diya/50"
                        : "bg-surface/30 border-border/70 hover:border-zari/50 hover:bg-surface/60"
                    } hover:-translate-y-1`}
                  >
                    <div>
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`font-serif text-2xl font-bold tracking-wider ${
                            isFirst ? "text-diya" : "text-zari"
                          }`}
                        >
                          {item.step}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                            isFirst
                              ? "bg-diya/15 border-diya/30 text-diya"
                              : "bg-bg/60 border-border text-muted group-hover:text-zari group-hover:border-zari/40"
                          }`}
                        >
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Title & Badge */}
                      <span className="inline-block text-[10px] font-semibold tracking-[0.16em] uppercase text-muted mb-1.5">
                        {item.badge}
                      </span>
                      <h3 className="font-serif text-[20px] lg:text-[21px] text-ink leading-[1.25] mb-2.5 font-medium group-hover:text-zari-bright transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[14px] text-muted leading-[1.65]">
                        {item.description}
                      </p>
                    </div>

                    {/* Interactive quick action */}
                    <div className="pt-5 mt-4 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => scrollToTarget(item.target, { offset: 40 })}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                          isFirst
                            ? "text-diya hover:text-diya/80"
                            : "text-muted hover:text-zari"
                        }`}
                      >
                        <span>{item.action}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE TIMELINE (< md): Vertical ceremonial zari seam ── */}
        <div className="block md:hidden relative pl-8">
          {/* Vertical ceremonial zari seam */}
          <div
            aria-hidden="true"
            className="absolute left-[9px] top-3 bottom-6 w-[2px] bg-gradient-to-b from-diya via-zari/40 to-border"
          />

          <div className="space-y-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isFirst = idx === 0;

              return (
                <FadeUp key={`mobile-${item.step}`} delay={idx * 0.1} className="relative">
                  {/* Knot on the vertical seam */}
                  <div
                    aria-hidden="true"
                    className={`absolute -left-8 top-1.5 w-[18px] h-[18px] rotate-45 flex items-center justify-center transition-all ${
                      isFirst
                        ? "bg-diya border-2 border-diya shadow-[0_0_16px_rgba(255,180,84,0.5)]"
                        : "bg-surface border border-zari/70"
                    }`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full ${
                        isFirst ? "bg-bg" : "bg-zari/70"
                      }`}
                    />
                  </div>

                  {/* Card Content */}
                  <div
                    className={`p-5 rounded-xl border ${
                      isFirst
                        ? "bg-surface/70 border-diya/30 shadow-[0_8px_24px_-10px_rgba(255,180,84,0.15)]"
                        : "bg-surface/40 border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-serif text-xl font-bold ${
                            isFirst ? "text-diya" : "text-zari"
                          }`}
                        >
                          {item.step}
                        </span>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted">
                          · {item.badge}
                        </span>
                      </div>
                      <Icon className={`w-4 h-4 ${isFirst ? "text-diya" : "text-muted"}`} strokeWidth={1.5} />
                    </div>

                    <h3 className="font-serif text-[18px] text-ink leading-tight mb-2 font-medium">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-muted leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => scrollToTarget(item.target, { offset: 40 })}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                        isFirst ? "text-diya" : "text-zari"
                      }`}
                    >
                      <span>{item.action}</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

