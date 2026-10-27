import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/api";
import { constructMetadata, generateEventVenueSchema } from "@/lib/seo";
import { PublicLayoutChrome } from "@/components/layout/PublicLayoutChrome";


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
        <PublicLayoutChrome site={site}>{children}</PublicLayoutChrome>
      </body>
    </html>
  );
}
