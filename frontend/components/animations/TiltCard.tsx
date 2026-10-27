"use client";

import React, { useEffect, useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  intensity?: number;
}

/**
 * Pointer-tracked 3D tilt wrapper (GSAP quickTo — no React re-renders).
 * Automatically disabled on touch-only devices and for reduced motion;
 * falls back to a plain container.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  intensity = 7,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { gsap } = await import("gsap");
      if (cancelled || !ref.current) return;

      gsap.set(el, { transformPerspective: 1000, transformStyle: "preserve-3d" });
      const rotateX = gsap.quickTo(el, "rotationX", {
        duration: 0.5,
        ease: "power3.out",
      });
      const rotateY = gsap.quickTo(el, "rotationY", {
        duration: 0.5,
        ease: "power3.out",
      });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY(px * intensity);
        rotateX(-py * intensity);
      };
      const onLeave = () => {
        rotateX(0);
        rotateY(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        gsap.set(el, { rotationX: 0, rotationY: 0, clearProps: "transform" });
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [intensity]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
};
