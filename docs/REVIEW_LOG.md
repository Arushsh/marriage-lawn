# Code Review Log

Chunks reviewed via ponytail-review (Chunk 7 self-review) and Chunk 8 fixes.

## Chunk 8 — SEO, Performance, Accessibility, QA

### Fixed (Critical / Major)

| # | Location | Finding | Fix |
|---|---|---|---|
| 1 | `GalleryPageClient.tsx:L178` | Gallery thumbnails were `<div onClick>` — inaccessible to keyboard and screen readers | Replaced with `<button type="button">` + `aria-label` + focus-visible ring |
| 2 | `GallerySection.tsx:L159` | Same div→button issue in home-page inline gallery | Same fix |
| 3 | `AvailabilitySection.tsx:L173` | Next-month button had no `disabled` attribute or visual disabled state at 11-month limit | Added `disabled={isMaxMonth}` and `opacity-30 cursor-not-allowed` class |
| 4 | `AvailabilitySection.tsx:L72` | `cache` in `useEffect` deps caused effect to re-fire on every cache write | Removed `cache` from deps array, added lint-disable comment explaining rationale |
| 5 | `Navbar.tsx:L89` | Hamburger button missing `aria-expanded` and `aria-controls` | Added both; added `id="mobile-nav-menu"` to drawer |
| 6 | `package.json` | `node --test` printed `MODULE_TYPELESS_PACKAGE_JSON` on every run | Added `"type": "module"` |

### Minor / Nice-to-have (not fixed, logged here)

| # | Location | Finding | Reason deferred |
|---|---|---|---|
| M1 | `EnquiryForm.tsx:L44` | Honeypot has both `className="hidden"` and `style={{display:"none"}}` — redundant | Dead code, harmless; remove at next touch |
| M2 | `ContactSection.tsx:L40` | Google Maps embed URL built from venue name string — could fail for venues with special characters | Low risk for MVP; switch to `encodeURIComponent` everywhere if issues arise |
| M3 | `AvailabilitySection.tsx` | `new Date()` called at module init time, not render time — month boundary at midnight could show wrong "today" until ISR revalidates | Acceptable for ISR 60s; fix if live date boundary issues are reported |
| M4 | `GalleryPageClient.tsx:L61,87` | API base URL constructed inline in two places (not from `apiFetch` helper) | Refactor to share the constant at next component touch |

### Backend security review (Chunk 8 — code not changed, findings only)

> Requires backend server running for full DAST. Static review findings:

| # | Location | Finding | Risk | Recommendation |
|---|---|---|---|---|
| B1 | `config/settings.py` | `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` must be locked to production domain | High | Set both from `env()` with no wildcard in production |
| B2 | `bookings/views.py` | Enquiry POST endpoint should have DRF throttle class (e.g. `AnonRateThrottle`) | Medium | Add `throttle_classes = [AnonRateThrottle]` with `60/hour` or `10/hour` |
| B3 | `bookings/serializers.py` | Honeypot field should be validated server-side (reject if non-empty) | Medium | Add `validate_website()` method that raises `ValidationError` if filled |
| B4 | `venue/serializers.py` | Ensure no admin-only fields (private notes, internal IDs beyond pk) leak in public GET serializers | Medium | Audit `SiteSettingsSerializer` fields list |
