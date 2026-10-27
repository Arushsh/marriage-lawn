"use client";

import React, { useEffect, useRef } from "react";

/**
 * The zari needle — a custom cursor for fine pointers. A small pearl
 * diamond rides the pointer while a pearl thread trails behind it with
 * spring lag, as if the cursor were stitching the page. Interactive
 * elements pull the thread taut and brighten the needle. Off on touch
 * devices, under reduced motion, and when the browser can't keep up;
 * the native cursor returns in every fallback.
 */
export const ZariCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!fine || reduced || !canvas) return;

    const root = document.documentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    root.dataset.zariCursor = "on";

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pos = { x: -100, y: -100 };
    const trail: { x: number; y: number }[] = [];
    const TRAIL_LEN = 14;
    let target = { x: -100, y: -100 };
    let hovering = false;
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = target.x;
        pos.y = target.y;
      }
      const el = e.target as HTMLElement | null;
      hovering = !!el?.closest?.(
        'a, button, [role="button"], input, textarea, select, label, summary'
      );
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const onLeave = () => {
      visible = false;
    };
    document.documentElement.addEventListener("mouseleave", onLeave);

    const isLight = () => document.documentElement.dataset.theme === "light";

    const render = () => {
      raf = requestAnimationFrame(render);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (!visible) return;

      // Spring the needle toward the pointer
      const ease = hovering ? 0.32 : 0.22;
      pos.x += (target.x - pos.x) * ease;
      pos.y += (target.y - pos.y) * ease;

      trail.unshift({ x: pos.x, y: pos.y });
      if (trail.length > TRAIL_LEN) trail.pop();

      const pearl = isLight() ? "124, 106, 58" : "232, 226, 208";

      // The trailing thread
      if (trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
        for (let i = trail.length - 2; i > 0; i--) {
          const xc = (trail[i].x + trail[i - 1].x) / 2;
          const yc = (trail[i].y + trail[i - 1].y) / 2;
          ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        }
        ctx.lineTo(trail[0].x, trail[0].y);
        ctx.strokeStyle = `rgba(${pearl}, 0.4)`;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Stitch points along the thread
      for (let i = 3; i < trail.length; i += 4) {
        const fade = 1 - i / trail.length;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pearl}, ${0.25 * fade})`;
        ctx.fill();
      }

      // The needle: a pearl diamond that grows over interactive elements
      const s = hovering ? 9 : 6;
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(Math.PI / 4);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.4);
      glow.addColorStop(0, `rgba(${pearl}, 0.5)`);
      glow.addColorStop(1, `rgba(${pearl}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(-s * 2.4, -s * 2.4, s * 4.8, s * 4.8);
      ctx.beginPath();
      ctx.rect(-s / 2, -s / 2, s, s);
      ctx.fillStyle = isLight() ? "#7c6a3a" : "#f6f1e0";
      ctx.fill();
      ctx.strokeStyle = `rgba(${pearl}, 0.65)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      delete root.dataset.zariCursor;
      canvas.width = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className="zari-cursor-layer" aria-hidden="true" />;
};
