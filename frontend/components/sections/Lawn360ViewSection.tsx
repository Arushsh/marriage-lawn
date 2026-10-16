"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Compass,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Info,
  MapPin,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Calendar,
  Eye,
} from "lucide-react";
import { FadeUp } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";
import { OnlineBookingModal } from "@/components/booking/OnlineBookingModal";

interface Hotspot {
  id: string;
  xPercent: number; // 0 to 100% position on panorama
  yPercent: number;
  title: string;
  description: string;
  badge: string;
}

interface PanoramaSpot {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  image: string;
  hotspots: Hotspot[];
}

const PANORAMA_SPOTS: PanoramaSpot[] = [
  {
    id: "main-lawn",
    name: "The Grand Botanic Lawn",
    subtitle: "40,000 Sq.Ft Manicured Greenery at Twilight",
    badge: "1,500 – 5,000 Guests",
    image: "/palace-lawn.jpg",
    hotspots: [
      {
        id: "lawn-cap",
        xPercent: 32,
        yPercent: 55,
        title: "5,000+ Floating Guest Capacity",
        description: "Expansive velvet lawn with unobstructed sightlines, carpeted aisles, and twilight ambient illuminations.",
        badge: "Main Arena",
      },
      {
        id: "dining-pavil",
        xPercent: 68,
        yPercent: 48,
        title: "Royal Dining & Banquet Pavilion",
        description: "Dedicated pure-vegetarian dining courtyard with live counter stations and crystal chandeliers.",
        badge: "Dining Area",
      },
      {
        id: "varmala-hydr",
        xPercent: 88,
        yPercent: 60,
        title: "Hydraulic Varmala Stage",
        description: "Central hydraulic revolving platform with synchronized cold pyrotechnic fountains.",
        badge: "Ceremony Stage",
      },
    ],
  },
  {
    id: "mandap-stage",
    name: "Royal Mandap & Sacred Stage",
    subtitle: "Architectural 4-Pillar Vedic Sanctuary",
    badge: "Sacred Rituals",
    image: "/palace-mandap.jpg",
    hotspots: [
      {
        id: "mandap-core",
        xPercent: 46,
        yPercent: 52,
        title: "Vedic Sacred Mandap",
        description: "Traditional carved stone pillars draped in authentic marigold, jasmine, and exotic orchid cascades.",
        badge: "Pheras Sanctum",
      },
      {
        id: "havan-altar",
        xPercent: 55,
        yPercent: 70,
        title: "Sacred Havan Kund",
        description: "Heavy brass havankund equipped with smokeless ventilation and cushioned seating for family.",
        badge: "Vedic Fire Altar",
      },
      {
        id: "bridal-entry",
        xPercent: 18,
        yPercent: 58,
        title: "Bridal Red Carpet Aisle",
        description: "Illuminated walkway flanked by antique brass lanterns and rose petal showers.",
        badge: "Grand Entry",
      },
    ],
  },
  {
    id: "banquet-colonnade",
    name: "Palatial Banquet Pavilion",
    subtitle: "Air-Conditioned Indoor & Courtyard Luxury",
    badge: "Dining & Indoor",
    image: "/palace-hall.jpg",
    hotspots: [
      {
        id: "chandeliers",
        xPercent: 35,
        yPercent: 38,
        title: "Crystal Chandelier Canopy",
        description: "Overhead royal chandeliers imported for palatial dining ambience and photography.",
        badge: "Lighting",
      },
      {
        id: "kitchen-live",
        xPercent: 78,
        yPercent: 62,
        title: "Live Khansama Kitchens",
        description: "Segregated pure-vegetarian and gourmet live tawa, chaat, and dessert stations.",
        badge: "Catering",
      },
    ],
  },
  {
    id: "floral-entrance",
    name: "Grand Floral Entrance Boulevard",
    subtitle: "Royal Procession & Vintage Car Arrival",
    badge: "Arrival Courtyard",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=3200&q=90",
    hotspots: [
      {
        id: "floral-arch",
        xPercent: 48,
        yPercent: 45,
        title: "Scented Floral Welcome Arch",
        description: "Towering 20-foot floral gateway with Shehnai musicians and rose water misting.",
        badge: "Welcome Gate",
      },
      {
        id: "valet-drive",
        xPercent: 22,
        yPercent: 68,
        title: "150+ Vehicle Valet Driveway",
        description: "Spacious paved driveway with dedicated attendants and secure valet parking bays.",
        badge: "Parking & Access",
      },
    ],
  },
];

