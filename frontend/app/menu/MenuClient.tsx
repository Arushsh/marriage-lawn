"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SiteSettings, MenuCategory, MenuItem } from "@/types/api";
import { InstantCallModal } from "@/components/voice/InstantCallModal";
import { OnlineBookingModal } from "@/components/booking/OnlineBookingModal";
import { Sparkles, Utensils, Download, PhoneCall, Calendar } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { getDishImage } from "@/lib/menuImages";

interface MenuClientProps {
  site: SiteSettings;
  categories: MenuCategory[];
}

export const MenuClient: React.FC<MenuClientProps> = ({ site, categories }) => {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // Filter categories and items
  const filteredCategories = categories
    .filter((cat) => activeCategorySlug === "all" || cat.slug === activeCategorySlug)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => (vegOnly ? item.is_veg : true)),
    }))
    .filter((cat) => cat.items.length > 0);

  const totalDishes = categories.reduce((sum, c) => sum + c.items.length, 0);

  const whatsappTastingHref = buildWhatsAppUrl(
    site.whatsapp_number,
    `Hello ${site.venue_name}, I would like to schedule a Food Tasting session for our upcoming wedding celebration.`
  );

  return (
    <div>
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 mb-10 border-b border-border">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <Button
            type="button"
            size="sm"
            variant={activeCategorySlug === "all" ? "primary" : "outline"}
            onClick={() => setActiveCategorySlug("all")}
            className={`!h-10 !px-5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
              activeCategorySlug === "all" ? "!border-accent" : "!border-border"
            }`}
          >
            All Masterpieces ({totalDishes})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              size="sm"
              variant={activeCategorySlug === cat.slug ? "primary" : "outline"}
              onClick={() => setActiveCategorySlug(cat.slug)}
              className={`!h-10 !px-5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                activeCategorySlug === cat.slug ? "!border-accent" : "!border-border"
              }`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Pure Veg Filter Switch & PDF Action */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-4 py-2 rounded-none border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              vegOnly
                ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                : "bg-white border-border text-muted hover:border-primary"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 rounded-sm ${
                vegOnly ? "border-emerald-600 bg-emerald-50" : "border-stone-400 bg-transparent"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${vegOnly ? "bg-emerald-600" : "bg-stone-400"}`} />
            </span>
            <span>Pure Veg Only</span>
          </button>

          {site.menu_pdf && (
            <a
              href={site.menu_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-border text-muted hover:text-primary hover:border-accent text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Menu</span>
            </a>
          )}
        </div>
      </div>

      {/* Menu Categories and Dishes */}
      <div className="space-y-14 mb-16">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm bg-white border border-border p-8">
            No dishes found matching your current filter. Try unchecking &quot;Pure Veg Only&quot;.
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="space-y-6">
              {/* Category Title Header */}
              <div className="border-b border-border pb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-primary font-normal tracking-wide">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-muted mt-1">{cat.description}</p>
                </div>
                <span className="text-xs text-accent font-mono font-medium">
                  {cat.items.length} delicacies
                </span>
              </div>

              {/* Dish Cards Grid with Food Photography */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {cat.items.map((item: MenuItem) => {
                  const dishImg = getDishImage(item.name, item.image);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-border hover:border-accent transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col group overflow-hidden"
                    >
                      {/* Dish Photo Container */}
                      <div className="relative w-full h-48 overflow-hidden bg-stone-100">
                        <Image
                          src={dishImg}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Certified Veg/Non-Veg icon badge */}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1.5 shadow-sm border border-stone-200">
                          {item.is_veg ? (
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

                        {/* Signature Tag */}
                        {item.is_popular && (
                          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 bg-[#6B1426] text-white text-[10px] font-semibold uppercase tracking-wider shadow-md border border-[#B8860B]/60">
                            <Sparkles className="w-3 h-3 text-[#B8860B]" />
                            <span>Signature</span>
                          </div>
                        )}

                        {/* Diet Tag */}
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                          <span className="text-[10px] font-mono tracking-wider uppercase bg-black/60 backdrop-blur-xs px-2 py-0.5 border border-white/20">
                            {item.is_veg ? "Pure Vegetarian" : "Gourmet Non-Veg"}
                          </span>
                        </div>
                      </div>

                      {/* Dish Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-2 bg-[#FFFDF9]">
                        <div>
                          <h3 className="font-serif text-lg text-primary font-medium group-hover:text-primary-dark transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-[#E6DFC8]/60 flex items-center justify-between text-[11px] text-accent font-medium">
                          <span>Handcrafted by Royal Khansamas</span>
                          <span>✦ Freshly Prepared</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Actions CTA Banner */}
      <div className="p-8 sm:p-10 bg-surface border border-accent/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            <Utensils className="w-4 h-4" />
            <span>Complimentary Tasting for Confirmed Bookings</span>
          </div>
          <h3 className="font-serif text-2xl text-primary font-normal">
            Customize Your Wedding Feast with our Executive Chef
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            All wedding packages can be tailored to your family traditions (Awadhi, Marwari, Punjabi, South Indian, or pure Jain catering counters).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsVoiceOpen(true)}
            className="w-full sm:w-auto !h-12 !px-6 !border-accent !text-primary hover:!bg-white"
          >
            <PhoneCall className="w-4 h-4 mr-2 text-accent" />
            <span>AI Voice Call: Discuss Menu</span>
          </Button>

          <a
            href={whatsappTastingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto !h-12 !px-6 !border-accent"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span>Schedule Tasting</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Modals */}
      <InstantCallModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <OnlineBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
