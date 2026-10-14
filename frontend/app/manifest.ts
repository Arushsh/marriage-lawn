import { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/api";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteSettings();

  return {
    name: `${site.venue_name} - Marriage Lawn`,
    short_name: site.venue_name.slice(0, 12),
    description: site.tagline || `Marriage lawn and event banquet in ${site.city}`,
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8EE",
    theme_color: "#7B1E3A",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
