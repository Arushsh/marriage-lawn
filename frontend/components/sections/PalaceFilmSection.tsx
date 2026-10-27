"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import Image from "next/image";
import { SiteSettings, Hall } from "@/types/api";
import { OnlineBookingModal } from "@/components/booking/OnlineBookingModal";
import { InstantCallModal } from "@/components/voice/InstantCallModal";
import { WebGLHeroText, type WebGLHeroTextHandle } from "@/components/animations/WebGLHeroText";
import { scrollToTarget } from "@/lib/scroll";
import { Calendar, PhoneCall, Sparkles, Star, Volume2, VolumeX } from "lucide-react";

interface PalaceFilmSectionProps {
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
const WALK_START = 0.06;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

// ─── Pure per-frame style derivations (shared by SSR paint + ticker) ─────────

const sceneOpacity = (p: number, i: number): number => {
  const introOpacity = Math.max(0, 1 - p / 0.09);
  const storyStage = clamp01((p - WALK_START) / (CLIMAX_THRESHOLD - WALK_START)) * 3.0;
  const climaxFactor = clamp01((p - CLIMAX_THRESHOLD) / (1.0 - CLIMAX_THRESHOLD));
  const dist = Math.abs(storyStage - i);
  const baseOpacity = Math.max(0, 1 - Math.pow(dist, 1.25) * 1.25);
  const introMod =
    i === 0 ? Math.max(0.45, 1 - introOpacity * 0.55) : 1 - introOpacity;
  return baseOpacity * introMod * (1 - climaxFactor);
};

const sceneTransform = (p: number, i: number): string => {
  const storyStage = clamp01((p - WALK_START) / (CLIMAX_THRESHOLD - WALK_START)) * 3.0;
  const sceneLocalProgress = clamp01((storyStage - (i - 0.75)) / 1.5);
  const scale = 1.0 + sceneLocalProgress * 0.38;
  const cameraPanY = (sceneLocalProgress - 0.5) * -16;
  return `scale(${scale.toFixed(4)}) translateY(${cameraPanY.toFixed(2)}px)`;
};

const sceneTextOpacity = (p: number, i: number): number => {
  const introOpacity = Math.max(0, 1 - p / 0.09);
  const storyStage = clamp01((p - WALK_START) / (CLIMAX_THRESHOLD - WALK_START)) * 3.0;
  const climaxFactor = clamp01((p - CLIMAX_THRESHOLD) / (1.0 - CLIMAX_THRESHOLD));
  const textDist = Math.abs(storyStage - i);
  return (
    Math.max(0, 1 - textDist * 1.25) * (1 - introOpacity) * (1 - climaxFactor)
  );
};

const sceneTextTransform = (p: number, i: number): string => {
  const storyStage = clamp01((p - WALK_START) / (CLIMAX_THRESHOLD - WALK_START)) * 3.0;
  const translateY = (storyStage - i) * -16;
  const textScale = 0.96 + Math.max(0, 1 - Math.abs(storyStage - i)) * 0.04;
  return `translateY(${translateY.toFixed(2)}px) scale(${textScale.toFixed(4)})`;
};

const climaxOpacity = (p: number): number =>
  clamp01((p - CLIMAX_THRESHOLD) / (1.0 - CLIMAX_THRESHOLD));

const introOpacity = (p: number): number => Math.max(0, 1 - p / 0.09);

const timecodeFor = (p: number): string => {
  const currentSeconds = Math.min(
    Math.floor(clamp01(p) * TOTAL_FILM_SECONDS),
    TOTAL_FILM_SECONDS
  );
  const mm = String(Math.floor(currentSeconds / 60)).padStart(2, "0");
  const ss = String(currentSeconds % 60).padStart(2, "0");
  return `${mm}:${ss} / 01:14`;
};

export const PalaceFilmSection: React.FC<PalaceFilmSectionProps> = ({ site, halls = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Per-frame animation targets (ticker-mutated, never re-rendering React)
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const sceneInnerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const sceneTextRefs = useRef<Array<HTMLDivElement | null>>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const climaxRef = useRef<HTMLDivElement>(null);
  const climaxBackdropRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const particleHandleRef = useRef<WebGLHeroTextHandle>(null);

  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const lastLabelRef = useRef("");

  const [stageLabel, setStageLabel] = useState("PROLOGUE");
  const [webglReady, setWebglReady] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // ── Imperative frame applier ──────────────────────────────────────────────
  const applyProgress = useCallback((p: number) => {
    SCENES.forEach((_, i) => {
      const wrapper = sceneRefs.current[i];
      const inner = sceneInnerRefs.current[i];
      if (wrapper) wrapper.style.opacity = sceneOpacity(p, i).toFixed(3);
      if (inner) inner.style.transform = sceneTransform(p, i);
    });

    const intro = introRef.current;
    if (intro) {
      const o = introOpacity(p);
      intro.style.opacity = String(o);
      intro.style.transform = `scale(${1 + (1 - o) * 0.08})`;
      intro.style.pointerEvents = p < 0.08 ? "auto" : "none";
    }

    SCENES.forEach((_, i) => {
      const text = sceneTextRefs.current[i];
      if (!text) return;
      const o = sceneTextOpacity(p, i);
      text.style.opacity = String(o);
      text.style.transform = sceneTextTransform(p, i);
      text.style.pointerEvents = o > 0.4 ? "auto" : "none";
    });

    const climax = climaxRef.current;
    if (climax) {
      const cf = climaxOpacity(p);
      climax.style.opacity = String(cf);
      climax.style.transform = `translateY(${(1 - cf) * 30}px) scale(${0.96 + cf * 0.04})`;
      climax.style.pointerEvents = cf > 0.4 ? "auto" : "none";
    }
    const backdrop = climaxBackdropRef.current;
    if (backdrop) {
      backdrop.style.transform = `scale(${(1 + climaxOpacity(p) * 0.18).toFixed(4)})`;
    }

    const tc = timecodeRef.current;
    if (tc) {
      const t = timecodeFor(p);
      if (tc.textContent !== t) tc.textContent = t;
    }
    const scrubber = scrubberRef.current;
    if (scrubber) scrubber.style.width = `${(clamp01(p) * 100).toFixed(2)}%`;

    particleHandleRef.current?.setDissolve(clamp01(p / 0.12));

    const storyStage =
      clamp01((p - WALK_START) / (CLIMAX_THRESHOLD - WALK_START)) * 3.0;
    const label =
      p < 0.08
        ? "PROLOGUE"
        : p >= CLIMAX_THRESHOLD
          ? "ROYAL CLIMAX"
          : SCENES[Math.min(Math.round(storyStage), 3)]?.title || "";
    if (label !== lastLabelRef.current) {
      lastLabelRef.current = label;
      setStageLabel(label);
    }
  }, []);

  // ── Scroll-driven film: ScrollTrigger progress + gsap ticker smoothing ────
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    applyProgress(currentProgressRef.current);

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          targetProgressRef.current = self.progress;
          // Reduced motion: no lerp, apply immediately
          if (reduced) {
            currentProgressRef.current = self.progress;
            applyProgress(self.progress);
          }
        },
      });

      if (!reduced) {
        const tick = () => {
          const diff = targetProgressRef.current - currentProgressRef.current;
          if (Math.abs(diff) > 0.00015) {
            currentProgressRef.current += diff * 0.16;
            applyProgress(currentProgressRef.current);
          } else if (diff !== 0) {
            currentProgressRef.current = targetProgressRef.current;
            applyProgress(currentProgressRef.current);
          }
        };
        gsap.ticker.add(tick);
        cleanup = () => {
          gsap.ticker.remove(tick);
          st.kill();
        };
      } else {
        cleanup = () => st.kill();
      }
    })().catch(() => {
      // GSAP failed to load — film stays at its initial (prologue) state.
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [applyProgress]);

  // ── Web Audio API: Soothing 432Hz ambient palace soundscape ───────────────
  const toggleAmbientAudio = useCallback(() => {
    if (isAudioActive) {
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
    const container = containerRef.current;
    if (!container) return;
    const containerTop = window.scrollY + container.getBoundingClientRect().top;
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    scrollToTarget(Math.max(0, containerTop + ratio * scrollableDistance), { offset: 0 });
  }, []);

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
        id="palace-film"
        ref={containerRef}
        className="relative h-[540vh] bg-[#04101a] text-[#eaf2f0] select-none"
      >
        {/* Pinned 100vh Cinema Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black">
          {/* Base royal dark gradient backdrop */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, #0c2331 0%, #071720 50%, #04101a 100%)",
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
          {SCENES.map((scene, i) => (
            <div
              key={scene.title}
              ref={(el) => {
                sceneRefs.current[i] = el;
              }}
              style={{ opacity: sceneOpacity(0, i) }}
              className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
            >
              <div
                ref={(el) => {
                  sceneInnerRefs.current[i] = el;
                }}
                style={{
                  transform: sceneTransform(0, i),
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,226,208,0.07)_0%,transparent_75%)]" />
            </div>
          ))}

          {/* Climax Backdrop Image (Illuminated Palace Hall) */}
          <div
            style={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
          >
            <div
              ref={climaxBackdropRef}
              style={{
                transform: "scale(1)",
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

          {/* WebGL particle film title (gold particles; static h1 below is the fallback) */}
          <WebGLHeroText ref={particleHandleRef} text="MAHAL" onReady={() => setWebglReady(true)} />

          {/* ======================================================== */}
          {/* STAGE 0: Iconic "M A H A L" Film Intro Card               */}
          {/* ======================================================== */}
          <div
            ref={introRef}
            style={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 sm:pb-22 md:pb-28 text-center px-6"
          >
            {/* Centered Palace Film Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zari/40 bg-black/70 backdrop-blur-md text-zari-bright text-[10px] sm:text-xs uppercase tracking-[0.3em] tracking-[0.14em] mb-3 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-diya" />
              <span>THE PALACE FILM · 4K CINEMATIC WALKTHROUGH</span>
            </div>

            {/* Majestic "M A H A L" Title — fades out when WebGL particles are live */}
            <div className="space-y-3 max-w-4xl mx-auto">
              <h1
                style={{ opacity: webglReady ? 0 : 1 }}
                className="font-serif text-5xl sm:text-7xl md:text-8xl tracking-[0.35em] font-light text-white leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] select-none transition-opacity duration-700"
              >
                M A H A L
              </h1>

              {/* Hairline Divider */}
              <div className="w-16 h-px bg-zari/60 mx-auto my-3" />

              {/* Subtitle */}
              <p className="font-serif italic text-white/90 text-xs sm:text-sm md:text-base tracking-[0.12em] font-light max-w-xl mx-auto drop-shadow-lg">
                Seventy-four seconds of palace, played entirely to your hands.
              </p>

              {/* Enter The Film Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => scrollToRatio(0.12)}
                  className="px-6 py-2.5 rounded-full border border-zari/40 hover:border-zari/80 bg-black/60 hover:bg-black/80 text-white text-[11px] uppercase tracking-[0.3em] font-semibold transition-all cursor-pointer backdrop-blur-md group inline-flex items-center gap-2 shadow-xl"
                >
                  <span>[ ENTER THE FILM ]</span>
                  <span className="text-diya group-hover:translate-y-0.5 transition-transform">
                    ↓
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* STORY TYPOGRAPHY (4 Walkthrough Scenes): Romantic Serif   */}
          {/* ======================================================== */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 sm:pb-22 md:pb-26 px-4 pointer-events-none">
            <div className="w-full max-w-4xl">
              {SCENES.map((scene, i) => (
                <div
                  key={scene.title}
                  ref={(el) => {
                    sceneTextRefs.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                  aria-hidden="true"
                  className="flex flex-col items-center justify-center text-center"
                >
                  {/* Phase Label Pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black/60 border border-zari/50 backdrop-blur-md mb-4 text-zari-bright text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase shadow-md">
                    <Sparkles className="w-3 h-3 text-diya" />
                    <span>{scene.phaseLabel}</span>
                  </div>

                  {/* Romantic Serif Heading */}
                  <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white tracking-wide leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.98)] max-w-4xl">
                    {scene.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.32em] text-zari-bright font-medium mt-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-2xl">
                    {scene.subtitle}
                  </p>

                  {/* Romantic Caption */}
                  <p className="font-serif italic text-white/75 text-xs sm:text-sm mt-3 tracking-wide drop-shadow max-w-lg">
                    {scene.caption}
                  </p>
                </div>
              ))}

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
          {/* CLIMAX GRAND REVEAL CARD (Progress >= 84%)                */}
          {/* ======================================================== */}
          <div
            ref={climaxRef}
            style={{ opacity: 0, pointerEvents: "none" }}
            className="relative z-20 text-center px-4 max-w-4xl mx-auto"
          >
            {/* Monogram Seal */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zari/60 bg-black/70 backdrop-blur-md mb-6 text-zari-bright text-xs font-semibold tracking-[0.25em] uppercase rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-diya" />
              <span>Heritage Palatial Estate</span>
              <span className="text-zari/50">◆</span>
              <span>Prayagraj</span>
            </div>

            {/* Title */}
            <div className="space-y-2 mb-4">
              <div className="font-serif text-sm sm:text-base tracking-[0.45em] uppercase text-zari-bright font-light drop-shadow">
                M A H A L
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
                {site.venue_name}
              </h1>
            </div>

            {/* Tagline */}
            <p className="font-serif italic text-lg sm:text-2xl text-zari-bright/90 max-w-2xl mx-auto mb-4 font-light drop-shadow">
              Where Your Wedding Story Begins
            </p>

            <p className="text-[#c3d4d2] text-xs sm:text-sm max-w-xl mx-auto mb-8 font-normal leading-relaxed drop-shadow">
              Sprawling royal lawns, air-conditioned banquet halls, authentic
              Awadhi catering, and ceremonial coordination for up to{" "}
              {capacityFormatted} guests.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto mb-8">
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto py-3.5 px-8 bg-rani hover:bg-rani-deep text-white border border-zari/50 text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-xl hover:shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Your Royal Wedding</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="w-full sm:w-auto py-3.5 px-7 gota-glass hover:bg-black/50 text-zari-bright border border-zari/60 text-xs uppercase tracking-widest font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <PhoneCall className="w-4 h-4 text-diya animate-pulse" />
                <span>Instant AI Voice Call</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.14em] text-[#c3d4d2] tracking-[0.14em]">
              <span className="flex items-center gap-1 text-diya">
                <Star className="w-3.5 h-3.5 fill-diya" />
                <span>Google {site.rating_value} / 5</span>
              </span>
              <span className="text-zari/50">◆</span>
              <span>{site.weddings_hosted || 850}+ Weddings Hosted</span>
              <span className="text-zari/50">◆</span>
              <span>Capacity up to {capacityFormatted}</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BOTTOM TIMELINE & LIVE SCRUB BAR                         */}
          {/* ======================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-30 pb-4 px-6 sm:px-12 pointer-events-none select-none">
            {/* Live Status Row */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs tracking-[0.25em] text-[#c3d4d2]/80 uppercase mb-2">
              <div className="flex items-center gap-3">
                <span className="text-diya font-bold" ref={timecodeRef}>
                  00:00 / 01:14
                </span>
                <span className="hidden md:inline text-[#93aca9]/50">|</span>
                <span className="hidden md:inline text-[#c3d4d2]/70">{stageLabel}</span>
              </div>

              {/* Diamond Star ✦ Ambient Audio Soundscape Toggle */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAmbientAudio}
                  className="px-2.5 py-1 rounded-full border border-white/20 hover:border-amber-400 bg-black/40 hover:bg-black/60 text-white text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
                  title="Toggle 432Hz ambient palace soundscape"
                >
                  <span className="text-diya text-sm leading-none animate-pulse">
                    ✦
                  </span>
                  <span className="hidden sm:inline">
                    {isAudioActive ? "SOUND: ON" : "SOUND: OFF"}
                  </span>
                  {isAudioActive ? (
                    <Volume2 className="w-3 h-3 text-diya" />
                  ) : (
                    <VolumeX className="w-3 h-3 text-[#93aca9]" />
                  )}
                </button>
              </div>
            </div>

            {/* Razor-thin 1px scrubber progress track */}
            <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
              <div
                ref={scrubberRef}
                style={{ width: "0%" }}
                className="h-full bg-gradient-to-r from-rani via-diya to-zari-bright shadow-[0_0_8px_rgba(224,20,124,0.8)]"
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
