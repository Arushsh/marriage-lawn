"use client";

import React, { useEffect, useRef } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4";

interface AnimatedHeadingProps {
  /** Plain text renders best (SplitText works on the element's text). */
  children: React.ReactNode;
  as?: HeadingTag;
  className?: string;
  /** Seconds to wait after entering the viewport before starting. */
  delay?: number;
}

/**
 * Section heading with a GSAP SplitText 3D reveal — characters flip up on a
 * rotateX axis, staggered, triggered once as the heading enters the viewport.
 *
 * Reduced motion (or if GSAP fails to load): renders as a plain static
 * heading. Text is only split after webfonts are ready so glyph widths are
 * correct, and the split is reverted on unmount.
 */
export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  children,
  as = "h2",
  className,
  delay = 0,
}) => {
  const ref = useRef<HTMLHeadingElement>(null);

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
        const { SplitText } = await import("gsap/SplitText");
        if (cancelled || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger, SplitText);

        try {
          await document.fonts.ready;
        } catch {
          /* split with fallback font metrics */
        }
        if (cancelled || !ref.current) return;

        const split = new SplitText(ref.current, { type: "chars" });
        const tween = gsap.from(split.chars, {
          rotationX: -78,
          opacity: 0,
          yPercent: 24,
          transformOrigin: "50% 50% -40",
          stagger: 0.024,
          duration: 0.75,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 86%",
            once: true,
          },
        });

        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          split.revert();
        };
      } catch {
        /* GSAP/SplitText unavailable — static heading stays visible */
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [children, delay]);

  const Tag = as as "h2";
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
};
