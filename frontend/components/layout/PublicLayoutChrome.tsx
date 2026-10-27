"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SiteSettings } from "@/types/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import dynamic from "next/dynamic";

const ZariCursor = dynamic(() =>
  import("@/components/layout/ZariCursor").then((m) => ({ default: m.ZariCursor }))
);
const ChatbotWidget = dynamic(() =>
  import("@/components/chatbot/ChatbotWidget").then((m) => ({ default: m.ChatbotWidget }))
);

export function PublicLayoutChrome({
  site,
  children,
}: {
  site: SiteSettings;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // In admin dashboard: strictly isolate from public site chrome
  if (isAdmin) {
    return (
      <div className="admin-root min-h-screen w-full bg-stone-50 text-stone-900 font-sans">
        {children}
      </div>
    );
  }

  // Public visitor layout
  return (
    <>
      <ZariCursor />
      <Navbar site={site} />
      <main id="main-content" className="flex-1 w-full">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </main>
      <Footer site={site} />
      <StickyActionBar site={site} />
      <FloatingWhatsApp site={site} />
      <ThemeToggle />
      <ChatbotWidget site={site} />
      <CookieConsent />
    </>
  );
}
