"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const CONSENT_KEY = "ml_cookie_consent";
export const CONSENT_EVENT = "ml:cookie-consent";
export const REOPEN_EVENT = "ml:reopen-cookie-consent";

export type CookieConsentValue = "all" | "essential";

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "all" || value === "essential" ? value : null;
}

/**
 * Fixed cookie consent banner (DESIGN.md styling: ivory, gold hairline, 0px
 * radius). Stores the visitor's choice in localStorage and dispatches
 * `ml:cookie-consent` so future analytics can subscribe behind the gate.
 * Footer "Cookie Settings" re-opens it via `ml:reopen-cookie-consent`.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Defer so the setState lands outside the synchronous effect body
    const timer = setTimeout(() => {
      if (!getCookieConsent()) setVisible(true);
    }, 0);

    const reopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(REOPEN_EVENT, reopen);
    };
  }, []);

  const choose = useCallback((value: CookieConsentValue) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed z-40 bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[560px] bg-surface border border-accent shadow-[0_10px_40px_rgba(30,27,25,0.18)]"
    >
      <div className="p-5 sm:p-6 space-y-4">
        <p className="font-serif text-lg text-primary font-normal leading-snug">
          Cookies on {""}
          <span className="italic">the estate grounds</span>
        </p>
        <p className="text-sm text-muted leading-relaxed">
          We use essential cookies to keep this site working, and would like to
          use analytics cookies to understand how visitors find us. Read our{" "}
          <Link href="/cookies" className="text-primary underline underline-offset-2">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button variant="primary" size="sm" onClick={() => choose("all")}>
            Accept All
          </Button>
          <Button variant="outline" size="sm" onClick={() => choose("essential")}>
            Essential Only
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Footer helper: re-opens the banner so visitors can change their choice. */
export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
}
