"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  CheckCircle2,
  ShieldCheck,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
} from "lucide-react";
import { requestVoiceCallback } from "@/lib/api";
import { VoiceCallbackResponse } from "@/types/api";
import { Button } from "@/components/ui/Button";

interface InstantCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const InstantCallModal: React.FC<InstantCallModalProps> = ({
  isOpen,
  onClose,
  defaultDate = "",
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState(defaultDate);
  const [guestCount, setGuestCount] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callResponse, setCallResponse] = useState<VoiceCallbackResponse | null>(null);

  // Language state: Default to Hindi as requested
  const [language, setLanguage] = useState<"hi" | "en">("hi");

  // Live Call Audio State
  const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "connected" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Available browser TTS voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail && avail.length > 0) {
        setVoices(avail);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Speak aloud through computer/phone audio using Web Speech API in Hindi or English
  const speakAloud = (text: string, langChoice = language) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel(); // Stop any previous speech
    setActiveSpeechText(text);

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.02;

    const currentVoices =
      voices.length > 0
        ? voices
        : typeof window !== "undefined" && "speechSynthesis" in window
        ? window.speechSynthesis.getVoices()
        : [];

    if (langChoice === "hi") {
      utterance.lang = "hi-IN";
      utterance.rate = 0.90; // Slower, royal, respectful cadence in Hindi

      // Prioritize authentic Hindi voices (Google हिन्दी, Microsoft Swara / Madhur / Kalpana / Hemant)
      const hindiVoice =
        currentVoices.find(
          (v) =>
            v.lang === "hi-IN" ||
            v.lang.toLowerCase().startsWith("hi") ||
            v.name.toLowerCase().includes("hindi") ||
            v.name.includes("हिन्दी") ||
            v.name.toLowerCase().includes("swara") ||
            v.name.toLowerCase().includes("madhur") ||
            v.name.toLowerCase().includes("kalpana")
        ) ||
        // Fallback to Indian English voice which pronounces Indian names & Hindi words accurately
        currentVoices.find((v) => v.lang === "en-IN" || v.name.toLowerCase().includes("india")) ||
        currentVoices[0];

      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      utterance.lang = "en-IN";
      utterance.rate = 0.94;

      const englishVoice =
        currentVoices.find((v) => v.lang === "en-IN" || v.name.toLowerCase().includes("india")) ||
        currentVoices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
        ) ||
        currentVoices[0];

      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (!name.trim()) {
      setError(language === "hi" ? "कृपया अपना नाम दर्ज करें।" : "Please enter your name.");
      return;
    }
    if (cleanPhone.length < 10) {
      setError(
        language === "hi"
          ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestVoiceCallback({
        name: name.trim(),
        phone: cleanPhone,
        event_date: eventDate || undefined,
        guest_count: guestCount ? parseInt(guestCount, 10) : undefined,
        notes: notes.trim(),
      });
      setCallResponse(res);
      setCallStatus("dialing");

      // Play ringing and speech sequence
      setTimeout(() => {
        setCallStatus("connected");
        let greetingScript = "";

        if (language === "hi") {
          greetingScript =
            res.rendered_speech ||
            `नमस्ते ${name.trim()} जी! मैं श्री पैलेस लॉन, प्रयागराज से आपकी एआई वेडिंग साथी बोल रही हूँ। हमें आपके शुभ विवाह के लिए कॉल का अनुरोध प्राप्त हुआ है। हमारे भव्य शाही लॉन और बैंक्वेट हॉल उपलब्ध हैं। व्हाट्सएप पर हमारा शाही ब्रोशर और मेन्यू तुरंत पाने के लिए कीपैड पर 1 दबाएं, या कॉल समाप्त करने के लिए 9 दबाएं।`;
        } else {
          greetingScript = `Namaste ${name.trim()}! This is the AI Wedding Concierge from Shree Palace Lawn, Prayagraj. We received your request regarding your upcoming wedding celebration. Our grand lawns and royal banquet halls are available, and we would love to craft your dream celebration. Press 1 on your keypad for our brochure on WhatsApp, or press 9 to opt out.`;
        }

        speakAloud(greetingScript, language);
      }, 1800);
    } catch (err: any) {
      setError(
        err?.message ||
          (language === "hi"
            ? "एआई कॉल मिलाने में असमर्थ। कृपया पुनः प्रयास करें।"
            : "Failed to initiate AI call. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (digit === "1") {
      const msg =
        language === "hi"
          ? `धन्यवाद ${name || "अतिथि"} जी! हमने आपके व्हाट्सएप नंबर +91 ${phone} पर श्री पैलेस लॉन का संपूर्ण शाही ब्रोशर, बैंक्वेट मेन्यू और मूल्य सूची तुरंत भेज दी है। हमारे वरिष्ठ वेडिंग समन्वयक आपके विवरण की समीक्षा कर रहे हैं।`
          : `Thank you ${name || "valued guest"}! We have immediately dispatched our full royal brochure, banquet menu, and pricing schedule to your WhatsApp at +91 ${phone}. Our senior wedding coordinator is reviewing your details now!`;
      speakAloud(msg, language);
    } else if (digit === "9") {
      const msg =
        language === "hi"
          ? `आपका फोन नंबर +91 ${phone} हमारी डू नॉट डिस्टर्ब सूची में दर्ज कर लिया गया है। आपको भविष्य में कोई स्वचालित कॉल प्राप्त नहीं होगी। धन्यवाद एवं आपका दिन शुभ हो।`
          : `Your phone number +91 ${phone} has been registered in our Do Not Disturb registry. You will receive no further automated voice calls. Thank you and have a wonderful day.`;
      speakAloud(msg, language);
    }
  };

  const handleEndCall = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCallStatus("ended");
  };

  const toggleMute = () => {
    if (!isMuted) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (activeSpeechText) {
        speakAloud(activeSpeechText, language);
      }
    }
  };

  const resetForm = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCallResponse(null);
    setCallStatus("idle");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetForm}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
        />

        {/* Modal Window: Regal Light Theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-lg bg-[#FDFBF7] border border-[#E6DFC8] shadow-2xl p-6 sm:p-8 text-[#1E1B19] z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={resetForm}
            className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 border border-transparent hover:border-[#E6DFC8] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Language Selector: Hindi (default) & English */}
          <div className="absolute top-5 right-14 flex items-center gap-1 bg-[#F5EFE6] border border-[#E6DFC8] p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2.5 py-1 font-medium transition-all ${
                language === "hi"
                  ? "bg-[#6B1426] text-white shadow-xs font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 font-medium transition-all ${
                language === "en"
                  ? "bg-[#6B1426] text-white shadow-xs font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              EN
            </button>
          </div>

          {callStatus === "idle" ? (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 pr-24">
                <div className="w-12 h-12 border border-[#B8860B]/40 bg-[#FFF8F5] flex items-center justify-center text-[#6B1426] shrink-0">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-[#B8860B]/40 bg-[#FFFDF9] text-[#B8860B] text-[10px] uppercase font-semibold tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#B8860B]" />
                    <span>
                      {language === "hi"
                        ? "तत्काल एआई वॉइस कॉल (हिन्दी वार्तालाप)"
                        : "Instant Talking AI Concierge"}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#6B1426] font-normal tracking-wide mt-0.5">
                    {language === "hi" ? "श्री पैलेस एआई वॉइस कॉल" : "Instant AI Voice Call"}
                  </h3>
                </div>
              </div>

              <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                {language === "hi"
                  ? "हमारी एआई वेडिंग साथी से सीधे हिन्दी में बात करें। विवाह मुहूर्त, लॉन उपलब्धता, शाही मेन्यू और पैकेज की जानकारी तुरंत अपनी आवाज़ में सुनें।"
                  : "Connect directly with our AI Wedding Concierge. Receive real-time spoken answers about muhurat availability, catering menus, and package pricing over audio."}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B1426] uppercase tracking-wider mb-1">
                    {language === "hi" ? "आपका पूरा नाम *" : "Your Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === "hi" ? "उदा. रोहन मल्होत्रा" : "e.g. Rohan Malhotra"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E6DFC8] text-[#1E1B19] placeholder-stone-400 focus:outline-none focus:border-[#6B1426] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B1426] uppercase tracking-wider mb-1">
                    {language === "hi" ? "मोबाइल नंबर (१० अंक) *" : "Mobile Number (10 Digits) *"}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-[#E6DFC8] bg-stone-100 text-stone-600 text-sm font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#E6DFC8] text-[#1E1B19] placeholder-stone-400 focus:outline-none focus:border-[#6B1426] text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      {language === "hi" ? "विवाह / कार्यक्रम तिथि" : "Event Date (Optional)"}
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E6DFC8] text-[#1E1B19] focus:outline-none focus:border-[#6B1426] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                      {language === "hi" ? "अपेक्षित अतिथि संख्या" : "Expected Guests"}
                    </label>
                    <input
                      type="number"
                      placeholder={language === "hi" ? "उदा. 500" : "e.g. 500"}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E6DFC8] text-[#1E1B19] focus:outline-none focus:border-[#6B1426] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    {language === "hi" ? "चर्चा का विषय" : "Topic of Discussion"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      language === "hi"
                        ? "उदा. शुभ मुहूर्त, शुद्ध शाकाहारी मेन्यू, मंडप सजावट..."
                        : "e.g. Auspicious wedding dates, pure-veg menu, mandap setup..."
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E6DFC8] text-[#1E1B19] focus:outline-none focus:border-[#6B1426] text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="primary"
                    size="lg"
                    className="w-full !h-12 !border-accent"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {language === "hi"
                          ? "एआई वॉइस लाइन से जोड़ा जा रहा है..."
                          : "Connecting AI Voice Line..."}
                      </span>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        <span>
                          {language === "hi"
                            ? "एआई वॉइस कॉल शुरू करें (हिन्दी में बोलेगी)"
                            : "Start AI Voice Call (Talks Aloud)"}
                        </span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Privacy & Opt-Out Notice */}
                <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {language === "hi"
                      ? "कोई अनचाही कॉल नहीं। कॉल के दौरान 9 दबाकर कभी भी सदस्यता रद्द करें।"
                      : "No spam. Press 9 during the call to opt out anytime."}
                  </span>
                </div>
              </form>
            </div>
          ) : (
            /* Live Call & Voice Talking Screen */
            <div className="text-center py-4 space-y-6">
              {/* Call Status Avatar with Sound Wave Ring */}
              <div className="relative mx-auto w-20 h-20 border-2 border-[#B8860B] bg-[#FFF8F5] flex items-center justify-center text-[#6B1426] shadow-md">
                {callStatus === "dialing" ? (
                  <PhoneCall className="w-8 h-8 animate-bounce text-[#6B1426]" />
                ) : callStatus === "connected" ? (
                  <Volume2 className={`w-8 h-8 text-[#6B1426] ${isSpeaking ? "animate-pulse" : ""}`} />
                ) : (
                  <PhoneOff className="w-8 h-8 text-stone-400" />
                )}
                {isSpeaking && (
                  <span className="absolute inset-0 border-2 border-[#B8860B] animate-ping opacity-40" />
                )}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-semibold tracking-wider uppercase ${
                    callStatus === "connected"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : callStatus === "dialing"
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-stone-400 bg-stone-100 text-stone-600"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {callStatus === "dialing" &&
                      (language === "hi" ? "कॉल मिलाई जा रही है..." : "Dialing & Connecting...")}
                    {callStatus === "connected" &&
                      (isSpeaking
                        ? language === "hi"
                          ? "एआई साथी हिन्दी में बोल रही हैं 🔊"
                          : "AI Concierge Speaking Aloud 🔊"
                        : language === "hi"
                        ? "कॉल चालू है / सुन रहे हैं"
                        : "Listening / In Call")}
                    {callStatus === "ended" &&
                      (language === "hi" ? "कॉल समाप्त" : "Call Ended")}
                  </span>
                </span>
                <h4 className="font-serif text-2xl text-[#6B1426] font-normal mt-3">
                  {name} (+91 {phone})
                </h4>
                <p className="text-stone-500 text-xs mt-1">
                  {language === "hi"
                    ? "श्री पैलेस लॉन एआई टेलीफोनी वॉइस लाइन"
                    : "Shree Palace Lawn AI Telephony Voice Line"}
                </p>
              </div>

              {/* Dynamic Sound Equalizer Visualizer */}
              {callStatus === "connected" && (
                <div className="p-4 bg-white border border-[#E6DFC8] text-left space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#6B1426]">
                    <span className="font-mono font-semibold flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-[#B8860B]" />
                      {language === "hi"
                        ? "लाइव ऑडियो वॉइस स्ट्रीम (हिन्दी)"
                        : "Real-Time Audio Voice Stream"}
                    </span>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1 text-stone-500 hover:text-[#6B1426] flex items-center gap-1 text-[11px] font-mono cursor-pointer border border-[#E6DFC8] px-2 bg-stone-50"
                      title={isMuted ? "Unmute Voice" : "Mute Voice"}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-600" />
                          <span>{language === "hi" ? "अनम्यूट" : "Unmute"}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === "hi" ? "म्यूट" : "Mute"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Equalizer Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-10 py-1 bg-[#FFF8F5] border border-[#E6DFC8]/60">
                    {[18, 32, 44, 26, 38, 20, 48, 34, 28, 42, 22, 36, 24, 40].map((height, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-none transition-all ${
                          isSpeaking ? "bg-[#6B1426]" : "bg-stone-300"
                        }`}
                        style={{
                          height: isSpeaking ? `${height}px` : "6px",
                          animation: isSpeaking ? `pulse 0.8s infinite ${(i * 90) % 500}ms` : "none",
                        }}
                      />
                    ))}
                  </div>

                  {/* Live Spoken Speech Box in Hindi */}
                  <div className="p-3 bg-[#FFFDF9] border border-[#E6DFC8] text-xs text-stone-700 italic leading-relaxed">
                    &quot;{activeSpeechText}&quot;
                  </div>

                  {/* Interactive DTMF Keypad Controls */}
                  <div className="pt-1 border-t border-[#E6DFC8] space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B1426] text-center">
                      {language === "hi"
                        ? "इंटरैक्टिव कीपैड (आवाज़ सुनने के लिए क्लिक करें):"
                        : "Interactive Keypad Actions (Click to Test Response Aloud):"}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleKeypadPress("1")}
                        className="py-2 px-3 bg-white hover:bg-stone-50 border border-[#E6DFC8] hover:border-[#6B1426] text-xs text-[#1E1B19] font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span className="w-5 h-5 bg-stone-100 border border-stone-300 flex items-center justify-center font-mono font-bold text-[11px] text-[#6B1426]">
                          1
                        </span>
                        <span>
                          {language === "hi" ? "व्हाट्सएप पर ब्रोशर" : "Brochure on WhatsApp"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleKeypadPress("9")}
                        className="py-2 px-3 bg-white hover:bg-stone-50 border border-[#E6DFC8] hover:border-[#6B1426] text-xs text-[#1E1B19] font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span className="w-5 h-5 bg-stone-100 border border-stone-300 flex items-center justify-center font-mono font-bold text-[11px] text-red-700">
                          9
                        </span>
                        <span>
                          {language === "hi" ? "सदस्यता रद्द (DND)" : "Opt Out (DND)"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* End Call & Done Controls */}
              <div className="flex gap-3 justify-center pt-2">
                {callStatus === "connected" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleEndCall}
                    className="w-full !h-11 !border-red-400 !text-red-700 hover:!bg-red-50"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    <span>{language === "hi" ? "कॉल समाप्त करें" : "Hang Up / End Call"}</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={resetForm}
                    className="w-full !h-11 !border-accent"
                  >
                    <span>{language === "hi" ? "पूर्ण" : "Done"}</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

