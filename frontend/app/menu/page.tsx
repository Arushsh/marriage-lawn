import React from "react";
import { getMenu, getSiteSettings } from "@/lib/api";
import { MenuClient } from "./MenuClient";

export const revalidate = 60;

export const metadata = {
  title: "Royal Wedding Catering Menu | Shree Palace Lawn",
  description:
    "Explore our royal Awadhi, Mughlai, and North Indian wedding banquet menu. From live tandoor starters and slow-simmered handi curries to palatial desserts.",
};

export default async function MenuPage() {
  const [site, categories] = await Promise.all([
    getSiteSettings(),
    getMenu(),
  ]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-accent/60 bg-surface text-accent text-xs uppercase font-semibold tracking-widest mb-4">
            <span>Royal Shahi Dawat</span>
            <span>◆</span>
            <span>Award-Winning Master Chefs</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-primary tracking-tight">
            The Royal Banquet Menu
          </h1>
          <p className="mt-4 text-muted text-sm sm:text-base leading-relaxed">
            Every dish is an artisanal creation inspired by royal banquet traditions, prepared with pure cold-pressed desi ghee, aged saffron, and aromatic spices.
          </p>
        </div>

        {/* Client Interactive Menu */}
        <MenuClient site={site} categories={categories} />
      </div>
    </div>
  );
}
