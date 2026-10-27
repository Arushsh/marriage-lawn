"use client";

import React, { useEffect, useRef } from "react";
import type { BufferAttribute } from "three";

interface GoldDustLayerProps {
  /** Approximate particle count at desktop width. */
  density?: number;
  className?: string;
}

/**
 * Ambient three.js gold-dust canvas — slow-rising luminous specks for dark
 * sections (footer, hero band). Absolute layer: the parent must be
 * `relative`. Pointer-transparent, pauses off-screen, no-op under reduced
 * motion or when WebGL is unavailable.
 */
export const GoldDustLayer: React.FC<GoldDustLayerProps> = ({
  density = 140,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");
        if (disposed || !containerRef.current) return;
        const container = containerRef.current;

        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        const count = Math.round(density * (isMobile ? 0.5 : 1));

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          55,
          container.clientWidth / container.clientHeight,
          1,
          600
        );
        camera.position.z = 220;

        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 900;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 520;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 320;
          speeds[i] = 0.12 + Math.random() * 0.55;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
          color: 0xffb454,
          size: 2.6,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let visible = true;
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
          },
          { threshold: 0 }
        );
        observer.observe(container);

        const onResize = () => {
          if (!container.clientWidth || !container.clientHeight) return;
          renderer.setSize(container.clientWidth, container.clientHeight);
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        const posAttr = geometry.getAttribute("position") as BufferAttribute;
        let rafId = 0;
        const startTime = performance.now();
        const render = (now: number) => {
          rafId = requestAnimationFrame(render);
          if (!visible) return;
          const t = (now - startTime) / 1000;
          for (let i = 0; i < count; i++) {
            let y = posAttr.getY(i) + speeds[i];
            if (y > 280) y = -280;
            posAttr.setY(i, y);
            posAttr.setX(i, posAttr.getX(i) + Math.sin(t * 0.4 + i) * 0.05);
          }
          posAttr.needsUpdate = true;
          renderer.render(scene, camera);
        };
        rafId = requestAnimationFrame(render);

        cleanup = () => {
          cancelAnimationFrame(rafId);
          observer.disconnect();
          window.removeEventListener("resize", onResize);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        /* WebGL unavailable — layer stays empty */
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [density]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
    />
  );
};
