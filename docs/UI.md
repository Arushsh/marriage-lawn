# UI / UX Design Guide

## 1. Design principles
1. **Mobile first.** Design at 360px, then scale up.
2. **Photos do the selling.** Large, high-quality imagery with minimal text.
3. **One goal per screen:** get the visitor to tap WhatsApp, call, or submit an enquiry.
4. **Warm, premium, trustworthy.** Indian wedding feel without clutter.
5. **Fast and simple.** No heavy effects that slow low-end phones.

## 2. Brand tokens (defaults, overridable per lawn)
```css
:root {
  --color-primary:   #7B1E3A;  /* deep maroon */
  --color-primary-dark: #5A1229;
  --color-accent:    #C9A227;  /* gold */
  --color-bg:        #FFF8EE;  /* warm ivory */
  --color-surface:   #FFFFFF;
  --color-text:      #2B2B2B;
  --color-muted:     #6B6B6B;
  --color-success:   #2E7D32;  /* available */
  --color-danger:    #C62828;  /* booked */
  --color-warning:   #EF8F00;  /* tentative */
  --radius: 14px;
  --shadow: 0 8px 24px rgba(0,0,0,0.08);
}
```
Dark mode is not required for MVP.

## 3. Typography
| Use | Font | Notes |
|---|---|---|
| Headings | Playfair Display (or Cormorant Garamond) | Elegant, wedding feel |
| Body/UI | Poppins or Inter | Readable on mobile |
| Hindi | Noto Sans Devanagari / Noto Serif Devanagari | For Phase 2 toggle |

Scale (mobile / desktop): H1 32/56, H2 26/40, H3 20/28, body 16/18, small 14.

## 4. Layout and spacing
- Container max width 1200px, side padding 16px mobile / 32px desktop
- Section vertical padding 56px mobile / 96px desktop
- 8px spacing grid
- Tap targets at least 44x44px

## 5. Global components
| Component | Behaviour |
|---|---|
| **Navbar** | Logo + 4 links (Services, Menu, Packages, Gallery) + "Enquire" button. Collapses to a menu on mobile. Sticky with blur background. |
| **Sticky action bar (mobile)** | Fixed bottom: [Call] [WhatsApp] [Check Dates]. Always visible. |
| **Floating WhatsApp button (desktop)** | Bottom-right, subtle pulse |
| **Footer** | Address, phone, hours, map link, social icons, copyright, "Website by Arush" credit |
| **Button** | Primary (maroon), Secondary (outline gold), WhatsApp (green). Rounded, 48px height. |
| **Card** | White surface, radius 14, soft shadow, hover lift on desktop |
| **Lightbox** | Swipe on mobile, arrows and keyboard on desktop, caption and counter |
| **Toast** | Success/error messages for form |

## 6. Home page sections (top to bottom)

### 6.1 Hero
- Full-screen image or short looping video (muted, optimized) of the venue at golden hour
- Overlay gradient for text contrast
- H1: "<Lawn Name>: Where Your Wedding Story Begins"
- Sub: city + one-line USP (e.g. "Spacious lawn for up to 1,500 guests")
- CTAs: **Check Availability** (primary), **WhatsApp Us** (secondary)
- Trust chips: ★ 4.6 Google rating, 500+ weddings hosted, Ample parking
```
+-------------------------------------+
| [Logo]                  [Enquire]   |
|                                     |
|   Lawn Name: Where Your Wedding     |
|   Story Begins                      |
|   Prayagraj | Up to 1500 guests     |
|   [Check Availability] [WhatsApp]   |
|   * 4.6 Google  * 500+ weddings     |
+-------------------------------------+
```

### 6.2 Quick highlights strip
4 icons: Capacity, Rooms, Parking, Power Backup (or AC Hall). Horizontal scroll on mobile.

### 6.3 About the venue
Short story (60-100 words) + one large image + key facts list.

### 6.4 Gallery
- Category tabs: All, Lawn, Mandap, Dining, Rooms, Decor, Night
- Masonry grid (2 columns mobile, 3-4 desktop), lazy loaded, click opens lightbox
- Optional video tour card at the top

### 6.5 Facilities and capacity
Icon grid: seating, floating capacity, bridal room, guest rooms, parking, DJ allowed, in-house catering, outside catering policy, decoration, generator, lift/ramp, washrooms.

### 6.6 Packages
3 cards (Basic, Standard, Premium) with "Most Popular" badge on the middle one. Each lists inclusions and a "Starting from ₹X" or "Get Quote" button. Note: "Prices vary by season, date and guest count."

### 6.6a Services (#services)
- Two parts: **Events we host** and **Add-on services**.
- Events: Wedding, Reception and Engagement, Birthday, Corporate and Official Parties, Social Gatherings. Large photo rows alternating image left and right, each with one line, 3-4 plain bullet features, and an "Enquire for <event>" text button that opens the form with the event type prefilled.
- Add-ons (decor, catering, DJ and sound, photography, lighting): a simple two-column list with thin dividers, no boxed cards.
- Copy rule: facts only, e.g. "Corporate events: seats 300 theatre style, projector and sound system available".

### 6.6b Menu (#menu)
- Category tabs (Snacks, Main Course, Rice and Breads, Chinese, Desserts, Beverages, Live Counters) and a Veg / Non-veg / All toggle.
- Items as a clean two-column text list with the standard veg marker (green square dot) or non-veg marker (red/brown triangle dot). One photo for the active category.
- "View full menu" goes to /menu. "Download menu PDF" shows only if a PDF is uploaded.
- Note under the list: "Menus can be customised. Tasting available on request."
```
 Snacks | Main Course | Rice | Chinese | Desserts
 [All] [Veg] [Non-veg]
 (green) Paneer Tikka          (red) Chicken Seekh Kebab
 (green) Hara Bhara Kebab      (red) Fish Fingers
```