export const Lawn360ViewSection: React.FC = () => {
  const [activeSpotId, setActiveSpotId] = useState<string>("main-lawn");
  const [panOffset, setPanOffset] = useState<number>(0); // 0 to 100 percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const currentSpot =
    PANORAMA_SPOTS.find((s) => s.id === activeSpotId) || PANORAMA_SPOTS[0];

  // Auto-rotation loop
  useEffect(() => {
    let lastTime = performance.now();

    const rotate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (isAutoRotate && !isDragging) {
        // Slow luxury rotation: ~0.02% per 16ms
        setPanOffset((prev) => (prev + (delta * 0.015)) % 100);
      }
      animationFrameRef.current = requestAnimationFrame(rotate);
    };

    animationFrameRef.current = requestAnimationFrame(rotate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAutoRotate, isDragging]);

  // Mouse & Touch Drag Handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    startOffsetRef.current = panOffset;
  };

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const diffX = clientX - startXRef.current;
      const containerWidth = viewerContainerRef.current?.offsetWidth || 1000;
      // Convert pixels dragged into percentage offset
      const percentDelta = (diffX / containerWidth) * 55;
      let newOffset = (startOffsetRef.current - percentDelta) % 100;
      if (newOffset < 0) newOffset += 100;
      setPanOffset(newOffset);
    },
    [isDragging]
  );

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Heading calculation: 0° to 360°
  const currentDegrees = Math.round((panOffset / 100) * 360);
  const compassDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const compassHeading =
    compassDirections[Math.floor(((currentDegrees + 22.5) % 360) / 45)];

  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <section id="virtual-tour" className="py-20 sm:py-32 bg-[#FAF7F0] border-b border-[#E6DFC8]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-10">
        <FadeUp>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#B8860B]/40 text-[#6B1426] text-xs font-semibold uppercase tracking-widest shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-[#B8860B] animate-spin" style={{ animationDuration: "12s" }} />
                <span>Interactive 360° Virtual Lawn Walkthrough</span>
              </div>
              <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-[#6B1426]">
                Explore The Lawn in 360° Panoramas
              </h2>
              <p className="text-[15px] sm:text-[17px] text-stone-600 leading-[1.65] max-w-[62ch]">
                Take a virtual stroll across our 40,000 sq.ft royal grounds. Drag to look around in 360 degrees, inspect the Mandap setup, banquet pavilion, and guest capacity landmarks.
              </p>
            </div>

            {/* Viewpoint Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {PANORAMA_SPOTS.map((spot) => {
                const isActive = spot.id === activeSpotId;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => {
                      setActiveSpotId(spot.id);
                      setActiveHotspot(null);
                    }}
                    className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all border cursor-pointer ${
                      isActive
                        ? "bg-[#6B1426] text-white border-[#6B1426] shadow-sm"
                        : "bg-white text-stone-700 border-[#E6DFC8] hover:border-[#6B1426]"
                    }`}
                  >
                    {spot.name}
                  </button>
                );
              })}
            </div>
          </div>
        </FadeUp>

        {/* 360° Interactive Viewer Container */}
        <div
          ref={viewerContainerRef}
          className={`relative w-full rounded-none overflow-hidden border-2 border-[#B8860B]/60 shadow-2xl bg-black select-none ${
            isFullscreen ? "h-screen" : "h-[500px] sm:h-[620px]"
          }`}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Panoramic Image Layer with Continuous Repeat Seamless Wrap */}
          <div
            className="absolute inset-0 flex h-full pointer-events-none transition-transform"
            style={{
              width: "300%",
              transform: `translateX(-${(panOffset % 100) / 3}%) scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.08s ease-out",
            }}
          >
            {[0, 1, 2].map((repeatIdx) => (
              <div key={repeatIdx} className="relative w-1/3 h-full">
                <Image
                  src={currentSpot.image}
                  alt={currentSpot.name}
                  fill
                  priority
                  unoptimized
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Vignette & Twilight Atmosphere Gradients */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/35" />

          {/* Interactive 3D Hotspot Pins */}
          {currentSpot.hotspots.map((h) => {
            // Hotspot coordinates wrap with 360 pan offset
            const adjustedX = ((h.xPercent - panOffset + 200) % 100);
            const isVisible = adjustedX >= 5 && adjustedX <= 95;
            const isSelected = activeHotspot?.id === h.id;

            if (!isVisible) return null;

            return (
              <div
                key={h.id}
                style={{
                  left: `${adjustedX}%`,
                  top: `${h.yPercent}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute z-20"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(isSelected ? null : h);
                  }}
                  className={`relative flex items-center justify-center p-2 rounded-full cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#6B1426] text-white scale-125 ring-4 ring-[#B8860B]"
                      : "bg-white/95 text-[#6B1426] hover:scale-110 shadow-lg border border-[#B8860B]"
                  }`}
                  title={h.title}
                >
                  <MapPin className="w-4 h-4 fill-current" />
                  <span className="absolute -inset-1 rounded-full border border-[#B8860B] animate-ping opacity-60 pointer-events-none" />
                </button>

                {/* Hotspot Popup Tooltip */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 sm:w-72 p-4 bg-white/95 backdrop-blur-md border-2 border-[#B8860B] text-[#1E1B19] shadow-2xl z-30 space-y-1.5 text-left animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#B8860B]">
                      <span>{h.badge}</span>
                      <span>✦ 360 Landmark</span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#6B1426]">
                      {h.title}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {h.description}
                    </p>
                    <div className="pt-2 border-t border-[#E6DFC8] flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setIsBookingOpen(true)}
                        className="text-[11px] font-semibold text-[#6B1426] hover:underline cursor-pointer"
                      >
                        Reserve This Lawn →
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHotspot(null)}
                        className="text-[10px] text-stone-400 hover:text-stone-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Top Bar: Compass Heading & Active Area */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-1.5 border border-white/20 text-white text-xs">
              <Compass className="w-4 h-4 text-[#B8860B]" />
              <span className="font-mono font-bold tracking-widest text-[#B8860B]">
                {compassHeading} {currentDegrees}°
              </span>
              <span className="text-white/40">|</span>
              <span className="font-medium tracking-wide">{currentSpot.name}</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/20 text-white text-xs font-mono">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>360° Spherical Panoramic View</span>
            </div>
          </div>

          {/* Center Drag Prompt (Fades out when interacting) */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500 z-10 ${
              isDragging ? "opacity-0" : "opacity-90"
            }`}
          >
            <div className="bg-black/65 backdrop-blur-md border border-white/30 text-white px-4 py-2 text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-2xl">
              <span>⇄</span>
              <span>Drag or Swipe to Look Around in 360°</span>
              <span>⇄</span>
            </div>
          </div>

          {/* Bottom Controls Toolbar */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
            <div className="bg-black/70 backdrop-blur-md px-3.5 py-2 border border-white/20 text-white text-xs flex items-center gap-2.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#B8860B] bg-[#B8860B]/20 px-2 py-0.5 border border-[#B8860B]/40">
                {currentSpot.badge}
              </span>
              <span className="font-serif text-sm tracking-wide">{currentSpot.subtitle}</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Auto Rotate Toggle */}
              <button
                type="button"
                onClick={() => setIsAutoRotate((v) => !v)}
                className={`p-2.5 border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isAutoRotate
                    ? "bg-[#6B1426] border-[#B8860B] text-white"
                    : "bg-black/70 border-white/20 text-white hover:bg-black"
                }`}
                title={isAutoRotate ? "Pause Auto Rotation" : "Start Auto 360° Glide"}
              >
                {isAutoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden sm:inline text-[11px] font-mono">
                  {isAutoRotate ? "Auto-Glide ON" : "Auto-Glide OFF"}
                </span>
              </button>

              {/* Reset to 0 deg */}
              <button
                type="button"
                onClick={() => setPanOffset(0)}
                className="p-2.5 bg-black/70 hover:bg-black border border-white/20 text-white text-xs cursor-pointer"
                title="Reset Angle to North (0°)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 1.75))}
                className="p-2.5 bg-black/70 hover:bg-black border border-white/20 text-white text-xs cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
                className="p-2.5 bg-black/70 hover:bg-black border border-white/20 text-white text-xs cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2.5 bg-black/70 hover:bg-black border border-white/20 text-white text-xs cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Instant Booking Trigger Button */}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsBookingOpen(true)}
                className="!h-9 !px-4 !border-accent !bg-[#6B1426] text-white shadow-md cursor-pointer ml-1"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                <span>Book This Lawn</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <OnlineBookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      </div>
    </section>
  );
};
