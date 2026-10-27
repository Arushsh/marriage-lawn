"use client";

import React, { useState } from "react";
import { SiteSettings, Hall, Package } from "@/types/api";
import { OnlineBookingModal } from "@/components/booking/OnlineBookingModal";
import { InstantCallModal } from "@/components/voice/InstantCallModal";
import { Calendar, PhoneCall, ShieldCheck, Sparkles, Building, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/animations/TiltCard";

interface BookingClientProps {
  site: SiteSettings;
  halls: Hall[];
  packages: Package[];
}

export const BookingClient: React.FC<BookingClientProps> = ({ halls }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<number | undefined>(undefined);

  const openForHall = (hallId: number) => {
    setSelectedHallId(hallId);
    setIsBookingOpen(true);
  };

  return (
    <div>
      {/* 3 Step Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white border border-border text-muted shadow-sm">
          <div className="w-10 h-10 border border-accent/40 bg-surface flex items-center justify-center text-primary mb-4">
            <Building className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-lg text-primary font-medium mb-1">1. Choose Your Venue</h3>
          <p className="text-xs text-muted leading-relaxed">
            Main Lawn for 1,500 guests, Royal Banquet Hall for 300 guests, or Shahi Terrace.
          </p>
        </div>

        <div className="p-6 bg-white border border-border text-muted shadow-sm">
          <div className="w-10 h-10 border border-accent/40 bg-surface flex items-center justify-center text-primary mb-4">
            <Award className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-lg text-primary font-medium mb-1">2. Transparent Pricing</h3>
          <p className="text-xs text-muted leading-relaxed">
            Real-time server calculated rates with transparent breakdown for catering, decor, and GST.
          </p>
        </div>

        <div className="p-6 bg-white border border-border text-muted shadow-sm">
          <div className="w-10 h-10 border border-accent/40 bg-surface flex items-center justify-center text-primary mb-4">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-lg text-primary font-medium mb-1">3. Concurrency Lock</h3>
          <p className="text-xs text-muted leading-relaxed">
            Database-level conflict protection prevents double bookings. Advance confirmed in seconds.
          </p>
        </div>
      </div>

      {/* Hall Cards with Direct Booking Trigger */}
      <div className="space-y-6 mb-12">
        <h2 className="font-serif text-2xl sm:text-3xl text-primary text-center sm:text-left font-normal">
          Select Venue to Begin Reservation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <TiltCard
              key={hall.id}
              className="bg-white border border-border hover:border-accent transition-colors shadow-sm flex flex-col justify-between group"
            >
              <div className="p-6">
                <div className="inline-block px-2.5 py-0.5 border border-accent/40 bg-surface text-accent text-[10px] uppercase font-semibold tracking-wider mb-3">
                  {hall.is_ac ? "Air Conditioned Banquet" : "Sprawling Open Lawn"}
                </div>
                <h3 className="font-serif text-xl text-primary font-normal mb-2 group-hover:text-primary-dark transition-colors">
                  {hall.name}
                </h3>
                <p className="text-xs text-muted line-clamp-3 mb-4 leading-relaxed">
                  {hall.description || "Spacious palatial setting designed for grand wedding ceremonies."}
                </p>
                <div className="text-xs text-stone-700 space-y-1.5 pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted">Floating Capacity:</span>
                    <span className="font-semibold text-accent">{hall.floating_capacity} Guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Seating Capacity:</span>
                    <span className="font-semibold text-primary">{hall.seating_capacity} Guests</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface border-t border-border">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => openForHall(hall.id)}
                  className="w-full justify-center !h-11 !border-accent"
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>Book {hall.name}</span>
                </Button>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* AI Voice Call Assistant Banner */}
      <div className="p-8 sm:p-10 bg-surface border border-accent/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Need Immediate Answers?</span>
          </div>
          <h3 className="font-serif text-2xl text-primary font-normal">
            Let our AI Voice Concierge call you right now
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Ask questions about available muhurat dates, custom packages, catering customization, and site visits over a real-time phone call.
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setIsVoiceOpen(true)}
          className="shrink-0 !h-12 !px-8 !border-accent !text-primary hover:!bg-white"
        >
          <PhoneCall className="w-4 h-4 mr-2 text-accent" />
          <span>Request AI Phone Call</span>
        </Button>
      </div>

      {/* Modals */}
      <OnlineBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultHallId={selectedHallId}
      />

      <InstantCallModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </div>
  );
};
