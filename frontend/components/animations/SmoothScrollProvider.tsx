"use client";

import React, { useEffect } from "react";
import { registerLenis } from "@/lib/scroll";

/**
 * Site-wide smooth scrolling + GSAP ScrollTrigger wiring.
 *
 * Libraries load dynamically inside the effect so they never touch SSR and
 * stay out of the initial bundle. When the user prefers reduced motion,
 * Lenis and the ticker are skipped entirely — the page behaves natively.
 */
export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        lerp: 0.11,
        anchors: { offset: -72 }, // sticky navbar height
      });
      registerLenis(lenis);

      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(raf);
        registerLenis(null);
        lenis.destroy();
      };
    })().catch(() => {
      // Scroll libraries failed to load — native scrolling still works.
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <>{children}</>;
};
