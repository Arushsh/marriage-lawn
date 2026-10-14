"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2 } from "lucide-react";
import { GalleryImage, SiteSettings } from "@/types/api";
import { Button } from "@/components/ui/Button";

const Lightbox = dynamic(() => import("@/components/ui/Lightbox"), {
  ssr: false,
});

const CATEGORIES = [
  { key: "all", label: "All Photos" },
  { key: "lawn", label: "Lawn & Open Area" },
  { key: "mandap", label: "Mandap & Stage" },
  { key: "dining", label: "Dining & Catering" },
  { key: "rooms", label: "Guest Rooms" },
  { key: "decor", label: "Decor & Lighting" },
  { key: "night", label: "Evening & Night" },
];

interface GalleryPageClientProps {
  initialImages: GalleryImage[];
  initialCount: number;
  initialNext: string | null;
  site: SiteSettings;
}

export function GalleryPageClient({
  initialImages,
  initialCount,
  initialNext,
  site,
}: GalleryPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(Boolean(initialNext));
  const [totalCount, setTotalCount] = useState<number>(initialCount);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch when category changes
  const handleCategoryChange = (catKey: string) => {
    setSelectedCategory(catKey);
    setPage(1);
    startTransition(async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", "1");
        if (catKey !== "all") queryParams.set("category", catKey);

        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
        const res = await fetch(`${apiBase}/gallery/?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setImages(data.results || (Array.isArray(data) ? data : []));
          setHasMore(Boolean(data.next));
          setTotalCount(data.count ?? (data.results?.length || 0));
        }
      } catch (err) {
        console.error("Failed to load category photos:", err);
      }
    });
  };

  // Load more
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(nextPage));
      if (selectedCategory !== "all") queryParams.set("category", selectedCategory);

      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"
      }/gallery/?${queryParams.toString()}`;

      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        const newResults = data.results || (Array.isArray(data) ? data : []);
        setImages((prev) => [...prev, ...newResults]);
        setPage(nextPage);
        setHasMore(Boolean(data.next));
      }
    } catch (err) {
      console.error("Failed to load more photos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Home
        </Link>
        <div className="space-y-2">
          <h1 className="font-serif text-[32px] sm:text-[44px] text-primary font-normal leading-[1.2]">
            Venue Photo Gallery
          </h1>
          <p className="text-[16px] sm:text-[17px] text-muted leading-[1.65] max-w-[65ch]">
            Explore high-resolution photographs of {site.venue_name}, featuring our main banquet lawns, mandap settings, evening illumination, and suites.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <Button
              key={cat.key}
              type="button"
              size="sm"
              variant={isActive ? "primary" : "outline"}
              onClick={() => handleCategoryChange(cat.key)}
              className="!h-10 !min-h-[40px] !px-4 text-xs sm:text-sm font-normal shrink-0"
            >
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Loading Transition Indicator */}
      {isPending && (
        <div className="flex items-center justify-center py-12 text-muted gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Updating gallery...</span>
        </div>
      )}

      {/* Empty State */}
      {!isPending && images.length === 0 && (
        <div className="bg-surface rounded-2xl p-12 text-center border border-black/[0.08] max-w-md mx-auto space-y-3">
          <p className="font-serif text-lg text-primary">No photos available</p>
          <p className="text-sm text-muted">
            There are currently no photos listed in this specific category.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            View All Photos
          </Button>
        </div>
      )}

      {/* Masonry / Grid (2 cols mobile, 3-4 cols desktop) */}
      {!isPending && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {images.map((image, idx) => (
            <button
              key={image.id || idx}
              type="button"
              onClick={() => openLightbox(idx)}
              aria-label={`Open photo: ${image.alt_text || image.caption || `Photo ${idx + 1}`}`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-black/5 border border-black/[0.06] hover:border-black/[0.18] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 text-left w-full"
            >
              <Image
                src={image.image}
                alt={image.alt_text || image.caption || "Wedding venue gallery"}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              {image.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm font-medium line-clamp-1">
                    {image.caption}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Pagination / Load More */}
      {hasMore && !isPending && (
        <div className="pt-6 text-center">
          <Button
            variant="outline"
            size="md"
            disabled={isLoadingMore}
            onClick={handleLoadMore}
            className="min-w-[160px]"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Loading...
              </span>
            ) : (
              `Load More Photos (${images.length} of ${totalCount})`
            )}
          </Button>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={activeIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(i) => setActiveIndex(i)}
        />
      )}
    </div>
  );
}
