"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuCategory, MenuItem } from "@/types/api";
import { Sparkles, Utensils, ChevronRight } from "lucide-react";
import { FadeUp } from "@/components/ui/FadeUp";
import { Button } from "@/components/ui/Button";
import { getDishImage } from "@/lib/menuImages";
import { AnimatedHeading } from "@/components/animations/AnimatedHeading";

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
    <section id="menu" className="relative py-20 sm:py-32 passage-diya overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        <FadeUp>
          <div className="space-y-4 max-w-2xl">
            <AnimatedHeading
              as="h2"
              className="font-serif text-[30px] sm:text-[44px] leading-[1.12] text-ink"
            >
              Culinary Art for Royal Celebrations
            </AnimatedHeading>
            <p className="text-[15px] sm:text-[17px] text-muted leading-[1.7] max-w-[62ch]">
              From charcoal-smoked tandoor appetisers to slow-simmered handi curries and
              artisanal halwas, our master chefs curate an authentic royal dining experience.
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
                className={`!h-10 !min-h-[40px] !px-5 !rounded-full text-xs font-semibold tracking-[0.14em] uppercase cursor-pointer shrink-0 ${
                  isActive ? "" : "!border-border"
                }`}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Delicacies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {currentCategory.items.slice(0, 6).map((dish: MenuItem) => {
            const dishImg = getDishImage(dish.name, dish.image);
            return (
              <div
                key={dish.id}
                className="silk-panel rounded-2xl overflow-hidden flex flex-col group royal-card-hover"
              >
                {/* Dish Photo */}
                <div className="relative w-full h-48 sm:h-52 overflow-hidden">
                  <Image
                    src={dishImg}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04101a]/70 via-transparent to-[#04101a]/20" />

                  {/* Certified Veg/Non-Veg mark (regulatory colors) */}
                  <div className="absolute top-3 left-3 gota-glass rounded-md p-1.5">
                    {dish.is_veg ? (
                      <div
                        className="w-4 h-4 border-2 border-emerald-500 flex items-center justify-center p-0.5 rounded-sm bg-emerald-950/40"
                        title="100% Pure Vegetarian"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    ) : (
                      <div
                        className="w-4 h-4 border-2 border-red-500 flex items-center justify-center p-0.5 rounded-sm bg-red-950/40"
                        title="Non-Vegetarian Masterpiece"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                      </div>
                    )}
                  </div>

                  {/* Signature Badge */}
                  {dish.is_popular && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 gota-glass rounded-md text-[10px] font-semibold uppercase tracking-wider text-zari-bright">
                      <Sparkles className="w-3 h-3 text-diya" />
                      <span>Signature</span>
                    </div>
                  )}

                  {/* Quick tag */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span className="text-[11px] tracking-wider uppercase gota-glass px-2 py-1 rounded-md text-[#eaf2f0]">
                      {dish.is_veg ? "Pure Vegetarian" : "Gourmet Non-Veg"}
                    </span>
                  </div>
                </div>

                {/* Dish Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-serif text-lg text-ink group-hover:text-zari-bright transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-1.5">
                      {dish.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-teal font-medium">
                    <span>Chef&apos;s Special Preparation</span>
                    <span className="text-zari" aria-hidden="true">✦</span>
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
