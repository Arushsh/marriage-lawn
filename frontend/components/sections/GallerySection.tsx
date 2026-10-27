"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { GalleryImage, VideoLink } from "@/types/api";
import { FadeUp } from "@/components/ui/FadeUp";
import { FlipIn } from "@/components/animations/FlipIn";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

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
    <section id="gallery" className="relative py-20 sm:py-32 passage-pearl overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        {/* Heading */}
        <FadeUp>
          <div className="space-y-4 max-w-2xl">
            <AnimatedHeading
              as="h2"
              className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
            >
              Photo &amp; Video Portfolio
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
              Architectural photographs from sacred ceremonies, evening illuminations,
              banquet dining, and manicured lawns.
            </p>
          </div>
        </FadeUp>

        {/* Video Tour Facade */}
        {primaryVideo && (
          <FadeUp delay={0.1}>
            <div className="gota-glass rounded-2xl p-2.5 sm:p-3">
              <div className="relative overflow-hidden bg-[#04101a] rounded-xl aspect-video max-h-[460px]">
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
                    className="w-full h-full relative flex items-center justify-center group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani"
                    aria-label={`Play video: ${primaryVideo.title || "Venue Video Tour"}`}
                  >
                    {safeImages[0]?.image ? (
                      <Image
                        src={safeImages[0].image}
                        alt={primaryVideo.title || "Venue Video Tour"}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 1280px"
                        className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#071720]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04101a]/70 via-[#04101a]/25 to-transparent" />

                    {/* Play Button — a diya flame in a glass diamond */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <span className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center">
                        <span className="absolute inset-0 rotate-45 rounded-xl border border-zari/60 gota-glass transition-transform duration-500 group-hover:rotate-[135deg]" />
                        <svg
                          className="relative w-7 h-7 sm:w-9 sm:h-9 ml-1 text-[#ffb454] fill-current"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="text-[#f2ede0] text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">
                        {primaryVideo.title || "Watch Venue Tour"}
                      </span>
                    </div>
                  </button>
                )}
              </div>
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
                className={`!h-10 !min-h-[40px] !px-5 !rounded-full text-xs font-semibold tracking-[0.14em] uppercase shrink-0 ${
                  isActive ? "" : "!border-border"
                }`}
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* The framed photographs */}
        {filteredImages.length === 0 ? (
          <p className="text-sm text-muted py-8">
            No photos in this category.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {visibleImages.map((image, idx) => (
                <FlipIn key={image.id || idx} delay={(idx % 3) * 0.06} from={13}>
                  <button
                    type="button"
                    onClick={() => handleImageClick(idx)}
                    aria-label={`Open photo: ${image.alt_text || image.caption || `Photo ${idx + 1}`}`}
                    className="gota-glass rounded-xl p-1.5 sm:p-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rani text-left w-full transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-18px_var(--c-shadow)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#0c2331]">
                      <Image
                        src={image.image}
                        alt={image.alt_text || image.caption || "Wedding venue photograph"}
                        fill
                        unoptimized
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#04101a]/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    {image.caption && (
                      <div className="pt-2 px-1 text-[11px] uppercase tracking-[0.12em] text-muted truncate">
                        {image.caption}
                      </div>
                    )}
                  </button>
                </FlipIn>
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
