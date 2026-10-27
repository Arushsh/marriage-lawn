# Build Roadmap and Task Checklist

## Workflow for every chunk (see AGENTS.md)
- [ ] Plan (5-10 lines) -> build -> build, lint, tests pass
- [ ] CodeRabbit review gate: fix critical and major findings, log the rest in docs/REVIEW_LOG.md
- [ ] Re-run build, lint, tests -> commit "Chunk N: ..."
- [ ] Test on a real phone

## Phase 0: Prep (Day 1)
- [ ] Create repo with `frontend/`, `backend/`, `docs/`
- [ ] Copy these docs into `docs/`
- [ ] Pick a name and domain idea for the demo lawn (fictional or a real prospect with permission)
- [ ] Collect 12-15 demo photos (royalty-free or the prospect's public photos, with permission)
- [ ] Set up Cloudinary, Neon/Supabase Postgres, Vercel, Render accounts
- [ ] Set up Figma or quick Tailwind style guide from UI.md

## Phase 1: Backend (Day 2-3)
- [ ] Django project, apps: `venue`, `media`, `bookings`, `notifications`
- [ ] Models from DATABASE.md and migrations
- [ ] Django admin registered with list filters, search, ordering, CSV export for leads
- [ ] Jazzmin theme for the admin
- [ ] Serializers and public GET endpoints
- [ ] `/availability/` endpoint with range validation
- [ ] `POST /enquiries/` with validation, honeypot, throttling
- [ ] Email notification on new enquiry
- [ ] `seed_demo` management command
- [ ] CORS, env config, `.env.example`
- [ ] Tests for enquiry and availability

## Phase 2: Frontend (Day 3-5)
- [ ] Next.js + TypeScript + Tailwind + Framer Motion setup, theme tokens
- [ ] Typed API client in `lib/api.ts`
- [ ] Navbar, Footer, Sticky action bar, WhatsApp float button
- [ ] Hero + highlights strip
- [ ] About + facilities + halls
- [ ] Gallery with tabs and lightbox
- [ ] Packages section
- [ ] Availability calendar (month view, color legend, date click opens form)
- [ ] Enquiry form with validation, success state, WhatsApp continue button
- [ ] Reviews carousel and FAQ accordion
- [ ] Contact section with map and directions
- [ ] `/thank-you` and `/privacy` pages
- [ ] Loading and error states, fallback WhatsApp if API fails

## Phase 2.5: Services, menu, packages upgrade and 360 tour (Chunks 8-9)
- [ ] Backend: Service, MenuCategory, MenuItem models; Package price_unit, guest range, grouped inclusions; Enquiry package FK and extra event types; admin, seed data, endpoints, tests
- [ ] Frontend: Services section and /services, Menu section and /menu, package details drawer, package and event prefill in the enquiry form
- [ ] Backend: TourScene, TourHotspot, /tour/ endpoint, admin with inline hotspots, seed with 2-3 free 360 sample images
- [ ] Frontend: 360 viewer (Photo Sphere Viewer), scene chips, hotspots, lazy loading, fallback, /tour page
- [ ] Update navbar and home section order (see REFERENCES.md)
- [ ] Phase 2 later: interactive 3D layout planner (F-29)

## Phase 3: SEO, polish, QA (Chunk 10, Day 6)
- [ ] Metadata, OG image, sitemap, robots
- [ ] LocalBusiness/EventVenue JSON-LD
- [ ] Image optimization and lazy loading audit
- [ ] Lighthouse 90+ on mobile (performance, accessibility, SEO)
- [ ] Test on real Android phone and slow network
- [ ] Accessibility pass (focus, contrast, alt text)
- [ ] Test form spam protection and rate limit

## Phase 3.5: UI revamp with Stitch (after the MVP works, before deploy)
- [x] Generate 2-3 design directions in Stitch for the home page (mobile first), pick one
- [x] Use Stitch MCP + design-md skill to produce DESIGN.md in the repo root (colors, type, spacing, components)
- [x] Update Tailwind tokens and shared components (Button, Card, Navbar, Footer) to match DESIGN.md
- [x] Rebuild sections one at a time against the Stitch screens; keep all data wiring and tests intact (Chunk 9: Lenis + GSAP ScrollTrigger/SplitText + Three.js WebGL hero — see docs/DECISIONS.md for the motion-rule deviation)
- [x] Re-run Lighthouse, accessibility checks and the CodeRabbit gate (build + tests green; Lighthouse re-run pending live deploy)
- [ ] Side-by-side phone check against the Stitch screens

## Chunk 9: Owner dashboard + production polish (Oct 2026)
- [x] JWT auth endpoints (`/auth/login|refresh|me/`) with staff gate + login throttle
- [x] Owner write API for all content models + enquiries/bookings/stats (`apps.owner`)
- [x] `/admin` dashboard on the website: overview, settings, availability calendar, gallery, menu, packages, leads, bookings, content
- [x] Cookie consent banner + `/cookies` + `/terms` + expanded `/privacy`
- [x] SEO: sitemap, robots (`/admin` disallowed), metadataBase from env, error page de-hardcoded
- [x] Security: superuser password removed from render.yaml; Django 5.2 LTS upgrade

## Phase 4: Deploy and demo (Day 7)
- [ ] Deploy backend, run migrations, create superuser
- [ ] Deploy frontend with env vars, connect domain
- [ ] Seed realistic demo content
- [ ] Verify enquiry email arrives
- [ ] Record a 60-90 second screen demo video (mobile view)
- [ ] Add the demo to your portfolio as a case study

## Phase 5: Sell (Day 8+)
- [ ] List 50 lawns/banquets from Google Maps in a sheet (name, phone, rating, gap, status)
- [ ] Make a personalized demo for the top 10 (swap name, photos, colors)
- [ ] Send the pitch by WhatsApp + email, then visit in person
- [ ] Follow up after 3 days
- [ ] On the first sale: collect 50% advance, get content, launch in 3-5 days
- [ ] Ask for testimonial and referral

## Phase 6: After first client (priority by what they ask for)
- [ ] Custom owner dashboard
- [ ] Hindi/English toggle
- [ ] Razorpay advance payment
- [ ] WhatsApp Business API alerts
- [ ] AI FAQ chatbot
- [ ] 360 virtual tour
- [ ] Analytics (Plausible/GA4) and monthly report to owner
- [ ] Maintenance plan upsell

## Definition of done (MVP)
- All Must items in PRD F-01 to F-16 work on mobile and desktop
- Enquiry saved and owner emailed within a minute
- Calendar updates after owner changes a date in admin
- Lighthouse mobile scores 90+ for Performance and SEO
- New lawn can be configured via admin only (no code change)

## Risks to watch
- Slow images: compress before upload, use Cloudinary transforms
- Scope creep: do not start Phase 2 features before MVP is demoed
- Waiting on content: use placeholder photos but never publish them for a real client
