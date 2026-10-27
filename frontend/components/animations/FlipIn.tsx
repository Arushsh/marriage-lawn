"use client";

import React, { useEffect, useRef } from "react";

interface FlipInProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds of stagger delay. */
  delay?: number;
  /** Base Y-rotation (degrees) the element starts tilted from. */
  from?: number;
}

/**
 * 3D perspective reveal — the content starts rotated back in Z-space and
 * swings flat as it enters the viewport. Like FadeUp, but with depth.
 * Static under reduced motion.
 */
export const FlipIn: React.FC<FlipInProps> = ({
  children,
  className,
  delay = 0,
  from = 16,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        if (cancelled || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);

        const tween = gsap.from(ref.current, {
          rotationY: from,
          transformPerspective: 1200,
          transformOrigin: "50% 50% -60",
          y: 46,
          opacity: 0,
          duration: 0.9,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            once: true,
          },
        });

        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(ref.current, { clearProps: "transform,opacity" });
        };
      } catch {
        /* GSAP unavailable — content stays visible */
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [delay, from]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
};
