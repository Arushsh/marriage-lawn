# Decision Log

One-line reason per dependency or significant architecture choice, per `docs/AGENTS.md`.

## Chunk 9 — Production revamp (Oct 2026)

- **`three` + `@types/three` (dev)** — WebGL particle-text film title in the Hero and ambient gold-dust layer, as requested in the UI revamp.
- **`lenis`** — user-requested smooth scrolling, wired into the GSAP ticker; replaces native smooth-scroll call sites.
- **GSAP ScrollTrigger + SplitText (already-installed `gsap@3.15`)** — scroll-scrubbed Hero film, 3D character reveals on section headings, pointer tilt on cards. Both plugins ship free with the public gsap package (v3.13+).
- **Django 5.1.4 → 5.2.18 LTS** — 5.1 is EOL; 5.1's test client was also broken on Python 3.15 (`copy(RequestContext)` AttributeError). 5.2 LTS fixes both; full suite passes.
- **SimpleJWT activated (`djangorestframework-simplejwt==5.3.1`, already pinned)** — owner dashboard auth. Bearer tokens chosen over session cookies deliberately: Vercel (frontend) → Render (API) is cross-origin and third-party cookies are blocked by modern browsers. Rotation + blacklist enabled (`token_blacklist` app).
- **New `apps.owner` Django app** — staff-only write endpoints for every content model + enquiries/bookings/stats. The public API stays read-only.
- **JWT in localStorage (not cookies)** for the SPA admin — matches the cross-origin constraint above; XSS risk accepted for a single-owner dashboard, standard practice for this topology.
- **Deviation from DESIGN.md/AGENTS.md motion rules** ("one subtle fade-in only, no gradients/glow") — the owner explicitly requested a WebGL/3D overhaul. Heritage palette, 0px radii, hairline borders, and typography are preserved; effects are additive and every one has a `prefers-reduced-motion` fallback.
- **`DJANGO_SUPERUSER_PASSWORD` removed from `render.yaml`** — the committed value was public in git; set a strong password in the Render dashboard instead.
- **Hero redesign (post-feedback)** — the owner wanted visibly different UI, not just motion internals: new 100vh landing hero (`WebGLHeroScene`: instanced tumbling marigold petals, gold halo ring, dust — mouse parallax; instant CTAs above the fold), the 540vh film preserved as its own `PalaceFilmSection`, and `FlipIn` 3D reveals on gallery/about/hall cards.
