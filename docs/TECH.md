# Technical Design

## 1. Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | SEO via SSR/SSG, fast, familiar |
| Styling | Tailwind CSS | Quick theming via CSS variables |
| Animation | Framer Motion | Smooth, lightweight section reveals |
| Backend | Django + Django REST Framework | Your core stack, built-in admin |
| Database | PostgreSQL (Neon/Supabase/Render) | Reliable, free tiers available |
| Media | Cloudinary | Auto format/resize, CDN |
| Auth | JWT (SimpleJWT) for owner dashboard, Django admin in MVP | Simple |
| Email | Resend or SMTP (Gmail/Zoho) | Owner lead alerts |
| Forms | React Hook Form + Zod | Validation |
| Maps | Google Maps embed iframe | No API key needed for MVP |
| Hosting | Vercel (frontend), Render/Railway (backend) | Easy and cheap |
| Monitoring | Sentry (optional), UptimeRobot | Catch errors and downtime |

## 2. Architecture
```
Visitor (mobile browser)
        |
        v
Next.js on Vercel  ---- SSR/ISR pages, SEO, UI
        |  fetch (REST/JSON)
        v
Django REST API  ---- business logic, validation, auth
        |                    |
        v                    v
   PostgreSQL           Cloudinary (images)
        |
        v
Email service ---> Owner notification
```

- Public pages use **ISR** (revalidate every 60-300s) so content is fast and fresh.
- Calendar and enquiry endpoints are fetched client-side or via short revalidation.
- If the API is down, static sections still render and the form shows a WhatsApp fallback.

## 3. Multi-lawn strategy
Keep one codebase. Everything venue-specific lives in the database (`SiteSettings`, `Package`, `GalleryImage`, etc.) or in a single `site.config.ts` for theme tokens. For each new client:
1. Deploy a new backend instance (or a new tenant row if you later build multi-tenancy)
2. Set env vars and seed content
3. Point a new domain

For MVP choose **one deployment per client** (simple, isolated, easy to hand over). Move to multi-tenant only when you have 10+ clients.

## 4. Folder structure
```
frontend/
  app/
    (public)/
      page.tsx              # Home (all sections)
      gallery/page.tsx
      packages/page.tsx
      contact/page.tsx
    api/                    # optional Next route handlers (revalidate hook)
    layout.tsx
    sitemap.ts
    robots.ts
  components/
    sections/               # Hero, About, Gallery, Packages, Calendar, Reviews, FAQ, Contact
    ui/                     # Button, Card, Modal, Lightbox, Accordion, Badge
    layout/                 # Navbar, Footer, StickyActions
  lib/
    api.ts                  # typed fetch wrapper
    seo.ts                  # metadata + JSON-LD helpers
    whatsapp.ts             # message builder
  styles/globals.css
  types/
  site.config.ts            # theme + fallback content

backend/
  config/                   # settings, urls, wsgi
  apps/
    venue/                  # SiteSettings, Hall, Facility, Package, FAQ, Review
    media/                  # GalleryImage, VideoLink
    bookings/               # AvailabilityDate, Enquiry
    notifications/          # email senders
  requirements.txt
  .env.example
```

## 5. Environment variables
**Backend (.env)**
```
DJANGO_SECRET_KEY=
DEBUG=False
ALLOWED_HOSTS=
DATABASE_URL=
CORS_ALLOWED_ORIGINS=
CLOUDINARY_URL=
EMAIL_HOST=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
OWNER_NOTIFY_EMAIL=
RECAPTCHA_SECRET=          # optional
```
**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_PHONE=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=   # optional
```

## 6. Key implementation notes
**Availability calendar**
- Store only exceptions: dates marked `booked` or `tentative`. Everything else is `available`.
- API returns a month range; frontend colors cells. Past dates are disabled.
- Add a note: "Dates are indicative. Please confirm with the venue."

**Enquiry flow**
1. Client validates (React Hook Form + Zod).
2. POST `/api/enquiries/` with honeypot field and optional captcha token.
3. Backend validates, rate limits (e.g. 5 per hour per IP), saves lead.
4. Backend sends email to owner (async via thread or Celery later).
5. Frontend shows success and a "Continue on WhatsApp" button with prefilled text.

**WhatsApp link format**
```
https://wa.me/91XXXXXXXXXX?text=<url-encoded message>
Message: "Hi, I'm interested in booking {venue} on {date} for about {guests} guests."
```

**Images**
- Upload to Cloudinary, serve with `f_auto,q_auto,w_<size>`.
- Use `next/image` with remote patterns configured.
- Enforce max upload size (e.g. 5 MB) and allowed types.

**SEO**
- Per-page `generateMetadata`, canonical URLs, OG image
- `LocalBusiness` / `EventVenue` JSON-LD with address, geo, phone, opening hours, aggregate rating
- `sitemap.xml`, `robots.txt`
- Target keywords: "marriage lawn in <city>", "banquet hall <city>", "wedding venue <city>"
- Create and link the Google Business Profile to the site

**Security checklist**
- HTTPS everywhere, secure cookies, HSTS
- DRF throttling on public POST endpoints
- Validate and sanitize all input, limit message length
- CORS restricted to the frontend domain
- Admin behind strong password, change default `/admin/` path
- Never expose owner email or secrets to the client
- Regular DB backups (provider snapshots)

**Performance checklist**
- Static generation for content pages, lazy load below-fold images and video
- Use `font-display: swap`, subset fonts
- Avoid heavy libraries; dynamic import the lightbox and calendar

## 7. Testing
- Backend: pytest/Django tests for enquiry validation, throttling, calendar API
- Frontend: component tests for form and calendar (Vitest/RTL), Playwright smoke test for the enquiry flow
- Manual: test on a real low-end Android phone and slow 4G; Lighthouse after each phase

## 8. Deployment
1. Create Postgres DB and Cloudinary account
2. Deploy backend (Render/Railway): set env vars, run migrations, create superuser
3. Deploy frontend on Vercel with env vars, connect domain
4. Configure DNS, SSL, CORS
5. Seed content, test enquiry email, submit sitemap to Google Search Console
6. Add UptimeRobot monitor

## 9. Dev tooling (Antigravity)
| Tool | Use |
|---|---|
| CodeRabbit plugin (skills + code-reviewer and autofix agents) | Review gate at the end of every chunk; fix critical and major findings before commit. Log leftovers in docs/REVIEW_LOG.md |
| gemini-api plugin (skills + MCP) | Phase 2 chatbot only |
| caveman | Terse agent chat replies. Never applied to code, docs, commits or site copy |
| ponytail | Skills used when relevant; agent must name the skill it used |
| Stitch MCP | UI revamp only. Generates DESIGN.md and screens; the frontend is then updated to match |
| AGENTS.md | Rules every agent session reads first |

Per-chunk loop: plan -> build -> build/lint/test -> CodeRabbit review -> fix -> re-test -> commit.

## 10. Phase 2 technical notes
- **Dashboard:** Next.js `/dashboard` route group with JWT auth, or separate small React app
- **Payments:** Razorpay Orders API, webhook to confirm, store `Payment` records, mark date booked automatically
- **WhatsApp alerts:** WhatsApp Business Cloud API or a provider (Twilio, Gupshup)
- **Chatbot:** Django endpoint calling the Gemini API (via the gemini-api plugin skills) with venue FAQ data as context, streaming responses, rate limited, lead capture; later add a vector DB if content grows
- **i18n:** `next-intl` with `en` and `hi` message files
- **Async jobs:** Celery + Redis for emails and reminders
