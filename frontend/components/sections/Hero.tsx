"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { SiteSettings, Hall } from "@/types/api";
import { OnlineBookingModal } from "@/components/booking/OnlineBookingModal";
import { InstantCallModal } from "@/components/voice/InstantCallModal";
import { Calendar, PhoneCall, Sparkles, Star, Volume2, VolumeX } from "lucide-react";

interface HeroProps {
  site: SiteSettings;
  halls?: Hall[];
}

interface Scene {
  title: string;
  subtitle: string;
  phaseLabel: string;
  caption: string;
  image: string;
  alt: string;
  objectPosition: string;
  transformOrigin: string;
}

const SCENES: Scene[] = [
  {
    title: "Begin Your Forever",
    subtitle: "The Grand Royal Palace & Courtyard Entrance",
    phaseLabel: "PHASE 01 • THE PALACE ARRIVAL",
    caption: "Step through historic illuminated gates into an evening of royal heritage",
    image: "/palace-exterior.jpg",
    alt: "Grand illuminated Shree Palace Lawn exterior entrance facade and courtyard at twilight",
    objectPosition: "center 10%",
    transformOrigin: "center 22%",
  },
  {
    title: "Celebrate Under the Stars",
    subtitle: "Lush Illuminated Green Lawn with Elegant Guest Seating",
    phaseLabel: "PHASE 02 • THE SPRAWLING LAWN",
    caption: "40,000 sq.ft of velvet greenery, glowing chandeliers & celebratory warmth",
    image: "/palace-lawn.jpg",
    alt: "Vast sprawling illuminated marriage lawn with round table guest seating and chandeliers",
    objectPosition: "center 45%",
    transformOrigin: "center 50%",
  },
  {
    title: "A Venue as Grand as Your Love",
    subtitle: "Golden Arched Colonnades & Heritage Walkways",
    phaseLabel: "PHASE 03 • ROYAL COLONNADE WALKWAY",
    caption: "Walk beneath regal golden arches reflecting candlelight and timeless romance",
    image: "/palace-colonnade.jpg",
    alt: "Illuminated golden arched palace colonnade walkway with reflective marble floors",
    objectPosition: "center center",
    transformOrigin: "center 50%",
  },
  {
    title: "The Grand Botanic Lawn",
    subtitle: "Bespoke Decorated Vedic Mandap & Varmala Stage",
    phaseLabel: "PHASE 04 • THE SACRED MANDAP",
    caption: "Arriving at the sacred altar where vows are consecrated for eternity",
    image: "/palace-mandap.jpg",
    alt: "Royal wedding mandap decorated with golden carved arches, royal thrones and marigold florals",
    objectPosition: "center 20%",
    transformOrigin: "center 30%",
  },
];

// Film duration in seconds
const TOTAL_FILM_SECONDS = 74;
// Progress threshold where story transitions into the Grand Climax
const CLIMAX_THRESHOLD = 0.84;

