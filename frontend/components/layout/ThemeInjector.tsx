import React from "react";
import { SiteSettings } from "@/types/api";

interface ThemeInjectorProps {
  site: Partial<SiteSettings>;
}

export const ThemeInjector: React.FC<ThemeInjectorProps> = ({ site }) => {
  const primary = site.primary_color;
  const accent = site.accent_color;

  if (!primary && !accent) return null;

  return (
    <style
      id="dynamic-venue-theme"
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${primary ? `--color-primary: ${primary};` : ""}
            ${primary ? `--color-primary-dark: ${adjustColorBrightness(primary, -20)};` : ""}
            ${accent ? `--color-accent: ${accent};` : ""}
          }
        `,
      }}
    />
  );
};

function adjustColorBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return hex;
  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
