"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { GalleryImage, VideoLink } from "@/types/api";
import { FadeUp } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";

const Lightbox = dynamic(() => import("@/components/ui/Lightbox"), {
  ssr: false,
});

interface GallerySectionProps {
  images: GalleryImage[];
  videos?: VideoLink[];
}

const VISIBLE_COUNT = 6;

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "lawn", label: "Lawn" },
  { key: "mandap", label: "Mandap" },
  { key: "dining", label: "Dining" },
  { key: "rooms", label: "Rooms" },
  { key: "decor", label: "Decor" },
  { key: "night", label: "Night" },
];

export const GallerySection: React.FC<GallerySectionProps> = ({
  images = [],
  videos = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const safeImages = useMemo(() => (Array.isArray(images) ? images : []), [images]);

  const filteredImages = useMemo(() => {
    if (selectedCategory === "all") return safeImages;
    return safeImages.filter(
      (img) => img.category?.toLowerCase() === selectedCategory
    );
  }, [safeImages, selectedCategory]);

  const visibleImages = showAll
    ? filteredImages
    : filteredImages.slice(0, VISIBLE_COUNT);

  const handleImageClick = (idx: number) => {
    setActiveIndex(idx);
    setLightboxOpen(true);
  };

  const primaryVideo = videos[0];

  return (
    <section id="gallery" className="py-20 sm:py-32 bg-[#FFFBF4]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 space-y-10">
        {/* Heading */}
        <FadeUp>
          <div className="space-y-2">
            <h2 className="font-serif text-[28px] sm:text-[40px] font-normal leading-[1.2] text-primary">
              Photo &amp; Video Gallery
            </h2>
            <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[60ch]">
              Photographs from wedding ceremonies, evening illuminations, banquet dining, and decorated mandap stages.
            </p>
          </div>
        </FadeUp>

        {/* Video Tour Facade (loads on click to eliminate heavy third-party JS) */}
        {primaryVideo && (
          <FadeUp delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[420px] border border-black/[0.08]">
              {isPlayingVideo ? (
                <iframe
                  src={`${primaryVideo.url}${primaryVideo.url.includes("?") ? "&" : "?"}autoplay=1`}
                  title={primaryVideo.title || "Venue Video Tour"}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(true)}
                  className="w-full h-full relative flex items-center justify-center group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Play video: ${primaryVideo.title || "Venue Video Tour"}`}
                >
                  {safeImages[0] && (
                    <Image
                      src={safeImages[0].image}
                      alt={primaryVideo.title || "Venue Video Tour"}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 1120px"
                      className="object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

                  {/* Play Button Icon */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface text-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 ml-1 text-primary fill-current"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-white text-sm sm:text-base font-medium drop-shadow-md">
                      {primaryVideo.title || "Watch Venue Tour"}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </FadeUp>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <Button
                key={cat.key}
                type="button"
                size="sm"
                variant={isActive ? "primary" : "outline"}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setShowAll(false);
                }}
                className="!h-10 !min-h-[40px] !px-4 text-xs sm:text-sm font-normal"
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Grid */}
        {filteredImages.length === 0 ? (
          <p className="text-sm text-muted py-8">
            No photos in this category.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {visibleImages.map((image, idx) => (
                <button
                  key={image.id || idx}
                  type="button"
                  onClick={() => handleImageClick(idx)}
                  aria-label={`Open photo: ${image.alt_text || image.caption || `Photo ${idx + 1}`}`}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-black/5 border border-black/[0.06] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 text-left w-full"
                >
                  <Image
                    src={image.image}
                    alt={image.alt_text || image.caption || "Wedding venue photograph"}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </button>
              ))}
            </div>

            {!showAll && filteredImages.length > VISIBLE_COUNT && (
              <div className="text-center pt-2">
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="text-sm font-medium text-primary"
                >
                  View all {filteredImages.length} photos
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={filteredImages}
          currentIndex={activeIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(i) => setActiveIndex(i)}
        />
      )}
    </section>
  );
};
