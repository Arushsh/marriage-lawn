"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Night ↔ morning switch. Dark is the default scene (the silk at night);
 * light is the morning workshop. Choice persists in localStorage and is
 * applied pre-paint by the inline script in layout.tsx.
 */
export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem("spl-theme", next);
    } catch {
      /* private mode — session-only theme */
    }
  };

  // Render a stable ghost until mounted so SSR and client agree.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Morning workshop (light)" : "Night silk (dark)"}
      className="fixed bottom-6 left-6 z-40 hidden md:flex h-12 w-12 items-center justify-center gota-glass rounded-full text-zari hover:text-zari-bright transition-colors cursor-pointer"
    >
      {mounted && theme === "light" ? (
        <Moon className="w-5 h-5" strokeWidth={1.5} />
      ) : (
        <Sun className="w-5 h-5" strokeWidth={1.5} />
      )}
    </button>
  );
};
