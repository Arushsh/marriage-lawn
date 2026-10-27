"use client";

import React, { useEffect, useRef } from "react";

/**
 * WebGL particle text for the Hero intro — the venue film title ("MAHAL")
 * rendered as drifting gold particles that react to the pointer and dissolve
 * as the film scroll begins.
 *
 * Loads three.js dynamically (client-only, lazy chunk). Renders nothing to
 * the DOM tree except the canvas; when reduced motion is requested, WebGL is
 * unavailable, or init fails, the component stays invisible and the Hero's
 * static DOM title remains the visible fallback.
 */

export interface WebGLHeroTextHandle {
  /** 0 = formed title, 1 = fully dissolved (drives the scroll dissolve). */
  setDissolve: (value: number) => void;
}

interface WebGLHeroTextProps {
  text: string;
  onReady?: () => void;
}

const COLOR_A = 0xfdc34d; // light antique gold
const COLOR_B = 0x7b5800; // deep bronze

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uDissolve;
  uniform float uForm;
  uniform float uSize;
  uniform vec2 uMouse;
  attribute vec4 aRandom;
  varying float vAlpha;

  void main() {
    vec3 pos = mix(
      position + vec3(
        (aRandom.x - 0.5) * 900.0,
        (aRandom.y - 0.5) * 500.0,
        (aRandom.z - 0.5) * 700.0
      ),
      position,
      uForm
    );

    // Idle golden drift
    pos.x += sin(uTime * 0.55 * aRandom.w + aRandom.z * 6.2831) * 4.5;
    pos.y += cos(uTime * 0.45 * aRandom.w + aRandom.z * 4.7) * 4.5;

    // Pointer repulsion
    vec2 toMouse = pos.xy - uMouse;
    float dist = length(toMouse);
    float force = smoothstep(130.0, 0.0, dist);
    pos.xy += normalize(toMouse + vec2(0.0001)) * force * 42.0;

    // Scroll dissolve: particles lift and scatter away
    float t = uDissolve * (0.55 + 0.9 * aRandom.x);
    pos.y += t * 460.0 * (0.4 + aRandom.y);
    pos.x += (aRandom.x - 0.5) * t * 260.0;
    pos.z += (aRandom.z - 0.5) * t * 320.0;

    vAlpha = 1.0 - smoothstep(0.3, 1.0, uDissolve * (0.5 + aRandom.y * 0.95));
    gl_PointSize = uSize * (0.55 + aRandom.w * 0.9) * (1.0 - uDissolve * 0.35);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float disc = smoothstep(0.5, 0.12, d);
    if (disc * vAlpha < 0.02) discard;
    vec3 color = mix(uColorA, uColorB, min(1.0, d * 2.2));
    gl_FragColor = vec4(color, disc * vAlpha);
  }
