import React from "react";

export default function PackagesLoading() {
  return (
    <main className="py-16 sm:py-24 px-4 sm:px-8 animate-pulse">
      <div className="max-w-[1120px] mx-auto space-y-12">
        <div className="space-y-3">
          <div className="h-4 w-28 bg-black/10 rounded" />
          <div className="h-10 w-72 bg-black/10 rounded-lg" />
          <div className="h-5 w-full max-w-xl bg-black/10 rounded" />
        </div>

        {/* 3 Package Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-96 bg-surface rounded-2xl p-8 border border-black/5 space-y-6"
            >
              <div className="h-6 w-36 bg-black/10 rounded" />
              <div className="h-12 w-28 bg-black/10 rounded" />
              <div className="space-y-3 pt-4 border-t border-black/5">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 w-full bg-black/10 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
