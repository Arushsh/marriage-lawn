import React from "react";
import Link from "next/link";
import { SiteSettings } from "@/types/api";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";
import { MessageSquare, Calendar } from "lucide-react";

interface FinalCTAProps {
  site: SiteSettings;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ site }) => {
  const whatsappHref = buildWhatsAppUrl(
    site.whatsapp_number,
    buildGeneralInquiryMessage(site.venue_name)
  );

  return (
    <section className="py-20 sm:py-32 bg-surface border-t border-black/[0.08]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 text-center">
        <FadeUp>
          <div className="max-w-[640px] mx-auto space-y-4">
            <h2 className="font-serif text-[32px] sm:text-[44px] text-primary font-normal leading-[1.2]">
              Reserve Your Date at {site.venue_name}
            </h2>
            <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[50ch] mx-auto">
              Dates during prime wedding muhurat fill months in advance. Check open dates or speak directly with our team.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full sm:w-auto"
                  leftIcon={<MessageSquare className="w-5 h-5" strokeWidth={1.5} />}
                >
                  WhatsApp Us
                </Button>
              </a>

              <Link href="/#availability" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  leftIcon={<Calendar className="w-5 h-5 text-primary" strokeWidth={1.5} />}
                >
                  Check Dates
                </Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
