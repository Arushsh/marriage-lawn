"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Home page error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-xl border border-black/5 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-primary">
            Unable to Load Venue Information
          </h2>
          <p className="text-sm text-muted">
            We encountered a temporary connection issue while reaching the server. You can try refreshing or contact venue management directly.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry Connection
          </Button>

          <a
            href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20venue%20booking%20information."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="whatsapp"
              size="sm"
              leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
            >
              WhatsApp Us
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
