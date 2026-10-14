"use client";

import React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { SiteSettings } from "@/types/api";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";

interface StickyActionBarProps {
  site: SiteSettings;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({ site }) => {
  const whatsappUrl = buildWhatsAppUrl(
    site.whatsapp_number,
    buildGeneralInquiryMessage(site.venue_name)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface border-t border-black/[0.08] px-4 pt-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))]">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <a
          href={`tel:${site.phone}`}
          className="w-full"
          aria-label={`Call ${site.venue_name}`}
        >
          <Button
            variant="outline"
            size="md"
            className="w-full justify-center !h-12"
            leftIcon={<Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />}
          >
            Call
          </Button>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
          aria-label="Send message on WhatsApp"
        >
          <Button
            variant="whatsapp"
            size="md"
            className="w-full justify-center !h-12"
            leftIcon={<MessageCircle className="w-4 h-4" strokeWidth={1.5} />}
          >
            WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
};
