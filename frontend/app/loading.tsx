import React from "react";

export default function Loading() {
  return (
    <div className="w-full min-h-screen space-y-12 animate-pulse pb-16">
      {/* Hero Skeleton */}
      <div className="h-[80vh] bg-neutral-900/40 flex items-center justify-center">
        <div className="space-y-4 text-center w-full max-w-lg px-4">
          <div className="h-6 w-48 bg-black/10 rounded-full mx-auto" />
          <div className="h-12 w-3/4 bg-black/10 rounded-xl mx-auto" />
          <div className="h-5 w-1/2 bg-black/10 rounded-lg mx-auto" />
        </div>
      </div>

      {/* Highlights Strip Skeleton */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-surface rounded-2xl shadow-xs border border-black/5" />
        ))}
      </div>

      {/* About Skeleton */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="h-80 bg-surface rounded-2xl border border-black/5" />
        <div className="space-y-4">
          <div className="h-4 w-24 bg-black/10 rounded" />
          <div className="h-8 w-3/4 bg-black/10 rounded-lg" />
          <div className="h-24 w-full bg-black/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
