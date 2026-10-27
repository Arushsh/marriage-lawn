import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/api";
import { constructMetadata, generateEventVenueSchema } from "@/lib/seo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import dynamic from "next/dynamic";

// Deferred: not needed for initial paint
const ZariCursor = dynamic(() => import("@/components/layout/ZariCursor").then(m => ({ default: m.ZariCursor })));
const ChatbotWidget = dynamic(() => import("@/components/chatbot/ChatbotWidget").then(m => ({ default: m.ChatbotWidget })));


const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return constructMetadata(site, { path: "/" });
}

// Applies the saved theme before first paint so the night silk
// never flashes the morning workshop (or vice versa).
const themeInitScript = `
try {
  var t = localStorage.getItem("spl-theme");
  if (t === "light") document.documentElement.dataset.theme = "light";
} catch (e) {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSiteSettings();
  const jsonLd = generateEventVenueSchema(site);

  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-bg text-text antialiased">
        {/* Accessible Skip-to-content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface focus:text-text focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-rani"
        >
          Skip to main content
        </a>
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
      </body>
    </html>
  );
}
