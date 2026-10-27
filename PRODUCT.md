# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Families and couples in and around Prayagraj, Uttar Pradesh, planning weddings, receptions, and large social celebrations (up to 1,500 guests). They browse on phones, compare venues on capacity, price, food, and look, check date availability, then convert via phone call or WhatsApp — booking is conversation-first, not checkout-first. A secondary audience is the venue owner/staff, who manage content and bookings through a separate admin dashboard (explicitly out of scope for the 2026 redesign).

## Product Purpose

Marketing and lead-generation site for Shree Palace Lawn, a luxury marriage lawn and AC banquet venue in Civil Lines, Prayagraj. Success means enquiries and confirmed bookings: site visits convert into phone calls, WhatsApp chats, booking-modal submissions, and enquiry forms.

## Positioning

Prayagraj's premier large-capacity luxury wedding estate: expansive open lawn plus air-conditioned banquet hall on one property, with in-house royal catering, 20 years of experience, and 520+ weddings hosted. Neighboring lawns cannot truthfully claim the same scale + indoor/outdoor combination + hospitality track record.

## Operating Context

- Next.js 16 / React 19 / Tailwind 4 frontend; Django REST backend under `backend/` serving `/api` (site settings, halls, facilities, packages, gallery, videos, reviews, FAQs, menu, availability, bookings, chatbot, voice calling). ISR revalidate 60s; Cloudinary for media.
- Indian wedding market conventions: WhatsApp-first contact, direct phone CTAs, festive-season date scarcity, per-plate and package pricing, mandap/catering/decor vocabulary.
- Demo data via `seed_demo` management command; `.env`-driven API base URL.

## Capabilities and Constraints

- All public content flows from the Django API with `fallbackSiteSettings` (site.config.ts) as offline fallback; the UI must render gracefully when the API is down.
- Venue facts that must not be fabricated: name "Shree Palace Lawn", tagline "Where Grand Weddings Become Timeless Memories", address Civil Lines near High Court, Prayagraj; rating 4.8 (142 reviews); 520 weddings, 1,200 events, 20 years; capacity up to 1,500 guests. Numbers shown beyond these must come from API data or be visibly demo content.
- Real venue photography ships in `frontend/public/` (palace exterior, lawn, mandap, banquet hall, colonnade, wedding shots).
- Public pages: home (hero, highlights, film, about, gallery, facilities, 360° tour, packages, menu, availability calendar, how-it-works, reviews, FAQ, contact, final CTA), /book, /gallery, /packages, /menu, /contact, /thank-you, legal pages.
- Admin dashboard (`/admin/*`) is functionally complete and OUT OF SCOPE for visual redesign — do not restyle it in the new world.

## Brand Commitments

- Venue name and tagline are fixed (see above). Voice: stately, warm, grand — never slangy, never gamified.
- 2026-10-27 redesign decisions (user-confirmed, binding):
  - Full visual replacement of the "Royal Heritage Editorial" world (ivory/maroon/gold, sharp-cornered, anti-glass). The old DESIGN.md is retired evidence, not authority.
  - New palette, delegated to the designer: depart entirely from maroon/gold.
  - Dark theme is the default; a light theme must exist behind a visible toggle.
  - Signature techniques required: 3D effects and 3D objects (WebGL/scene-based), glassmorphism surfaces, smooth (inertial) scrolling, scroll-reveal animations, timeline treatment, custom cursor effect, button animations, dark/light switching.
  - Motion level: "cinematic but usable" — rich but never blocking reading or booking; respect prefers-reduced-motion.

## Evidence on Hand

- `frontend/site.config.ts`: full fallback site settings (facts above).
- `frontend/public/`: 10+ real venue photos (JPEG).
- `backend/apps/venue/management/commands/seed_demo.py`: demo halls, packages, menu, reviews, FAQs.
- No real customer testimonials beyond API/seed data; no press coverage. Do not invent commercial claims (prices beyond seeded data, awards, celebrity events).

## Product Principles

1. Conversion survives the spectacle: every scroll-stopping moment keeps a phone/WhatsApp/booking action one tap away.
2. Grandeur through depth and light, not ornament: 3D and glass carry the luxury; content stays legible.
3. Mobile is the primary stage: the cinematic experience must degrade gracefully to mid-range phones.
4. Truth sells: show real capacity, real seeded packages, real photos; label demo data.
5. Performance and accessibility are craft: reduced-motion support, no jank on scroll, usable contrast in both themes.
