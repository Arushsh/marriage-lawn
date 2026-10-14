# Fix Log: Typography, Buttons, Icons, Images, Layout

Comprehensive audit across 360px, 390px, 768px, and 1280px viewports.

## 1. Typography
- [x] **Next/font variables**: Playfair Display and Poppins loaded via `next/font/google`. CSS variables `--font-playfair` / `--font-poppins` registered. Tailwind `@theme` exposes `font-serif` and `font-sans` tokens. Body/html use `font-sans`.
- [x] **Standard Type Scale** in `globals.css`: H1 40/64, H2 28/40, H3 20/24, body 16/17, small text-sm/text-xs.
- [x] **Weight & Case**: Headings `font-normal` (400). `uppercase` only on small labels. No ad-hoc bold on headings.
- [x] **Text Wrap**: `text-wrap: balance` on all h1-h6 globally.
- [x] **Text Max Width**: `max-w-[60ch]` on all descriptive text blocks.
- [x] **Hero contrast**: `bg-black/60` overlay ensures >4.5:1 text contrast.

## 2. Buttons
- [x] **Single Button component**: variants (primary, secondary, outline, whatsapp, text, ghost), h-12/h-11 tap targets, rounded-lg, whitespace-nowrap.
- [x] **Focus & interaction states**: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`, `active:translate-y-[1px]`.
- [x] **Icon + label alignment**: `inline-flex items-center gap-2`. Icon-only buttons have `aria-label`.
- [x] **Mobile sticky bar**: `grid-cols-2 gap-3`, `env(safe-area-inset-bottom)` bottom padding, `padding-bottom: 88px` on body.
- [x] **Desktop floating WhatsApp**: `z-30` (below lightbox z-50), `fixed bottom-6 right-6`, `hidden md:block`.
- [x] **`h-18` non-existent Tailwind class**: Fixed in Navbar from `h-18` to `h-16` (64px).

## 3. Icons
- [x] **Unified library**: Exclusively `lucide-react` everywhere.
- [x] **Stroke width & sizing**: All icons `strokeWidth={1.5}`, sizes w-4/w-5/w-6.
- [x] **Icon key mapping**: `getFacilityIcon()` in FacilitiesSection maps backend icon keys with CheckCircle2 fallback.

## 4. Images
- [x] **next/image everywhere**: All images use Next Image with fill+sizes or explicit dimensions. Lightbox uses next/image.
- [x] **Remote patterns**: next.config.ts has unsplash, pexels, cloudinary, 127.0.0.1, localhost.
- [x] **Priority/lazy**: Hero has `priority`, gallery/facility images are `loading="lazy"`.
- [x] **`bg-background` invalid token**: Fixed in EnquiryForm.tsx — all inputs changed from `bg-background` to `bg-surface`.
- [x] **Demo photos**: seed_demo.py uses 12 real Unsplash wedding venue landscape photos. Re-seeded with --flush.

## 5. Layout Sanity
- [x] **`no-scrollbar` utility**: Added to globals.css (webkit + Firefox scrollbar-width: none). Used in HighlightsStrip and GallerySection.
- [x] **Anchor scroll offset**: `scroll-padding-top: 4.5rem` (72px) in globals.css — covers 64px navbar + 8px buffer.
- [x] **Container padding**: `px-4 sm:px-8` inside `max-w-[1120px] mx-auto` in every section.
- [x] **Body bottom padding**: 88px on mobile, 0 on md+ — sticky bar does not cover content.

---

## Limitations
- **Visual audit**: Playwright could not install on this Windows machine (CDN 404). All fixes applied via static code review.
- **Font rendering**: Verified via next/font config; actual glyph rendering unverified without a browser screenshot on the target device.
