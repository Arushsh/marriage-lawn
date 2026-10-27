"use client";

import React, { useEffect, useRef } from "react";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Distance the element rises from, in px. */
  rise?: number;
  /** Render as a different element (span, li, section…). */
  as?: React.ElementType;
}

/**
 * Scroll reveal: content surfaces through a soft blur and rise.
 * Pure CSS + IntersectionObserver — zero JS animation library cost.
 * Static under reduced motion.
 */
export const FadeUp: React.FC<FadeUpProps> = ({
  children,
  delay = 0,
  className = "",
  rise = 28,
  as: Tag = "div",
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = `translateY(${rise}px)`;
    el.style.filter = "blur(8px)";
    el.style.transition = `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, filter 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`;
    el.style.willChange = "transform, opacity, filter";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          el.style.filter = "blur(0px)";
          observer.disconnect();
        }
      },
      { rootMargin: "-60px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, rise]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
};

/**
 * A zari seam: a pearl thread that stitches itself across the page
 * when it scrolls into view. Pure CSS animation — no library needed.
 */
export const ThreadSeam: React.FC<{
  className?: string;
  delay?: number;
  vertical?: boolean;
}> = ({ className = "", delay = 0, vertical = false }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "0.85";
      const line = el.querySelector("line");
      if (line) {
        line.style.strokeDashoffset = "0";
      }
      return;
    }

    const line = el.querySelector("line");
    if (!line) return;

    // Set up dash animation
    const len = vertical ? 100 : 100;
    line.style.strokeDasharray = `${len}`;
    line.style.strokeDashoffset = `${len}`;
    el.style.opacity = "0";
    line.style.transition = `stroke-dashoffset 1.4s cubic-bezier(0.65,0,0.35,1) ${delay}s`;
    el.style.transition = `opacity 0.3s ease ${delay}s`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "0.85";
          line.style.strokeDashoffset = "0";
          observer.disconnect();
        }
      },
      { rootMargin: "-40px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, vertical]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={`block overflow-visible ${className}`}
      viewBox={vertical ? "0 0 2 100" : "0 0 100 2"}
      preserveAspectRatio="none"
    >
      <line
        x1={vertical ? 1 : 0}
        y1={vertical ? 0 : 1}
        x2={vertical ? 1 : 100}
        y2={vertical ? 100 : 1}
        stroke="var(--c-zari)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
