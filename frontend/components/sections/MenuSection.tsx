"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuCategory, MenuItem } from "@/types/api";
import { Sparkles, Utensils, ChevronRight } from "lucide-react";
import { FadeUp } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";
import { getDishImage } from "@/lib/menuImages";

interface MenuSectionProps {
  categories: MenuCategory[];
}

export const MenuSection: React.FC<MenuSectionProps> = ({ categories }) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    categories.length > 0 ? categories[0].slug : ""
  );

  if (!categories || categories.length === 0) return null;

  const currentCategory =
    categories.find((c) => c.slug === selectedSlug) || categories[0];

  return (
    <section id="menu" className="py-20 sm:py-32 bg-surface border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <FadeUp>
          {/* Section Header */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.18em] block">
              Shahi Dawat • Royal Catering
            </span>
            <h2 className="font-serif text-[30px] sm:text-[42px] font-normal leading-[1.2] text-primary">
              Culinary Art for Royal Celebrations
            </h2>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.65] max-w-[62ch]">
              From charcoal-smoked tandoor appetisers to slow-simmered handi curries and artisanal halwas, our master chefs curate an authentic royal dining experience.
            </p>
          </div>
        </FadeUp>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = currentCategory.slug === cat.slug;
            return (
              <Button
                key={cat.id}
                type="button"
                size="sm"
                variant={isActive ? "primary" : "outline"}
                onClick={() => setSelectedSlug(cat.slug)}
                className={`!h-10 !min-h-[40px] !px-5 text-xs font-semibold tracking-[0.14em] uppercase cursor-pointer ${
                  isActive ? "!border-accent" : "!border-border"
                }`}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Delicacies Grid with Dish Photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {currentCategory.items.slice(0, 6).map((dish: MenuItem) => {
            const dishImg = getDishImage(dish.name, dish.image);
            return (
              <div
                key={dish.id}
                className="bg-white border border-border hover:border-accent transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col group overflow-hidden"
              >
                {/* Dish Photo Container */}
                <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-stone-100">
                  <Image
                    src={dishImg}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Certified Veg/Non-Veg icon badge on image */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-1.5 shadow-sm border border-stone-200">
                    {dish.is_veg ? (
                      <div
                        className="w-4 h-4 border-2 border-emerald-600 flex items-center justify-center p-0.5 rounded-none bg-emerald-50"
                        title="100% Pure Vegetarian"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      </div>
                    ) : (
                      <div
                        className="w-4 h-4 border-2 border-red-700 flex items-center justify-center p-0.5 rounded-none bg-red-50"
                        title="Non-Vegetarian Masterpiece"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-700" />
                      </div>
                    )}
                  </div>

                  {/* Signature Badge */}
                  {dish.is_popular && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 bg-[#6B1426] text-white text-[10px] font-semibold uppercase tracking-wider shadow-md border border-[#B8860B]/60">
                      <Sparkles className="w-3 h-3 text-[#B8860B]" />
                      <span>Signature</span>
                    </div>
                  )}

                  {/* Quick tag label */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                    <span className="text-[11px] font-mono tracking-wider uppercase bg-black/60 backdrop-blur-xs px-2 py-0.5 border border-white/20">
                      {dish.is_veg ? "Pure Vegetarian" : "Gourmet Non-Veg"}
                    </span>
                  </div>
                </div>

                {/* Dish Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2 bg-[#FFFDF9]">
                  <div>
                    <h3 className="font-serif text-lg text-primary font-medium group-hover:text-primary-dark transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-1.5">
                      {dish.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E6DFC8]/60 flex items-center justify-between text-[11px] text-accent font-medium">
                    <span>Chef&apos;s Special Preparation</span>
                    <span>✦ Royal Recipe</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Menu CTA */}
        <div className="pt-2 text-center sm:text-left">
          <Link href="/menu">
            <Button
              variant="primary"
              size="lg"
              className="h-12 px-8"
              leftIcon={<Utensils className="w-4 h-4 shrink-0" />}
              rightIcon={<ChevronRight className="w-4 h-4 shrink-0" />}
            >
              <span>Explore Full Royal Menu ({categories.reduce((s, c) => s + c.items.length, 0)} Dishes)</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
