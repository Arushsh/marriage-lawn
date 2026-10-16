"use client";

import React, { useEffect } from "react";
import gsap from "gsap";

export const GSAPScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Gentle luxury fade on elements tagged with .gsap-reveal
    const elements = document.querySelectorAll(".gsap-reveal");
    if (elements.length > 0) {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return <>{children}</>;
};
