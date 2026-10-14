import React from "react";

export default function GalleryLoading() {
  return (
    <main className="py-16 sm:py-24 px-4 sm:px-8 animate-pulse">
      <div className="max-w-[1120px] mx-auto space-y-10">
        <div className="space-y-3">
          <div className="h-4 w-28 bg-black/10 rounded" />
          <div className="h-10 w-64 bg-black/10 rounded-lg" />
          <div className="h-5 w-full max-w-lg bg-black/10 rounded" />
        </div>

        {/* Category Tabs Skeleton */}
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-black/10 rounded-lg shrink-0" />
          ))}
        </div>

        {/* Gallery Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-black/10 rounded-xl"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
