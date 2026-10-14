import React from "react";

export default function ContactLoading() {
  return (
    <main className="py-20 sm:py-32 bg-[#FFFBF4] px-4 sm:px-8 animate-pulse">
      <div className="max-w-[1120px] mx-auto space-y-12">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-black/10 rounded-lg" />
          <div className="h-5 w-full max-w-lg bg-black/10 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="h-28 bg-surface rounded-xl border border-black/5" />
            <div className="h-60 bg-surface rounded-xl border border-black/5" />
          </div>
          <div className="lg:col-span-7">
            <div className="h-96 bg-surface rounded-2xl border border-black/5" />
          </div>
        </div>
      </div>
    </main>
  );
}
