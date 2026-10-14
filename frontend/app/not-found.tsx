import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center py-20 sm:py-32 px-4 sm:px-8">
      <div className="max-w-[560px] w-full text-center space-y-8 bg-surface p-8 sm:p-14 rounded-2xl border border-black/[0.08]">
        <div className="space-y-3">
          <span className="font-mono text-sm tracking-widest text-primary font-medium block">
            404 ERROR
          </span>
          <h1 className="font-serif text-[32px] sm:text-[44px] text-primary font-normal leading-[1.2]">
            Page Not Found
          </h1>
          <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[45ch] mx-auto">
            The page you requested could not be found. It may have been relocated or the link is incorrect.
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
    </main>
  );
}