export const Hero: React.FC<HeroProps> = ({ site, halls = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Raw scroll progress and smoothed/damped lerp progress for cinematic inertia delay
  const [rawProgress, setRawProgress] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // High-performance scroll tracking
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollableDistance = container.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const currentRaw = Math.min(
        Math.max(-rect.top / scrollableDistance, 0),
        1
      );
      setRawProgress(currentRaw);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Cinematic Damping / Smooth Responsive Tracking
  // Damping factor: 0.16 gives instant, tactile response without lagging behind scroll
  useEffect(() => {
    let animId: number;
    const lerpFactor = 0.16;

    const tick = () => {
      setProgress((prev) => {
        const diff = rawProgress - prev;
        if (Math.abs(diff) < 0.0002) return rawProgress;
        return prev + diff * lerpFactor;
      });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [rawProgress]);

  // Web Audio API: Soothing 432Hz ambient palace soundscape for the ✦ diamond star
  const toggleAmbientAudio = useCallback(() => {
    if (isAudioActive) {
      // Fade out and stop
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(
          0.0001,
          audioCtxRef.current.currentTime,
          0.3
        );
        setTimeout(() => {
          oscillatorsRef.current.forEach((osc) => {
            try {
              osc.stop();
            } catch {}
          });
          oscillatorsRef.current = [];
          setIsAudioActive(false);
        }, 350);
      } else {
        setIsAudioActive(false);
      }
    } else {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Warm palace chord frequencies (Root A4 432Hz, E5 648Hz, C#5 540Hz)
        const freqs = [216, 432, 540, 648];
        const oscs: OscillatorNode[] = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Subtle harmonic detuning for royal palace warmth
          if (idx > 0) {
            osc.detune.setValueAtTime(idx * 3.5, ctx.currentTime);
          }

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(800, ctx.currentTime);

          osc.connect(filter);
          filter.connect(masterGain);
          osc.start();
          oscs.push(osc);
        });

        oscillatorsRef.current = oscs;
        setIsAudioActive(true);
      } catch {
        setIsAudioActive(false);
      }
    }
  }, [isAudioActive]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch {}
      });
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Jump smoothly to a specific point in the film
  const scrollToRatio = useCallback((ratio: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerTop = window.scrollY + container.getBoundingClientRect().top;
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    const targetY = containerTop + ratio * scrollableDistance;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, []);

  // Live film timecode calculation (e.g. 00:24 / 01:14)
  const currentSeconds = Math.min(
    Math.floor(progress * TOTAL_FILM_SECONDS),
    TOTAL_FILM_SECONDS
  );
  const formattedMinutes = String(Math.floor(currentSeconds / 60)).padStart(
    2,
    "0"
  );
  const formattedSeconds = String(currentSeconds % 60).padStart(2, "0");
  const timecodeString = `${formattedMinutes}:${formattedSeconds} / 01:14`;

  // Story stage progression:
  // Progress 0.0 to 0.08: Stage 0 Intro Title Card ("M A H A L" Film Title)
  // Progress 0.08 to 0.84: The 4 Walkthrough Scenes with continuous walking zoom
  // Progress 0.84 to 1.0: Grand Climax Reveal Card
  const WALK_START = 0.06;
  const introOpacity = Math.max(0, 1 - progress / 0.09);
  const isIntro = progress < 0.08;

  const storyProgress = Math.min(
    Math.max((progress - WALK_START) / (CLIMAX_THRESHOLD - WALK_START), 0),
    1
  );
  // 0.0 to 3.0 across the 4 walkthrough phases
  const storyStage = storyProgress * 3.0;

  const isClimax = progress >= CLIMAX_THRESHOLD;
  const climaxFactor = Math.min(
    Math.max((progress - CLIMAX_THRESHOLD) / (1.0 - CLIMAX_THRESHOLD), 0),
    1
  );

  const maxCapacity = halls.reduce(
    (max, h) => Math.max(max, h.floating_capacity || h.seating_capacity || 0),
    0
  );
  const capacityFormatted =
    maxCapacity > 0 ? maxCapacity.toLocaleString() : "1,500";

  return (
    <>
      {/* 
        Full-bleed scroll container: 540vh height provides generous delay and scroll budget
        for the continuous photorealistic 3D walkthrough requested.
      */}
      <section
        id="home"
        ref={containerRef}
        className="relative h-[540vh] bg-stone-950 text-white select-none"
      >
        {/* Pinned 100vh Cinema Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
          {/* Base royal dark gradient backdrop */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, #1b0710 0%, #0d0306 50%, #000000 100%)",
            }}
          />

          {/* Persistent Base Palace Scene 0 Layer */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
            <Image
              src="/palace-exterior.jpg"
              alt="Palatial estate grounds"
              fill
              unoptimized
              priority
              sizes="100vw"
              style={{ objectPosition: "center 10%" }}
              className="object-cover transform scale-105 filter blur-xs"
            />
          </div>

          {/* Background Images with Continuous Forward Walking Zoom */}
          {SCENES.map((scene, i) => {
            const dist = Math.abs(storyStage - i);
            const baseOpacity = Math.max(0, 1 - Math.pow(dist, 1.25) * 1.25);
            // Scene 0 stays partially visible during Stage 0 intro
            const introMod = i === 0 ? Math.max(0.45, 1 - introOpacity * 0.55) : (1 - introOpacity);
            const opacity = baseOpacity * introMod * (1 - climaxFactor);

            // Forward camera push zoom: zooms smoothly from 1.00 up to 1.38 as you walk through each phase
            const sceneLocalProgress = Math.max(
              0,
              Math.min(1, (storyStage - (i - 0.75)) / 1.5)
            );
            const scale = 1.00 + sceneLocalProgress * 0.38;
            const cameraPanY = (sceneLocalProgress - 0.5) * -16;

            return (
              <div
                key={scene.title}
                style={{
                  opacity,
                  transition: "opacity 0.12s ease-out",
                }}
                className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
              >
                <div
                  style={{
                    transform: `scale(${scale}) translateY(${cameraPanY}px)`,
                    transformOrigin: scene.transformOrigin,
                    willChange: "transform",
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={scene.image}
                    alt={scene.alt}
                    fill
                    unoptimized
                    priority={i < 2}
                    sizes="100vw"
                    style={{ objectPosition: scene.objectPosition }}
                    className="object-cover"
                  />
                </div>
                {/* Cinema Lighting: Subtle vignette that keeps the palace illuminated & bright */}
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/15" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />
                {/* Ambient Regal Gold Sheen */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_75%)]" />
              </div>
            );
          })}

          {/* Climax Backdrop Image (Illuminated Palace Hall) */}
          {(() => {
            const climaxScale = 1.00 + climaxFactor * 0.18;
            return (
              <div
                style={{
                  opacity: climaxFactor,
                  transition: "opacity 0.25s ease-out",
                }}
                className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
              >
                <div
                  style={{
                    transform: `scale(${climaxScale})`,
                    transformOrigin: "center 50%",
                    willChange: "transform",
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src="/palace-hall.jpg"
                    alt={site.venue_name}
                    fill
                    unoptimized
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="absolute inset-0 bg-black/65" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/80" />
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* STAGE 0: Iconic "M A H A L" Film Intro Card               */}
          {/* Positioned in lower half so the palace rises majestically */}
          {/* ======================================================== */}
          <div
            style={{
              opacity: introOpacity,
              transform: `scale(${1 + (1 - introOpacity) * 0.08})`,
              pointerEvents: isIntro ? "auto" : "none",
              transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
            }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 sm:pb-22 md:pb-28 text-center px-6"
          >
            {/* Centered Palace Film Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-black/70 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs uppercase tracking-[0.3em] font-mono mb-3 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>THE PALACE FILM · 4K CINEMATIC WALKTHROUGH</span>
            </div>

            {/* Majestic "M A H A L" Title */}
            <div className="space-y-3 max-w-4xl mx-auto">
              <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-[0.35em] font-light text-white leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] select-none">
                M A H A L
              </h1>

              {/* Hairline Divider */}
              <div className="w-16 h-px bg-amber-400/60 mx-auto my-3" />

              {/* Subtitle */}
              <p className="font-serif italic text-white/90 text-xs sm:text-sm md:text-base tracking-[0.12em] font-light max-w-xl mx-auto drop-shadow-lg">
                Seventy-four seconds of palace, played entirely to your hands.
              </p>

              {/* Enter The Film Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => scrollToRatio(0.12)}
                  className="px-6 py-2.5 rounded-full border border-amber-400/40 hover:border-amber-400 bg-black/60 hover:bg-black/80 text-white text-[11px] uppercase tracking-[0.3em] font-semibold transition-all cursor-pointer backdrop-blur-md group inline-flex items-center gap-2 shadow-xl"
                >
                  <span>[ ENTER THE FILM ]</span>
                  <span className="text-amber-400 group-hover:translate-y-0.5 transition-transform">
                    ↓
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STORY TYPOGRAPHY (4 Walkthrough Scenes): Romantic Serif   */}
          {/* Positioned in lower third so the palace & venue grounds  */}
          {/* are prominently visible above the text                  */}
          {/* ======================================================== */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 sm:pb-22 md:pb-26 px-4 pointer-events-none">
            <div className="w-full max-w-4xl">
              {SCENES.map((scene, i) => {
                const textDist = Math.abs(storyStage - i);
                // Generous plateau/hold time so user enjoys the scene without it rushing away
                const textOpacity =
                  Math.max(0, 1 - textDist * 1.25) *
                  (1 - introOpacity) *
                  (1 - climaxFactor);
                const translateY = (storyStage - i) * -16;
                const textScale = 0.96 + Math.max(0, 1 - textDist) * 0.04;

                if (textOpacity <= 0.005) return null;

                return (
                  <div
                    key={scene.title}
                    style={{
                      opacity: textOpacity,
                      transform: `translateY(${translateY}px) scale(${textScale})`,
                      willChange: "transform, opacity",
                      transition:
                        "opacity 0.15s ease-out, transform 0.15s ease-out",
                      pointerEvents: textOpacity > 0.4 ? "auto" : "none",
                    }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                  {/* Phase Label Pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black/60 border border-amber-400/50 backdrop-blur-md mb-4 text-amber-300 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.28em] uppercase shadow-md">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{scene.phaseLabel}</span>
                  </div>

                  {/* Romantic Serif Heading */}
                  <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white tracking-wide leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.98)] max-w-4xl">
                    {scene.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.32em] text-amber-300 font-medium mt-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-2xl">
                    {scene.subtitle}
                  </p>

                  {/* Romantic Caption */}
                  <p className="font-serif italic text-white/75 text-xs sm:text-sm mt-3 tracking-wide drop-shadow max-w-lg">
                    {scene.caption}
                  </p>
                </div>
              );
            })}

            {/* Accessible Screen Reader Outline */}
            <div className="sr-only">
              <h3>Palace Film Walkthrough Scenes</h3>
              <ul>
                {SCENES.map((s) => (
                  <li key={s.title}>{s.title} — {s.subtitle}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

          {/* ======================================================== */}
          {/* CLIMAX GRAND REVEAL CARD (Progress >= 86%)                */}
          {/* Exactly matching crop_23s.jpg of reference video         */}
          {/* ======================================================== */}
          <div
            style={{
              opacity: climaxFactor,
              transform: `translateY(${(1 - climaxFactor) * 30}px) scale(${
                0.96 + climaxFactor * 0.04
              })`,
              pointerEvents: climaxFactor > 0.4 ? "auto" : "none",
              transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
            }}
            className="relative z-20 text-center px-4 max-w-4xl mx-auto"
          >
            {/* Monogram Seal */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amber-400/60 bg-black/70 backdrop-blur-md mb-6 text-amber-300 text-xs font-semibold tracking-[0.25em] uppercase rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Heritage Palatial Estate</span>
              <span className="text-amber-500/60">◆</span>
              <span>Prayagraj</span>
            </div>

            {/* Title */}
            <div className="space-y-2 mb-4">
              <div className="font-serif text-sm sm:text-base tracking-[0.45em] uppercase text-amber-300 font-light drop-shadow">
                M A H A L
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
                {site.venue_name}
              </h1>
            </div>

            {/* Tagline */}
            <p className="font-serif italic text-lg sm:text-2xl text-amber-200/90 max-w-2xl mx-auto mb-4 font-light drop-shadow">
              Where Your Wedding Story Begins
            </p>

            <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto mb-8 font-normal leading-relaxed drop-shadow">
              Sprawling royal lawns, air-conditioned banquet halls, authentic
              Awadhi catering, and ceremonial coordination for up to{" "}
              {capacityFormatted} guests.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto mb-8">
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto py-3.5 px-8 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-xl hover:shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Your Royal Wedding</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="w-full sm:w-auto py-3.5 px-7 bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/60 text-xs uppercase tracking-widest font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <PhoneCall className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Instant AI Voice Call</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.14em] text-stone-300 font-mono">
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>Google {site.rating_value} / 5</span>
              </span>
              <span className="text-amber-500/60">◆</span>
              <span>{site.weddings_hosted || 850}+ Weddings Hosted</span>
              <span className="text-amber-500/60">◆</span>
              <span>Capacity up to {capacityFormatted}</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM TIMELINE & LIVE SCRUB BAR                         */}
          {/* Exactly matching the horizontal progress line in video   */}
          {/* ======================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-30 pb-4 px-6 sm:px-12 pointer-events-none select-none">
            {/* Live Status Row */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono tracking-[0.25em] text-white/70 uppercase mb-2">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold">
                  {timecodeString}
                </span>
                <span className="hidden md:inline text-white/30">|</span>
                <span className="hidden md:inline text-white/60">
                  {isIntro
                    ? "PROLOGUE"
                    : isClimax
                    ? "ROYAL CLIMAX"
                    : SCENES[Math.min(Math.round(storyStage), 3)]?.title}
                </span>
              </div>

              {/* Diamond Star ✦ Ambient Audio Soundscape Toggle */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAmbientAudio}
                  className="px-2.5 py-1 rounded-full border border-white/20 hover:border-amber-400 bg-black/40 hover:bg-black/60 text-white text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
                  title="Toggle 432Hz ambient palace soundscape"
                >
                  <span className="text-amber-400 text-sm leading-none animate-pulse">
                    ✦
                  </span>
                  <span className="hidden sm:inline">
                    {isAudioActive ? "SOUND: ON" : "SOUND: OFF"}
                  </span>
                  {isAudioActive ? (
                    <Volume2 className="w-3 h-3 text-amber-400" />
                  ) : (
                    <VolumeX className="w-3 h-3 text-white/50" />
                  )}
                </button>
              </div>
            </div>

            {/* Razor-thin 1px scrubber progress track */}
            <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
                  transition: "width 0.08s linear",
                }}
                className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-white shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modals triggered directly from Hero */}
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
