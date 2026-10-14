"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Accordion } from "@/components/ui/Accordion";
import { SiteSettings } from "@/types/api";
import { Sparkles, MessageCircle, Info } from "lucide-react";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";

interface InteractiveDemoProps {
  site: SiteSettings;
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ site }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const accordionItems = [
    {
      id: "catering",
      title: "What is your catering policy?",
      content:
        "We offer in-house catering with authentic regional and multi-cuisine vegetarian and non-vegetarian menus. Outside caterers are also permitted with prior arrangement.",
    },
    {
      id: "advance",
      title: "How much advance is required to lock a date?",
      content:
        "A 25% booking advance confirms your date on our calendar. The remaining balance is payable in milestones leading up to the event day.",
    },
    {
      id: "power",
      title: "Is generator power backup available 24/7?",
      content:
        "Yes, we provide 100% soundproof generator power backup covering the lawn, air conditioning, stage lighting, and bridal suites without interruption.",
    },
  ];

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="border-t border-black/10 pt-8">
        <h2 className="font-serif text-2xl font-bold text-primary mb-2">
          UI Kit Component Library
        </h2>
        <p className="text-sm text-muted">
          All UI primitives built with brand tokens, accessible tap targets, and smooth Framer Motion animations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primitives Card */}
        <Card hoverLift={false} className="space-y-5">
          <h3 className="font-serif text-lg font-bold text-text">Buttons & Badges</h3>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted block">Button Variants</span>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="primary" size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button
                variant="whatsapp"
                size="sm"
                leftIcon={<MessageCircle className="w-4 h-4 fill-current" />}
                onClick={() =>
                  window.open(
                    buildWhatsAppUrl(site.whatsapp_number, buildGeneralInquiryMessage(site.venue_name)),
                    "_blank"
                  )
                }
              >
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-muted block">Badge Variants</span>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="accent">Gold Accent</Badge>
              <Badge variant="popular">Most Popular</Badge>
              <Badge variant="success">Available</Badge>
              <Badge variant="warning">Tentative</Badge>
              <Badge variant="danger">Booked</Badge>
            </div>
          </div>

          <div className="pt-3">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full justify-center !rounded-xl"
            >
              Open Interactive Modal Preview
            </Button>
          </div>
        </Card>

        {/* Accordion Component */}
        <Card hoverLift={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-text">Animated Accordion</h3>
            <Badge variant="accent">Framer Motion</Badge>
          </div>
          <p className="text-xs text-muted">
            Smooth height animation for FAQs and venue terms.
          </p>
          <Accordion items={accordionItems} />
        </Card>
      </div>

      {/* Interactive Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Interactive Modal Preview"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-accent/10 border border-accent/20 text-sm text-[#8F7014]">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              This dialog supports backdrop blur, smooth spring scaling, body scroll locking, and Escape key dismissal.
            </p>
          </div>
          <p className="text-sm text-text leading-relaxed">
            Ready for the enquiry form in Chunk 5 and full lightbox photo gallery in Chunk 6!
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Close Dialog
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                alert("Action triggered successfully!");
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
