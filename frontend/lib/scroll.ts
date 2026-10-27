"use client";

/**
 * Lenis singleton + page-scroll helpers.
 *
 * All programmatic page scrolling should go through `scrollToTarget` so it
 * participates in Lenis smoothing when active (and falls back to native
 * scrolling when Lenis is off — reduced motion, or before hydration).
 * Inner-container scrolling (chat panels, modals) should keep native APIs.
 */

import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function registerLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface ScrollToOptions {
  /** Pixel offset from the target (e.g. negative to clear a sticky navbar). */
  offset?: number;
  /** Jump without animation. */
  immediate?: boolean;
}

/**
 * Scroll the page to an element or selector. Accepts a CSS selector string,
 * an HTMLElement, or an absolute pixel Y position (number).
 */
export function scrollToTarget(
  target: string | HTMLElement | number,
  options: ScrollToOptions = {}
): void {
  if (typeof window === "undefined") return;

  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: options.offset ?? -72, // sticky navbar height
      immediate: options.immediate ?? false,
    });
    return;
  }

  // Native fallback (reduced motion / pre-hydration)
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: options.immediate ? "auto" : "smooth" });
    return;
  }
  const element =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!element) return;
  const top =
    element.getBoundingClientRect().top + window.scrollY + (options.offset ?? -72);
  window.scrollTo({ top: Math.max(0, top), behavior: options.immediate ? "auto" : "smooth" });
}
