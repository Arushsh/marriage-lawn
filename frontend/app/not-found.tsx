import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center py-20 sm:py-32 px-4 sm:px-8 bg-bg">
      <div className="max-w-[620px] w-full text-center border border-accent bg-surface">
        {/* Archival plate header */}
        <div className="border-b border-border px-8 sm:px-14 py-4">
          <span className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
            Royal Heritage Gazette
          </span>
        </div>

        <div className="px-8 sm:px-14 py-12 sm:py-16 space-y-8">
          <div className="space-y-4">
            {/* Oversized 404 figure with 3D character reveal */}
            <AnimatedHeading
              as="h1"
              delay={0.15}
              className="font-serif text-[88px] sm:text-[128px] font-normal leading-none text-primary select-none"
            >
              404
            </AnimatedHeading>
            <div className="w-16 h-px bg-accent mx-auto" aria-hidden="true" />
            <p className="font-serif italic text-[18px] sm:text-[22px] text-text leading-[1.4]">
              This page has left the palace grounds.
            </p>
            <p className="text-[15px] sm:text-[16px] text-muted leading-[1.65] max-w-[48ch] mx-auto">
              The page you requested could not be found. It may have been
              relocated, or the address may be incorrect.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Return to Home
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Contact Venue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