### 6.6c 360 virtual tour (#tour)
- Full-width viewer, 16:9 on desktop and 4:5 on mobile, with a short line: "Look around the venue. Drag to rotate."
- Scene chips below the viewer (Main Lawn, Stage, Dining, Rooms). Hotspot arrows jump between scenes, info markers show short facts.
- Controls: fullscreen, zoom, optional gyroscope on mobile. Loading state with a blurred thumbnail. Lazy load the viewer only when the section is near the viewport.
- If WebGL or the viewer fails, show the first panorama as a static image with a "View photos" button. Hide the section when no scenes exist.

### 6.6d Package details drawer
- On each package card, "View details" opens a drawer (bottom sheet on mobile) with grouped inclusions (for example Snacks, Dinner, Dessert, Extras), price unit (per plate or per event), guest range, and an "Enquire for this package" button that prefills the form.

### 6.7 Availability calendar
- Month view, swipe between months
- Legend: Green = Available, Red = Booked, Orange = Tentative
- Tap an available date → opens enquiry form with date prefilled
- Disclaimer line below

```
        < November 2026 >
 Mo Tu We Th Fr Sa Su
  .  .  .  .  .  1  2
  3  4  5  6  7  8  9      (green/red/orange dots)
 ...
 [x] Available  [x] Booked  [x] Tentative
```

### 6.8 How booking works
4 steps with icons: Check date → Enquire → Visit venue → Confirm with advance.

### 6.9 Reviews
Carousel of review cards (name, stars, short text, "Google review" label), plus a link to the Google listing.

### 6.10 Vendors/partners (Phase 2)
Logos of decorators, caterers, photographers.

### 6.11 FAQ
Accordion: advance amount, cancellation, decoration rules, music timing, catering, parking, rooms.

### 6.12 Contact and enquiry
Two columns on desktop, stacked on mobile:
- **Form:** Name, Phone, Event type (Wedding, Reception, Engagement, Other), Date (picker), Guests (range select), Message (optional), submit button "Send Enquiry". Phone is required, everything else optional-friendly. Honeypot hidden field.
- **Details:** Address, phone, WhatsApp, hours, Google Map embed, "Get Directions" button.

## 7. Other pages
| Page | Content |
|---|---|
| `/gallery` | Full gallery with filters |
| `/services` | Events hosted and add-on services in detail, each with an enquiry button |
| `/menu` | Full menu with category and veg filters, PDF download |
| `/tour` | Full-screen 360 virtual tour |
| `/packages` | Detailed package comparison |
| `/contact` | Form, map, details |
| `/thank-you` | Confirmation, WhatsApp continue button, next steps |
| `/privacy` | Short privacy policy |
| `/dashboard` (Phase 2) | Owner login, leads, calendar, media |

## 8. Owner admin UI (MVP uses Django admin, styled with Jazzmin)
- Dashboard shortcuts: Leads, Calendar Dates, Gallery, Packages, Reviews, Settings
- Leads list: filter by status/date, search by name or phone, export CSV
- Calendar editor: pick a date, choose status, save. Allow bulk range.
- Use simple labels in English/Hindi: "Booked", "Available".

**Phase 2 dashboard wireframe**
```
+--------+-------------------------------+
| Menu   |  New leads (3)   Today (1)    |
| Leads  |  [Kanban: New|Contacted|      |
| Calendar|       Visited|Booked|Lost]   |
| Gallery|  Upcoming bookings list       |
| Settings|                              |
+--------+-------------------------------+
```

## 9. Motion
- Fade-up on scroll for sections (200-400ms, once)
- Gallery hover zoom 1.03 on desktop
- Button press feedback
- Respect `prefers-reduced-motion`
- No auto-playing sound, no heavy parallax on mobile

## 10. Accessibility and content rules
- Alt text for every image, descriptive and short
- Contrast at least 4.5:1 for text
- Visible focus states, keyboard navigable calendar and lightbox
- Form errors announced and shown beside fields
- Language attribute set (`en` / `hi`)

## 11. Responsive breakpoints
`sm 640`, `md 768`, `lg 1024`, `xl 1280`. Check at 360, 390, 768, 1024, 1440.

## 12. Image guidelines for owners
- Landscape photos at least 1600px wide, taken in daylight and evening
- Include: entrance, lawn from the stage, mandap, dining, rooms, parking, decorated event
- No watermarks of other brands, no blurry or dark images

## 13. UI revamp via Stitch (Phase 3.5 Active)
- **Active Direction:** Royal Heritage Editorial (Stitch Screen `3053ee8a42c14761a9f37640258f2bda`, Project `2051165632570147684`).
- [DESIGN.md](file:///c:/Users/varus/OneDrive/Desktop/marriage-lawn/DESIGN.md) in the repository root is the active source of truth for color tokens, typography, radii (0px), spacing, and component specifications, overriding section 2 & 3 tokens.
- **Key Tenets:** Ivory (`#FDFBF7`), Royal Maroon (`#6B1426`), Antique Gold (`#B8860B`), Hairline borders (`#E6DFC8`), 0px radius, zero gradients, zero glassmorphism, zero emojis.
- Rebuild sections incrementally against the Stitch screen, maintaining all data wiring, accessibility, and performance guarantees.