`;

export const WebGLHeroText = React.forwardRef<WebGLHeroTextHandle, WebGLHeroTextProps>(
  function WebGLHeroText({ text, onReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dissolveRef = useRef(0);
    const visibleRef = useRef(true);
    const readyRef = useRef(false);

    // Imperative handle: parent drives dissolve from its scroll ticker.
    React.useImperativeHandle(ref, () => ({
      setDissolve: (value: number) => {
        dissolveRef.current = Math.min(1, Math.max(0, value));
      },
    }));

    useEffect(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let disposed = false;
      let cleanupFns: Array<() => void> = [];

      (async () => {
        try {
          const THREE = await import("three");
          if (disposed || !containerRef.current) return;

          const container = containerRef.current;
          const isMobile = window.matchMedia("(max-width: 768px)").matches;
          const step = isMobile ? 5 : 4;

          // Wait for the serif webfont so particles sample the real glyphs
          try {
            await document.fonts.load('500 100px "Playfair Display"');
            await document.fonts.ready;
          } catch {
            /* fall back to system serif */
          }
          if (disposed) return;

          let width = container.clientWidth;
          let height = container.clientHeight;
          if (width === 0 || height === 0) return;

          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
          renderer.setSize(width, height);
          renderer.domElement.style.width = "100%";
          renderer.domElement.style.height = "100%";
          container.appendChild(renderer.domElement);

          const scene = new THREE.Scene();
          const camera = new THREE.OrthographicCamera(
            -width / 2, width / 2, height / 2, -height / 2, -1200, 1200
          );
          camera.position.z = 10;

          // ── Sample the text into particle targets ──────────────────────
          const sampleCanvas = document.createElement("canvas");
          sampleCanvas.width = width;
          sampleCanvas.height = height;
          const sctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
          if (!sctx) throw new Error("2D context unavailable");

          const drawTitle = () => {
            sctx!.clearRect(0, 0, width, height);
            const fontSize = Math.min(width * 0.155, height * 0.3, 230);
            sctx!.font = `500 ${fontSize}px "Playfair Display", Georgia, serif`;
            sctx!.fillStyle = "#ffffff";
            sctx!.textAlign = "center";
            sctx!.textBaseline = "middle";
            const chars = [...text];
            const spacing = fontSize * 0.38;
            const widths = chars.map((ch) => sctx!.measureText(ch).width);
            const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
            let x = width / 2 - total / 2;
            chars.forEach((ch, i) => {
              sctx!.fillText(ch, x + widths[i] / 2, height / 2);
              x += widths[i] + spacing;
            });
          };

          const buildGeometry = () => {
            drawTitle();
            const image = sctx!.getImageData(0, 0, width, height).data;
            const targets: number[] = [];
            for (let y = 0; y < height; y += step) {
              for (let x = 0; x < width; x += step) {
                if (image[(y * width + x) * 4 + 3] > 128) {
                  targets.push(
                    x - width / 2,
                    height / 2 - y,
                    (Math.random() - 0.5) * 24
                  );
                }
              }
            }
            const count = targets.length / 3;
            const positions = new Float32Array(targets);
            const randoms = new Float32Array(count * 4);
            for (let i = 0; i < count; i++) {
              randoms[i * 4] = Math.random();
              randoms[i * 4 + 1] = Math.random();
              randoms[i * 4 + 2] = Math.random();
              randoms[i * 4 + 3] = 0.4 + Math.random() * 0.6;
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 4));
            return geometry;
          };

          let geometry = buildGeometry();
          const material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
              uTime: { value: 0 },
              uDissolve: { value: 0 },
              uForm: { value: 0 },
              uSize: { value: (isMobile ? 2.9 : 2.3) * renderer.getPixelRatio() },
              uMouse: { value: new THREE.Vector2(99999, 99999) },
              uColorA: { value: new THREE.Color(COLOR_A) },
              uColorB: { value: new THREE.Color(COLOR_B) },
            },
          });
          const points = new THREE.Points(geometry, material);
          scene.add(points);

          // ── Interaction + lifecycle ─────────────────────────────────────
          const onMouseMove = (event: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            material.uniforms.uMouse.value.set(
              event.clientX - rect.left - width / 2,
              -(event.clientY - rect.top - height / 2)
            );
          };
          const onMouseLeave = () => {
            material.uniforms.uMouse.value.set(99999, 99999);
          };
          window.addEventListener("mousemove", onMouseMove, { passive: true });
          container.addEventListener("mouseleave", onMouseLeave);

          let resizeTimer: ReturnType<typeof setTimeout> | null = null;
          const onResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
              width = container.clientWidth;
              height = container.clientHeight;
              if (width === 0 || height === 0) return;
              renderer.setSize(width, height);
              camera.left = -width / 2;
              camera.right = width / 2;
              camera.top = height / 2;
              camera.bottom = -height / 2;
              camera.updateProjectionMatrix();
              const old = geometry;
              geometry = buildGeometry();
              points.geometry = geometry;
              old.dispose();
            }, 200);
          };
          window.addEventListener("resize", onResize);

          const observer = new IntersectionObserver(
            ([entry]) => {
              visibleRef.current = entry.isIntersecting;
            },
            { threshold: 0 }
          );
          observer.observe(container);

          const startTime = performance.now();
          let rafId = 0;
          const render = (now: number) => {
            rafId = requestAnimationFrame(render);
            if (!visibleRef.current) return;
            const elapsed = (now - startTime) / 1000;
            // Converge over ~2.2s with ease-out
            const formTarget = Math.min(1, elapsed / 2.2);
            material.uniforms.uForm.value +=
              (formTarget - material.uniforms.uForm.value) * 0.055;
            material.uniforms.uTime.value = elapsed;
            material.uniforms.uDissolve.value +=
              (dissolveRef.current - material.uniforms.uDissolve.value) * 0.14;
            renderer.render(scene, camera);
          };
          rafId = requestAnimationFrame(render);

          readyRef.current = true;
          onReady?.();

          cleanupFns = [
            () => {
              cancelAnimationFrame(rafId);
              observer.disconnect();
              window.removeEventListener("mousemove", onMouseMove);
              container.removeEventListener("mouseleave", onMouseLeave);
              window.removeEventListener("resize", onResize);
              if (resizeTimer) clearTimeout(resizeTimer);
              geometry.dispose();
              material.dispose();
              renderer.dispose();
              renderer.domElement.remove();
            },
          ];
        } catch {
          // WebGL unavailable — the static DOM title remains the fallback.
        }
      })();

      return () => {
        disposed = true;
        cleanupFns.forEach((fn) => fn());
      };
    }, [text, onReady]);

    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className="absolute inset-0 z-[15] pointer-events-none"
      />
    );
  }
);
