import React from "react";
import Link from "next/link";
import { SiteSettings } from "@/types/api";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";
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
    <section className="relative py-20 sm:py-32 passage-diya text-center overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <FadeUp>
          <div className="gota-glass rounded-3xl max-w-[760px] mx-auto p-8 sm:p-14 space-y-5 relative overflow-hidden">
            {/* A zari seam crowns the close */}
            <span aria-hidden="true" className="silk-seam absolute top-0 inset-x-8" />
            <AnimatedHeading
              as="h2"
              className="font-serif text-[32px] sm:text-[46px] text-ink leading-[1.12] !mt-4"
            >
              Reserve Your Auspicious Date
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[50ch] mx-auto">
              Dates during prime wedding muhurat fill months in advance. Check open dates or
              consult our senior wedding concierge.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto !h-12 !px-8"
                  leftIcon={<MessageSquare className="w-4 h-4" strokeWidth={1.5} />}
                >
                  WhatsApp Concierge
                </Button>
              </a>

              <Link href="/#availability" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto !h-12 !px-8"
                  leftIcon={<Calendar className="w-4 h-4 text-teal" strokeWidth={1.5} />}
                >
                  Check Open Dates
                </Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
