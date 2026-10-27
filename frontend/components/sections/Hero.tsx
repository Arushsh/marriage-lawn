"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SiteSettings, Hall } from "@/types/api";
import { OnlineBookingModal } from "@/components/booking/OnlineBookingModal";
import { InstantCallModal } from "@/components/voice/InstantCallModal";
import { scrollToTarget } from "@/lib/scroll";
import { ArrowDown, Calendar, ArrowRight, Compass, Sparkles } from "lucide-react";

interface HeroProps {
  site: SiteSettings;
  halls?: Hall[];
}

/**
 * Cinematic Wedding Venue Hero Section with GSAP & ScrollTrigger.
 *
 * Visual Direction:
 *  - Full-screen real wedding venue photography (illuminated evening lawn & mandap).
 *  - Charcoal/black overlay (#100F0D) with champagne-gold (#D6B779) and ivory (#F7F0E4) accents.
 *  - Large editorial serif typography with romantic luxury aesthetic.
 *  - GSAP ScrollTrigger camera dolly push-in on scroll with multi-layer 3D parallax.
 *  - Seamless continuous visual journey from hero into venue introduction.
 *  - Accessible, responsive, with graceful fallback for prefers-reduced-motion.
 */
export const Hero: React.FC<HeroProps> = ({ site, halls = [] }) => {
  const heroWrapperRef = useRef<HTMLElement>(null);
  const heroPinRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const stardustLayerRef = useRef<HTMLDivElement>(null);

  // Hero headline & content refs for GSAP
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const trustBadgeRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // Transition Venue Introduction ref
  const venueIntroRef = useRef<HTMLDivElement>(null);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const maxCapacity = halls.reduce(
    (max, h) => Math.max(max, h.floating_capacity || h.seating_capacity || 0),
    0
  );
  const capacityFormatted =
    maxCapacity > 0 ? maxCapacity.toLocaleString() : "1,500";

  // Hero Copy — customizable via site settings with high-end luxury defaults
  const headline = site.tagline?.includes("Where")
    ? site.tagline
    : "Where Forever Begins.";
  const supportingText =
    site.tagline && site.tagline !== headline
      ? site.tagline
      : "A timeless setting for extraordinary celebrations and unforgettable memories.";

  // High-resolution local wedding photography default
  const heroPhoto = site.hero_image || "/images/hero-venue.jpg";

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let isCancelled = false;

    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (isCancelled || !heroWrapperRef.current) return;
        gsap.registerPlugin(ScrollTrigger);

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        ctx = gsap.context(() => {
          if (reduced) {
            // Reduced motion fallback: simple static state
            gsap.set(
              [
                eyebrowRef.current,
                headlineRef.current,
                descriptionRef.current,
                ctaGroupRef.current,
                trustBadgeRef.current,
                scrollIndicatorRef.current,
              ],
              { opacity: 1, y: 0 }
            );
            return;
          }

          // ── 1. Initial Page Load Animation ─────────────────────────────
          const loadTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });

          // Start image slightly zoomed in (1.14) and settle smoothly into position (1.04)
          loadTimeline.fromTo(
            imageContainerRef.current,
            { scale: 1.14 },
            { scale: 1.04, duration: 2.0, ease: "power2.out" }
          );

          // Subtle background overlay breath-in
          loadTimeline.fromTo(
            darkOverlayRef.current,
            { opacity: 0.35 },
            { opacity: 0.65, duration: 1.6, ease: "power1.inOut" },
            0
          );

          // Editorial typography entrance: elegant upward float
          loadTimeline.fromTo(
            [
              eyebrowRef.current,
              headlineRef.current,
              descriptionRef.current,
              ctaGroupRef.current,
              trustBadgeRef.current,
              scrollIndicatorRef.current,
            ],
            { opacity: 0, y: 36, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.1,
              stagger: 0.12,
              ease: "power2.out",
            },
            0.3
          );

          // Ambient stardust drift in
          if (stardustLayerRef.current) {
            loadTimeline.fromTo(
              stardustLayerRef.current,
              { opacity: 0 },
              { opacity: 0.7, duration: 2.2, ease: "power2.out" },
              0.4
            );
          }

          // ── 2. Scroll-Linked Cinematic Camera & Parallax (GSAP ScrollTrigger) ──
          const isMobile = window.innerWidth < 768;
          const scrollDistance = isMobile ? "+=90%" : "+=140%";

          const scrollTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: heroWrapperRef.current,
              start: "top top",
              end: scrollDistance,
              pin: heroPinRef.current,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Layer 1 (Back): Camera pushes forward into the illuminated lawn & mandap
          scrollTimeline.to(
            imageContainerRef.current,
            {
              scale: 1.24,
              yPercent: 4,
              ease: "none",
            },
            0
          );

          // Layer 2 (Mid): Ambient stardust / bokeh drifts at parallax speed
          if (stardustLayerRef.current) {
            scrollTimeline.to(
              stardustLayerRef.current,
              {
                yPercent: -20,
                opacity: 0.25,
                ease: "none",
              },
              0
            );
          }

          // Layer 3 (Foreground): Hero Title & CTAs float upward and dissolve
          scrollTimeline.to(
            [
              eyebrowRef.current,
              headlineRef.current,
              descriptionRef.current,
              ctaGroupRef.current,
              trustBadgeRef.current,
            ],
            {
              y: -100,
              opacity: 0,
              filter: "blur(8px)",
              stagger: 0.04,
              ease: "none",
            },
            0
          );

          // Scroll indicator fades out immediately on first scroll touch
          scrollTimeline.to(
            scrollIndicatorRef.current,
            {
              opacity: 0,
              y: -25,
              duration: 0.2,
              ease: "none",
            },
            0
          );

          // ── 3. Next Section Transition: Venue Introduction Reveals ─────
          // As the headline dissolves, the elegant venue intro reveals smoothly
          if (venueIntroRef.current) {
            scrollTimeline.fromTo(
              venueIntroRef.current,
              {
                opacity: 0,
                y: 80,
                filter: "blur(10px)",
                pointerEvents: "none",
              },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                pointerEvents: "auto",
                duration: 0.5,
                ease: "power2.out",
              },
              0.48
            );
          }

          // Deepen overlay toward black/charcoal at the end of the pin
          scrollTimeline.to(
            darkOverlayRef.current,
            {
              opacity: 0.88,
              ease: "none",
            },
            0.55
          );
        }, heroWrapperRef);
      } catch {
        // Fallback if GSAP fails to load
      }
    })();

    return () => {
      isCancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <>
      <section
        id="home"
        ref={heroWrapperRef}
        className="relative w-full bg-[#100F0D] text-[#F7F0E4] select-none"
      >
        {/* Pinned Cinematic Screen (100svh) */}
        <div
          ref={heroPinRef}
          className="relative w-full h-[100svh] overflow-hidden flex flex-col justify-between"
        >
          {/* ── Background Photography Layer (Scales with Scroll) ── */}
          <div
            ref={imageContainerRef}
            className="absolute inset-0 w-full h-full will-change-transform"
            style={{ transformOrigin: "center center" }}
          >
            <Image
              src={heroPhoto}
              alt={`Cinematic view of ${site.venue_name} wedding venue lawn and mandap`}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* ── Dark Charcoal Cinematic Overlays (#100F0D) ── */}
          {/* Dynamic dark tint that deepens on scroll */}
          <div
            ref={darkOverlayRef}
            aria-hidden="true"
            className="absolute inset-0 bg-[#100F0D] pointer-events-none transition-opacity"
            style={{ opacity: 0.65 }}
          />

          {/* Luxury directional gradients for maximum text legibility & contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#100F0D] via-[#100F0D]/40 to-[#100F0D]/70 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,transparent_20%,rgba(16,15,13,0.7)_90%)] pointer-events-none"
          />

          {/* ── Champagne Stars, Particles & Bokeh Atmosphere ── */}
          <div
            ref={stardustLayerRef}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {/* Ambient radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(214,183,121,0.14)_0%,transparent_48%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_65%,rgba(247,240,228,0.06)_0%,transparent_40%)]" />

            {/* ── Twinkling Star Dots ── */}
            {/* Row 1 */}
            <div className="absolute top-[8%] left-[12%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-90" style={{animation:'pulse 2.1s ease-in-out infinite'}} />
            <div className="absolute top-[12%] left-[28%] w-[2px] h-[2px] rounded-full bg-[#D6B779] opacity-80" style={{animation:'pulse 3.4s ease-in-out 0.6s infinite'}} />
            <div className="absolute top-[6%] left-[55%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-70" style={{animation:'pulse 2.8s ease-in-out 1.2s infinite'}} />
            <div className="absolute top-[9%] left-[72%] w-[2px] h-[2px] rounded-full bg-[#D6B779] opacity-85" style={{animation:'pulse 1.9s ease-in-out 0.3s infinite'}} />
            <div className="absolute top-[14%] left-[88%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-60" style={{animation:'pulse 3.2s ease-in-out 2.1s infinite'}} />
            {/* Row 2 */}
            <div className="absolute top-[22%] left-[6%] w-[2px] h-[2px] rounded-full bg-[#D6B779] opacity-75" style={{animation:'pulse 2.6s ease-in-out 0.9s infinite'}} />
            <div className="absolute top-[19%] left-[38%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-90" style={{animation:'pulse 1.7s ease-in-out 1.5s infinite'}} />
            <div className="absolute top-[25%] left-[63%] w-[2px] h-[2px] rounded-full bg-[#D6B779] opacity-65" style={{animation:'pulse 3.8s ease-in-out 0.2s infinite'}} />
            <div className="absolute top-[18%] left-[82%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-80" style={{animation:'pulse 2.3s ease-in-out 1.8s infinite'}} />
            {/* Row 3 */}
            <div className="absolute top-[34%] left-[15%] w-[2px] h-[2px] rounded-full bg-[#D6B779] opacity-70" style={{animation:'pulse 2.9s ease-in-out 0.5s infinite'}} />
            <div className="absolute top-[38%] left-[48%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-55" style={{animation:'pulse 4.1s ease-in-out 1.1s infinite'}} />
            <div className="absolute top-[31%] left-[78%] w-[2px] h-[2px] rounded-full bg-[#D6B779] opacity-85" style={{animation:'pulse 2.0s ease-in-out 2.4s infinite'}} />
            {/* Row 4 (upper mid) */}
            <div className="absolute top-[44%] left-[22%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-60" style={{animation:'pulse 3.5s ease-in-out 0.7s infinite'}} />
            <div className="absolute top-[42%] left-[58%] w-[2px] h-[2px] rounded-full bg-[#D6B779] opacity-75" style={{animation:'pulse 1.8s ease-in-out 1.3s infinite'}} />
            <div className="absolute top-[47%] left-[91%] w-[3px] h-[3px] rounded-full bg-[#F7F0E4] opacity-65" style={{animation:'pulse 2.7s ease-in-out 2.0s infinite'}} />

            {/* ── 4-Point Sparkle Cross Stars ── */}
            {[
              {top:'7%',left:'45%',size:8,delay:'0s',dur:'3s',color:'#D6B779'},
              {top:'15%',left:'18%',size:6,delay:'1.2s',dur:'2.5s',color:'#F7F0E4'},
              {top:'28%',left:'92%',size:7,delay:'0.4s',dur:'3.8s',color:'#D6B779'},
              {top:'40%',left:'34%',size:6,delay:'2.1s',dur:'2.2s',color:'#F7F0E4'},
              {top:'11%',left:'68%',size:5,delay:'0.8s',dur:'4.0s',color:'#D6B779'},
            ].map((s,i) => (
              <svg key={i} aria-hidden="true" className="absolute" style={{top:s.top,left:s.left,width:s.size,height:s.size,opacity:0.7,animation:`pulse ${s.dur} ease-in-out ${s.delay} infinite`}} viewBox="0 0 10 10">
                <path d="M5 0 L5.4 4.6 L10 5 L5.4 5.4 L5 10 L4.6 5.4 L0 5 L4.6 4.6 Z" fill={s.color} />
              </svg>
            ))}

            {/* ── Bokeh Orbs (large soft glows) ── */}
            <div className="absolute top-[10%] left-[40%] w-24 h-24 rounded-full bg-[#D6B779]/8 blur-2xl" style={{animation:'pulse 6s ease-in-out infinite'}} />
            <div className="absolute top-[30%] left-[70%] w-32 h-32 rounded-full bg-[#F7F0E4]/5 blur-3xl" style={{animation:'pulse 8s ease-in-out 2s infinite'}} />
            <div className="absolute top-[5%] left-[5%] w-20 h-20 rounded-full bg-[#D6B779]/6 blur-2xl" style={{animation:'pulse 7s ease-in-out 1s infinite'}} />

            {/* ── Floating Ember Particles ── */}
            {[
              {left:'18%',delay:'0s',dur:'7s'},{left:'32%',delay:'1.4s',dur:'9s'},
              {left:'54%',delay:'0.6s',dur:'8s'},{left:'71%',delay:'2.1s',dur:'6.5s'},
              {left:'85%',delay:'1.1s',dur:'10s'},{left:'7%',delay:'3.2s',dur:'7.5s'},
            ].map((e,i) => (
              <div key={i} className="absolute bottom-0 w-[3px] h-[3px] rounded-full bg-[#D6B779]" style={{left:e.left,opacity:0,animation:`emberDrift ${e.dur} ease-out ${e.delay} infinite`}} />
            ))}
          </div>

          {/* Spacer for fixed transparent navigation bar */}
          <div className="w-full h-20 shrink-0" />

          {/* ── Hero Main Content: Large Editorial Serif Typography ── */}
          <div className="relative z-20 max-w-[1280px] w-full mx-auto px-5 sm:px-10 lg:px-16 flex-1 flex flex-col justify-center">
            <div className="max-w-4xl space-y-6 sm:space-y-8">
              {/* Gold Eyebrow */}
              <div
                ref={eyebrowRef}
                className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-[#D6B779]"
              >
                <span className="w-7 h-[1px] bg-[#D6B779]/80" />
                <span>
                  ROYAL WEDDING SANCTUARY · {site.city.toUpperCase()} · EST.{" "}
                  {site.years_of_experience > 0
                    ? new Date().getFullYear() - site.years_of_experience
                    : "2006"}
                </span>
              </div>

              {/* Editorial Serif Headline */}
              <h1
                ref={headlineRef}
                className="font-serif font-medium text-[clamp(44px,7.8vw,108px)] leading-[1.04] tracking-[-0.015em] text-[#F7F0E4] [text-wrap:balance]"
              >
                {headline}
              </h1>

              {/* Supporting Romance & Venue Description: Short, High-Impact Words */}
              <p
                ref={descriptionRef}
                className="text-[#C8C0B3] text-base sm:text-lg lg:text-xl font-light max-w-xl leading-relaxed tracking-wide"
              >
                Grand emerald lawns. Illuminated pavilions. Unforgettable vows.
              </p>

              {/* Premium Action CTAs */}
              <div
                ref={ctaGroupRef}
                className="flex flex-wrap items-center gap-4 pt-1"
              >
                {/* Primary CTA: Discover Venue */}
                <button
                  type="button"
                  onClick={() => scrollToTarget("#venue", { offset: 20 })}
                  className="group h-[52px] px-8 rounded-full bg-[#D6B779] hover:bg-[#c9a764] text-[#100F0D] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_12px_32px_-8px_rgba(214,183,121,0.45)] hover:shadow-[0_16px_40px_-8px_rgba(214,183,121,0.6)] hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
                >
                  <span>Discover Venue</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </button>

                {/* Secondary CTA: Book A Visit */}
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="h-[52px] px-8 rounded-full border border-[#D6B779]/60 hover:border-[#D6B779] bg-[#100F0D]/40 hover:bg-[#D6B779]/10 text-[#F7F0E4] hover:text-[#D6B779] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 backdrop-blur-md hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#D6B779]" strokeWidth={1.75} />
                  <span>Book A Visit</span>
                </button>
              </div>

              {/* Concise Trust Anchor Line */}
              <div
                ref={trustBadgeRef}
                className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] sm:text-xs tracking-[0.16em] uppercase text-[#C8C0B3]/80"
              >
                <span className="flex items-center gap-1.5 text-[#D6B779]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6B779]" />
                  <span>{site.rating_value || "4.8"}★ Luxury Rating</span>
                </span>
                <span className="text-[#D6B779]/40 hidden sm:inline">◆</span>
                <span>{site.weddings_hosted || 520}+ Grand Weddings</span>
                <span className="text-[#D6B779]/40 hidden sm:inline">◆</span>
                <span>Up to {capacityFormatted} Guests</span>
              </div>
            </div>
          </div>

          {/* ── Next Section Transition: Venue Introduction Reveal (Scroll-Linked) ── */}
          <div
            ref={venueIntroRef}
            id="venue"
            className="absolute inset-0 z-[25] flex items-center justify-center p-6 pointer-events-none opacity-0"
          >
            <div className="max-w-2xl w-full text-center space-y-5 sm:space-y-6 p-8 sm:p-12 rounded-3xl bg-[#100F0D]/90 backdrop-blur-xl border border-[#D6B779]/30 shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
              {/* Eyebrow Label */}
              <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs font-semibold tracking-[0.24em] uppercase text-[#D6B779]">
                <span className="w-6 h-[1px] bg-[#D6B779]/80" />
                <span>The Estate &amp; Grounds · {site.city}</span>
                <span className="w-6 h-[1px] bg-[#D6B779]/80" />
              </div>

              {/* Large Serif Heading: High-Impact */}
              <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[52px] text-[#F7F0E4] leading-[1.12] [text-wrap:balance]">
                Grand Lawns. Regal Elegance.
              </h2>

              {/* Concise Introduction: High-Impact Words */}
              <p className="text-[#C8C0B3] text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-light">
                40,000 sq.ft of manicured emerald greenery, illuminated mandap canopies,
                and timeless Awadhi hospitality.
              </p>

              {/* Transition Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => scrollToTarget("#tour360", { offset: 40 })}
                  className="h-11 px-6 rounded-full bg-[#D6B779] hover:bg-[#c9a764] text-[#100F0D] text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Grounds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="h-11 px-6 rounded-full border border-[#D6B779]/60 hover:border-[#D6B779] text-[#F7F0E4] hover:text-[#D6B779] bg-transparent text-xs font-semibold uppercase tracking-[0.16em] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Schedule A Visit</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Minimal Scroll Indicator at Bottom ── */}
          <div
            ref={scrollIndicatorRef}
            className="relative z-20 pb-8 flex flex-col items-center justify-center gap-2.5 text-[#C8C0B3] pointer-events-none"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-light text-[#D6B779]">
              Scroll To Enter
            </span>
            <div className="w-[1px] h-9 bg-gradient-to-b from-[#D6B779] via-[#D6B779]/50 to-transparent relative overflow-hidden">
              <span className="absolute top-0 left-0 w-full h-1/2 bg-[#F7F0E4] animate-[emberDrift_2s_ease-in-out_infinite]" />
            </div>
            <ArrowDown className="w-3.5 h-3.5 text-[#D6B779] animate-bounce" />
          </div>
        </div>
      </section>

      {/* Online Booking & Consultation Modals */}
      <OnlineBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <InstantCallModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </>
  );
};
