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
    <section id="gallery" className="py-20 sm:py-32 bg-surface border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        {/* Heading */}
        <FadeUp>
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
              Curated Portfolio
            </span>
            <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-primary">
              Photo &amp; Video Portfolio
            </h2>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.65] max-w-[62ch]">
              Architectural photographs from sacred ceremonies, evening illuminations, banquet dining, and manicured lawns.
            </p>
          </div>
        </FadeUp>

        {/* Video Tour Facade */}
        {primaryVideo && (
          <FadeUp delay={0.1}>
            <div className="p-2 sm:p-3 bg-white border border-border">
              <div className="relative overflow-hidden bg-black aspect-video max-h-[440px]">
                {isPlayingVideo ? (
                  <iframe
                    src={`${primaryVideo.url.replace("watch?v=", "embed/")}${primaryVideo.url.includes("?") ? "&" : "?"}autoplay=1`}
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
                    className="w-full h-full relative flex items-center justify-center group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`Play video: ${primaryVideo.title || "Venue Video Tour"}`}
                  >
                    {safeImages[0]?.image ? (
                      <Image
                        src={safeImages[0].image}
                        alt={primaryVideo.title || "Venue Video Tour"}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 1280px"
                        className="object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-stone-900" />
                    )}
                    <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/30 transition-colors" />

                    {/* Play Button Icon */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary border border-accent text-accent flex items-center justify-center shadow-none group-hover:bg-primary-dark transition-colors">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 ml-1 text-accent fill-current"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">
                        {primaryVideo.title || "Watch Venue Tour"}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </FadeUp>
        )}

        {/* Category Tabs: tracked uppercase */}
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
                className={`!h-10 !min-h-[40px] !px-5 text-xs font-semibold tracking-[0.14em] uppercase ${
                  isActive ? "!border-accent" : "!border-border"
                }`}
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Grid with 1px Hairline Inset Mats */}
        {filteredImages.length === 0 ? (
          <p className="text-sm text-muted py-8">
            No photos in this category.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {visibleImages.map((image, idx) => (
                <button
                  key={image.id || idx}
                  type="button"
                  onClick={() => handleImageClick(idx)}
                  aria-label={`Open photo: ${image.alt_text || image.caption || `Photo ${idx + 1}`}`}
                  className="p-1.5 sm:p-2.5 bg-white border border-border group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left w-full transition-colors hover:border-accent"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <Image
                      src={image.image}
                      alt={image.alt_text || image.caption || "Wedding venue photograph"}
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {image.caption && (
                    <div className="pt-2 px-1 text-[11px] uppercase tracking-[0.12em] text-muted truncate">
                      {image.caption}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {!showAll && filteredImages.length > VISIBLE_COUNT && (
              <div className="text-center pt-4">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowAll(true)}
                  className="!px-8"
                >
                  View All {filteredImages.length} Photographs
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
