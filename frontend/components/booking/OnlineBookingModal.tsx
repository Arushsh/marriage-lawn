"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Building,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileCheck2,
  Printer,
} from "lucide-react";
import { createBooking, verifyBookingPayment, getHalls, getPackages } from "@/lib/api";
import { Hall, Package, BookingResponse, PaymentVerifyResponse } from "@/types/api";
import { Button } from "@/components/ui/Button";

interface OnlineBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHallId?: number;
  defaultDate?: string;
}

const ADDONS = [
  { id: "royal-entry", name: "Royal Elephant & Vintage Car Entrance", price: 25000, desc: "Grand arrival procession with rose petal cannons & Shehnai" },
  { id: "mandap-decor", name: "Vedic Mandap & Architectural Floral Decor", price: 35000, desc: "Handcrafted 4-pillar sacred mandap with fresh exotic blooms" },
  { id: "fireworks", name: "Grand Varmala Pyrotechnics & Cold Sparklers", price: 15000, desc: "Synchronized cold pyro fountains for stage exchange of garlands" },
  { id: "live-music", name: "Live Shehnai, Sitar & Classical Musicians", price: 12000, desc: "Acoustic traditional welcome melodies for guest arrival" },
];

export const OnlineBookingModal: React.FC<OnlineBookingModalProps> = ({
  isOpen,
  onClose,
  defaultHallId,
  defaultDate = "",
}) => {
  const [step, setStep] = useState<number>(1);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Form State
  const [selectedHallId, setSelectedHallId] = useState<number>(defaultHallId || 0);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [eventDate, setEventDate] = useState<string>(defaultDate);
  const [slot, setSlot] = useState<"full_day" | "morning" | "evening">("full_day");
  const [guestCount, setGuestCount] = useState<number>(500);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [hasVoiceConsent, setHasVoiceConsent] = useState(true);

  // Submission & Payment State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentVerifyResponse | null>(null);

  // Load halls and packages on open
  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true);
      Promise.all([getHalls(), getPackages()])
        .then(([hList, pList]) => {
          setHalls(hList);
          setPackages(pList);
          if (!selectedHallId && hList.length > 0) {
            setSelectedHallId(hList[0].id);
          }
          if (selectedPackageId === null && pList.length > 0) {
            setSelectedPackageId(pList[0].id);
          }
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Pricing calculations
  const selectedHall = halls.find((h) => h.id === selectedHallId);
  const selectedPkg = packages.find((p) => p.id === selectedPackageId);

  const hallBaseFee = (selectedHall?.seating_capacity || 300) > 500 ? 50000 : 35000;
  const slotMultiplier = slot === "full_day" ? 1.0 : 0.65;
  const venueTotal = Math.round(hallBaseFee * slotMultiplier);

  const packagePlatePrice = selectedPkg?.price_from ? parseFloat(selectedPkg.price_from) : 800;
  const cateringTotal = Math.round(packagePlatePrice * guestCount);

  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const item = ADDONS.find((a) => a.id === addonId);
    return acc + (item?.price || 0);
  }, 0);

  const subTotal = venueTotal + cateringTotal + addonsTotal;
  const taxes = Math.round(subTotal * 0.18); // 18% GST
  const grandTotal = subTotal + taxes;
  const advancePayable = Math.round(grandTotal * 0.25); // 25% Advance

  const handleAddonToggle = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateBooking = async () => {
    setErrorMessage(null);
    if (!customerName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!eventDate) {
      setErrorMessage("Please select your wedding date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        customer_email: customerEmail.trim() || undefined,
        hall_id: selectedHallId,
        package_id: selectedPackageId,
        event_type: "wedding",
        event_date: eventDate,
        slot,
        guest_count: guestCount,
        customer_notes: customerNotes.trim(),
        has_voice_consent: hasVoiceConsent,
      };

      const res = await createBooking(payload);
      setBookingResult(res);
      setStep(4); // Move to Payment Step
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to initiate online booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!bookingResult) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const advanceVal = parseFloat(bookingResult.advance_amount || "0") || advancePayable;
      const verifyRes = await verifyBookingPayment(bookingResult.booking_reference, {
        order_id: bookingResult.payment_order_id || `ord_${bookingResult.booking_reference}`,
        payment_id: `pay_mock_${Date.now().toString(36)}`,
        signature: "mock_sig_verified",
        amount: advanceVal,
        provider: "mock",
      });
      setPaymentResult(verifyRes);
      setStep(5); // Confirmation Certificate

      // Trigger celebratory confetti fireworks on successful confirmation
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#B8860B", "#6B1426", "#059669", "#D4AF37", "#FFFFFF"],
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#B8860B", "#6B1426", "#D4AF37"],
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#B8860B", "#059669", "#D4AF37"],
          });
        }, 250);
      } catch (cErr) {
        // Confetti optional
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Payment verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setBookingResult(null);
    setPaymentResult(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Soft Warm Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
        />

        {/* Regal Light Theme Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-3xl bg-[#FDFBF7] border border-[#E6DFC8] shadow-2xl p-6 sm:p-8 text-[#1E1B19] z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6DFC8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#B8860B]/40 bg-[#FFF8F5] flex items-center justify-center text-[#6B1426]">
                <Building className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B8860B]">
                  Palatial Reservations
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#6B1426] font-normal leading-[1.2]">
                  Online Wedding Booking
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer border border-transparent hover:border-[#E6DFC8]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          {step <= 4 && (
            <div className="grid grid-cols-4 gap-2 pt-4 pb-5">
              {[
                { s: 1, label: "Hall & Date" },
                { s: 2, label: "Package & Decor" },
                { s: 3, label: "Guest Details" },
                { s: 4, label: "Advance Payment" },
              ].map((item) => (
                <div key={item.s} className="space-y-1.5">
                  <div
                    className={`h-1 transition-all duration-300 ${
                      step >= item.s ? "bg-[#6B1426]" : "bg-[#E6DFC8]"
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold tracking-wider uppercase text-[10px] ${
                        step >= item.s ? "text-[#6B1426]" : "text-stone-400"
                      }`}
                    >
                      Step {item.s}
                    </span>
                    <span className="hidden sm:inline text-stone-500">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-6">
            {/* STEP 1: Hall & Date */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-[#6B1426] mb-2">
                    1. Choose Venue / Hall
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {halls.map((hall) => {
                      const isSelected = selectedHallId === hall.id;
                      return (
                        <div
                          key={hall.id}
                          onClick={() => setSelectedHallId(hall.id)}
                          className={`p-4 border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#FFF8F5] border-[#6B1426] text-[#1E1B19] shadow-sm"
                              : "bg-white border-[#E6DFC8] hover:border-[#B8860B] text-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-serif font-medium text-[#6B1426] text-sm">
                              {hall.name}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6B1426]" />}
                          </div>
                          <div className="text-[11px] text-stone-500 space-y-0.5">
                            <div>Capacity: up to {hall.floating_capacity || hall.seating_capacity} guests</div>
                            <div className="text-stone-400">{hall.is_ac ? "Air Conditioned Banquet" : "Sprawling Open Lawn"}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold tracking-wider text-[#6B1426] mb-1.5">
                      2. Event Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6DFC8] text-[#1E1B19] text-sm focus:outline-none focus:border-[#6B1426]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold tracking-wider text-[#6B1426] mb-1.5">
                      3. Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "morning", label: "Morning", time: "9 AM - 3 PM" },
                        { id: "evening", label: "Evening", time: "6 PM - 12 AM" },
                        { id: "full_day", label: "Full Day", time: "All Day" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSlot(item.id as any)}
                          className={`py-2 px-1 text-center border transition-all text-xs cursor-pointer ${
                            slot === item.id
                              ? "bg-[#6B1426] text-white font-medium border-[#6B1426]"
                              : "bg-white border-[#E6DFC8] text-[#554243] hover:border-[#6B1426]"
                          }`}
                        >
                          <div className="font-medium">{item.label}</div>
                          <div className="text-[10px] opacity-75">{item.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Package & Add-ons */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-[#6B1426] mb-2">
                    1. Select Catering &amp; Service Package
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`p-4 border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#FFF8F5] border-[#6B1426] text-[#1E1B19] shadow-sm"
                              : "bg-white border-[#E6DFC8] hover:border-[#B8860B] text-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif font-medium text-[#6B1426] text-sm">
                              {pkg.name}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6B1426]" />}
                          </div>
                          <div className="text-[#B8860B] text-xs font-semibold mb-2">
                            {pkg.price_from ? `₹${parseFloat(pkg.price_from).toLocaleString()}` : "Get Quote"}
                            <span className="text-stone-400 font-normal text-[10px]"> / plate</span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase font-semibold tracking-wider text-[#6B1426]">
                      2. Estimated Guests ({guestCount})
                    </label>
                    <span className="text-xs text-[#B8860B] font-mono font-semibold">
                      Catering subtotal: ₹{cateringTotal.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={1500}
                    step={50}
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                    className="w-full accent-[#6B1426] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                    <span>100 guests</span>
                    <span>500 guests</span>
                    <span>1000 guests</span>
                    <span>1500+ guests</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-[#6B1426] mb-2">
                    3. Royal Ceremonial Add-ons
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ADDONS.map((addon) => {
                      const isChecked = selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => handleAddonToggle(addon.id)}
                          className={`p-3.5 border transition-all cursor-pointer flex items-start gap-3 ${
                            isChecked
                              ? "bg-[#FFF8F5] border-[#6B1426] text-[#1E1B19]"
                              : "bg-white border-[#E6DFC8] hover:border-[#B8860B] text-stone-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 accent-[#6B1426]"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-[#1E1B19]">{addon.name}</span>
                              <span className="text-[#6B1426] font-mono font-semibold">+₹{addon.price.toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">{addon.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Guest Details & Pricing Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold tracking-wider text-[#6B1426] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Rathore"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#E6DFC8] text-[#1E1B19] text-sm focus:outline-none focus:border-[#6B1426]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold tracking-wider text-[#6B1426] mb-1">
                      Mobile Number (10 digits) *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-[#E6DFC8] bg-stone-100 text-stone-600 text-sm">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-[#E6DFC8] text-[#1E1B19] text-sm font-mono focus:outline-none focus:border-[#6B1426]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold tracking-wider text-stone-600 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="vikram@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#E6DFC8] text-[#1E1B19] text-sm focus:outline-none focus:border-[#6B1426]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold tracking-wider text-stone-600 mb-1">
                      Special Ceremonial Requests
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Varmala stage timing, Jain food counter..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#E6DFC8] text-[#1E1B19] text-sm focus:outline-none focus:border-[#6B1426]"
                    />
                  </div>
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-3 p-3 bg-white border border-[#E6DFC8]">
                  <input
                    type="checkbox"
                    id="voiceConsent"
                    checked={hasVoiceConsent}
                    onChange={(e) => setHasVoiceConsent(e.target.checked)}
                    className="mt-1 accent-[#6B1426] cursor-pointer"
                  />
                  <label htmlFor="voiceConsent" className="text-xs text-stone-700 cursor-pointer leading-relaxed">
                    <span className="font-semibold text-[#6B1426]">
                      Automated Voice Booking Confirmation &amp; Updates:
                    </span>{" "}
                    I consent to receive an automated AI concierge phone call to confirm reservation details. (You can opt out anytime by pressing 9).
                  </label>
                </div>

                {/* Pricing Summary Box */}
                <div className="p-5 bg-white border border-[#E6DFC8] shadow-sm space-y-2.5">
                  <div className="text-xs font-semibold text-[#6B1426] uppercase tracking-wider mb-2">
                    Transparent Server Pricing Summary
                  </div>
                  <div className="flex justify-between text-xs text-stone-700">
                    <span>{selectedHall?.name || "Venue Rental"} ({slot})</span>
                    <span className="font-mono">₹{venueTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-700">
                    <span>{selectedPkg?.name || "Catering"} ({guestCount} guests)</span>
                    <span className="font-mono">₹{cateringTotal.toLocaleString()}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-xs text-stone-700">
                      <span>Selected Add-ons ({selectedAddons.length})</span>
                      <span className="font-mono">₹{addonsTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>GST (18%)</span>
                    <span className="font-mono">₹{taxes.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E6DFC8] flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-[#1E1B19]">Estimated Total</span>
                    <span className="text-lg font-bold text-[#6B1426] font-mono">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-1 flex justify-between items-baseline text-xs font-semibold text-[#B8860B]">
                    <span>25% Advance Payable to Block Date</span>
                    <span className="font-mono text-base text-[#6B1426]">₹{advancePayable.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Advance Payment Verification */}
            {step === 4 && bookingResult && (
              <div className="space-y-6 text-center py-2">
                <div className="w-14 h-14 bg-[#FFF8F5] border border-[#B8860B]/40 mx-auto flex items-center justify-center text-[#6B1426]">
                  <CreditCard className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#B8860B]">
                    Booking Reservation Created
                  </span>
                  <h4 className="font-serif text-2xl text-[#6B1426] font-normal mt-1">
                    Complete 25% Advance Deposit
                  </h4>
                  <div className="inline-block mt-2 px-3 py-1 bg-white border border-[#E6DFC8] text-xs font-mono text-[#6B1426]">
                    Reference: {bookingResult.booking_reference}
                  </div>
                </div>

                <div className="p-5 bg-white border border-[#E6DFC8] text-left space-y-2.5 max-w-md mx-auto shadow-sm">
                  <div className="flex justify-between text-xs text-stone-700">
                    <span>Event Date &amp; Hall</span>
                    <span className="text-[#1E1B19] font-medium">{eventDate} • {bookingResult.hall}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-700">
                    <span>Time Slot</span>
                    <span className="text-[#1E1B19] font-medium capitalize">{slot.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-700">
                    <span>Total Estimate</span>
                    <span className="font-mono text-[#1E1B19]">₹{parseFloat(bookingResult.base_amount).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E6DFC8] flex justify-between text-sm font-bold text-[#6B1426]">
                    <span>Advance Payable Now</span>
                    <span className="font-mono text-base">₹{parseFloat(bookingResult.advance_amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-3 pt-2">
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleVerifyPayment}
                    variant="primary"
                    size="lg"
                    className="w-full !h-12 !border-accent"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying Payment Signature...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        <span>Pay Advance &amp; Confirm Booking (Instant Dev)</span>
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit SSL Cryptographic Verification &amp; Concurrency Lock</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Final Confirmed Pop-Out Certificate */}
            {step === 5 && bookingResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-6 text-center py-2"
              >
                {/* Grand Celebration Pop-Out Header */}
                <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 border-4 border-[#B8860B] flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
                  <FileCheck2 className="w-10 h-10 animate-bounce" />
                  <span className="absolute -top-2 -right-2 bg-[#B8860B] text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
                    100% LOCKED
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-xs font-bold tracking-widest uppercase shadow-sm">
                    <Sparkles className="w-4 h-4 text-[#B8860B]" />
                    <span>BOOKING CONFIRMED &amp; DATE OFFICIALLY LOCKED!</span>
                  </div>
                  <h4 className="font-serif text-3xl sm:text-4xl text-[#6B1426] font-normal mt-3">
                    Congratulations, {customerName}!
                  </h4>
                  <p className="text-stone-600 text-sm mt-1 max-w-md mx-auto">
                    Your royal wedding celebration is officially scheduled and guaranteed at Shree Palace Lawn.
                  </p>
                </div>

                {/* Pop-Out Royal Certificate Card */}
                <div className="p-6 sm:p-7 bg-white border-2 border-[#B8860B] text-left space-y-4 max-w-lg mx-auto shadow-2xl relative">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b-2 border-[#E6DFC8]">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#B8860B] font-bold">
                        Official Booking Reference
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xl font-extrabold text-[#6B1426] tracking-wide">
                          {paymentResult?.booking_reference || bookingResult.booking_reference}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              paymentResult?.booking_reference || bookingResult.booking_reference
                            );
                            alert("Booking Reference copied to clipboard!");
                          }}
                          className="px-2 py-0.5 bg-stone-100 hover:bg-[#FFF8F5] border border-stone-300 hover:border-[#B8860B] text-[10px] font-mono font-semibold text-stone-700 cursor-pointer transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider self-start sm:self-auto shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Payment Verified</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="p-2.5 bg-[#FDFBF7] border border-[#E6DFC8]">
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Wedding Date</div>
                      <div className="font-bold text-[#1E1B19] text-sm mt-0.5">{eventDate}</div>
                    </div>
                    <div className="p-2.5 bg-[#FDFBF7] border border-[#E6DFC8]">
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Venue / Lawn</div>
                      <div className="font-bold text-[#1E1B19] text-sm mt-0.5">{bookingResult.hall}</div>
                    </div>
                    <div className="p-2.5 bg-[#FDFBF7] border border-[#E6DFC8]">
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Reserved Slot</div>
                      <div className="font-bold text-[#1E1B19] capitalize mt-0.5">{slot.replace("_", " ")}</div>
                    </div>
                    <div className="p-2.5 bg-[#FDFBF7] border border-[#E6DFC8]">
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Expected Guests</div>
                      <div className="font-bold text-[#1E1B19] mt-0.5">{guestCount} Guests</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200">
                      <div className="text-emerald-800 text-[10px] uppercase font-bold">25% Advance Paid</div>
                      <div className="font-mono font-extrabold text-emerald-800 text-base mt-0.5">
                        ₹
                        {parseFloat(
                          paymentResult?.paid_amount ||
                            (paymentResult as any)?.amount_paid ||
                            bookingResult.advance_amount ||
                            "0"
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#FFF8F5] border border-amber-200">
                      <div className="text-stone-600 text-[10px] uppercase font-semibold">Balance Due (at event)</div>
                      <div className="font-mono font-bold text-stone-800 text-base mt-0.5">
                        ₹
                        {parseFloat(
                          paymentResult?.balance_amount ||
                            (paymentResult as any)?.balance_remaining ||
                            "0"
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-[#6B1426] bg-[#FFF8F5] p-3 border border-[#B8860B]/40 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Automated Concierge Confirmation:</strong> Receipt has been dispatched to WhatsApp at{" "}
                      <strong>+91 {customerPhone}</strong> and our team has locked the calendar.
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => window.print()}
                    className="flex-1 !h-12 !border-stone-400 !font-semibold"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    <span>Print Receipt</span>
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={resetAndClose}
                    className="flex-1 !h-12 !border-accent !font-semibold"
                  >
                    <span>Done &amp; Return</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Controls (Steps 1 to 3) */}
          {step <= 3 && (
            <div className="pt-4 mt-2 border-t border-[#E6DFC8] flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#6B1426] flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => {
                    if (step === 1 && !eventDate) {
                      setErrorMessage("Please select an event date before proceeding.");
                      return;
                    }
                    setErrorMessage(null);
                    setStep((s) => s + 1);
                  }}
                  className="!h-10 !px-6 !border-accent"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateBooking}
                  variant="primary"
                  size="md"
                  className="!h-10 !px-6 !border-accent"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Review &amp; Pay Advance</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
