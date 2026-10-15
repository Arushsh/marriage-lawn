"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { SiteSettings } from "@/types/api";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";

interface FloatingWhatsAppProps {
  site: SiteSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ site }) => {
  const whatsappUrl = buildWhatsAppUrl(
    site.whatsapp_number,
    buildGeneralInquiryMessage(site.venue_name)
  );

  return (
    <div className="fixed bottom-6 right-6 z-30 hidden md:block">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <Button
          variant="whatsapp"
          size="md"
          className="border border-accent/60 gap-2 !shadow-none"
          leftIcon={<MessageCircle className="w-5 h-5 text-accent" strokeWidth={1.5} />}
        >
          Concierge WhatsApp
        </Button>
      </a>
    </div>
  );
};
