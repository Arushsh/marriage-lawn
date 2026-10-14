# Project Progress

## Status: Chunk 8 complete — SEO / Performance / Accessibility / QA

---

## What is done

### Frontend (Phase 2 + 3 complete)

| Section | Status |
|---|---|
| Navbar, Footer, StickyActionBar, FloatingWhatsApp | ✅ |
| Hero (image or video, priority load, sizes) | ✅ |
| Highlights strip, About, Facilities/Halls | ✅ |
| Gallery with category tabs, lightbox, load-more pagination | ✅ |
| Packages section + dedicated /packages page | ✅ |
| Availability calendar (IST-safe dates, month cache, swipe) | ✅ |
| Enquiry form (Zod + RHF, honeypot, rate-limit handling, WhatsApp fallback) | ✅ |
| Reviews carousel, FAQ accordion | ✅ |
| Contact section (lazy-load map, enquiry form) | ✅ |
| /thank-you (noIndex), /privacy, /gallery, /packages, /contact pages | ✅ |
| Loading skeletons on every page | ✅ |
| Error boundary | ✅ |

### SEO (Phase 3)

| Item | Status |
|---|---|
| `generateMetadata` on every page (unique title + description + canonical) | ✅ |
| OG + Twitter tags with hero image | ✅ |
| JSON-LD: EventVenue schema on root layout | ✅ |
| JSON-LD: FAQPage schema on home page | ✅ |
| `app/sitemap.ts` (5 pages, /thank-you excluded) | ✅ |
| `app/robots.ts` (disallow /thank-you, /api/) | ✅ |
| `app/manifest.ts` (PWA web manifest) | ✅ |
| One H1 per page, correct heading order | ✅ |
| `html lang="en"` | ✅ |
| Canonical URLs from NEXT_PUBLIC_SITE_URL | ✅ |
| /thank-you noIndex | ✅ |

### Performance

| Item | Status |
|---|---|
| Hero image: `priority`, explicit `sizes="100vw"` | ✅ |
| All other images: `loading="lazy"`, explicit `sizes` | ✅ |
| Lightbox: dynamic import (`ssr: false`) | ✅ |
| Map iframe: IntersectionObserver lazy load | ✅ |
| Video embed: click-to-load facade (no iframe until click) | ✅ |
| Google Fonts: only 400 + 500 weights, `display: swap` | ✅ |
| ISR revalidate 60–300s on all API fetches | ✅ |

### Accessibility

| Item | Status |
|---|---|
| Skip-to-content link | ✅ |
| Alt text on all images | ✅ |
| `aria-label` on all icon-only buttons | ✅ |
| Visible focus rings (`:focus-visible`) | ✅ |
| `prefers-reduced-motion` in CSS | ✅ |
| FadeUp: respects `useReducedMotion` | ✅ |
| Form: labels linked, errors via `aria-describedby`, `aria-invalid` | ✅ |
| Tel input: `inputMode="numeric"` | ✅ |
| FAQ accordion: `aria-expanded`, `aria-controls`, keyboard | ✅ |
| Lightbox: Escape closes, arrow-key nav, touch swipe | ✅ |
| Gallery thumbnails: `<button>` + `aria-label` + focus ring | ✅ (Chunk 8 fix) |
| Navbar hamburger: `aria-expanded`, `aria-controls` | ✅ (Chunk 8 fix) |
| Calendar next-month: `disabled` at 11-month boundary | ✅ (Chunk 8 fix) |

### Security

| Item | Status |
|---|---|
| X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options | ✅ (`next.config.ts`) |
| Only NEXT_PUBLIC_* vars reach client | ✅ |
| API down: fallback renders and WhatsApp button stay visible | ✅ |
| Honeypot field on enquiry form | ✅ |

---

## What is left

| Item | Phase |
|---|---|
| Backend throttle on POST /enquiries/ | Phase 1 backend |
| Server-side honeypot validation | Phase 1 backend |
| Lock ALLOWED_HOSTS / CORS to production domain | Phase 4 deploy |
| Seed realistic demo data | Phase 4 |
| Deploy backend (Render/Railway) + frontend (Vercel) | Phase 4 |
| Domain connection + env var wiring | Phase 4 |
| Test enquiry email delivery | Phase 4 |
| Lighthouse CI run against live deployment | Phase 4 |
| UI revamp with Stitch MCP | Phase 3.5 |
| AI FAQ chatbot (Gemini API) | Phase 6 |

---

## Lighthouse targets (mobile, to verify after live deploy)

Run on the live Vercel URL against a running backend. Expected scores with ISR + CDN:

| Page | Performance | Accessibility | SEO | Best Practices |
|---|---|---|---|---|
| `/` | 90+ | 95+ | 95+ | 90+ |
| `/gallery` | 90+ | 95+ | 95+ | 90+ |
| `/packages` | 92+ | 95+ | 97+ | 90+ |
| `/contact` | 91+ | 95+ | 95+ | 90+ |

> **Cannot run Lighthouse against localhost without backend.** Re-run once Vercel + Render are live (Phase 4).

---

## How to run both servers locally

### Backend (Django)

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DJANGO_SECRET_KEY, DATABASE_URL (Neon/local Postgres)
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo    # seeds demo data
python manage.py runserver    # http://127.0.0.1:8000
```

Admin panel: http://127.0.0.1:8000/private-admin/  
API base:    http://127.0.0.1:8000/api/v1/

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local (see table below)
npm run dev    # http://localhost:3000
```

---

## All environment variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Django API base URL | `https://api.yoursite.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL (no trailing slash) | `https://yoursite.com` |

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `DJANGO_SECRET_KEY` | Yes | Django secret key | `django-insecure-...` |
| `DEBUG` | Yes | Set `False` in production | `True` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `ALLOWED_HOSTS` | Yes | Comma-separated hostnames | `api.yoursite.com,localhost` |
| `CORS_ALLOWED_ORIGINS` | Yes | Frontend origins | `https://yoursite.com` |
| `DEFAULT_FROM_EMAIL` | Yes | Sender address for notifications | `noreply@yoursite.com` |
| `ADMIN_EMAIL` | Yes | Owner notification recipient | `owner@venue.com` |
| `EMAIL_HOST` | Yes | SMTP host | `smtp.gmail.com` |
| `EMAIL_HOST_USER` | Yes | SMTP username | `your@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Yes | SMTP password / app password | `xxxx xxxx xxxx xxxx` |
| `CLOUDINARY_CLOUD_NAME` | For media | Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | For media | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | For media | Cloudinary API secret | `abc123...` |
