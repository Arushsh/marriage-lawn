"use client";

import React, { useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryImage } from "@/types/api";

export interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const currentImage = images[currentIndex];
  const touchStartX = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext(); // swiped left
      } else {
        handlePrev(); // swiped right
      }
    }
    touchStartX.current = null;
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar with Counter and Close Button */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm font-normal">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.category && (
            <span className="text-xs uppercase tracking-wider text-stone-300">
              {currentImage.category}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation Arrows for Desktop */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-20 p-3 text-white/80 hover:text-white rounded-lg bg-black/50 hover:bg-black/70 border border-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-20 p-3 text-white/80 hover:text-white rounded-lg bg-black/50 hover:bg-black/70 border border-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Main Image Display */}
      <div
        className="relative w-full h-[70vh] sm:h-[80vh] max-w-5xl px-4 flex items-center justify-center cursor-pointer"
        onClick={onClose}
      >
        <div
          className="relative w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={currentImage.image}
            alt={currentImage.alt_text || currentImage.caption || "Venue Gallery"}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Bottom Caption Bar */}
      {(currentImage.caption || currentImage.alt_text) && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 text-center bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <p className="font-serif text-white text-base sm:text-lg max-w-2xl mx-auto font-normal">
            {currentImage.caption || currentImage.alt_text}
          </p>
        </div>
      )}
    </div>
  );
};

export default Lightbox;
