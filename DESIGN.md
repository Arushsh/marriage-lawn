---
name: Royal Heritage Editorial
colors:
  canvas: '#FDFBF7'
  canvas-subtle: '#FAF2EE'
  surface: '#FFF8F5'
  surface-card: '#FFFFFF'
  surface-container: '#F4ECE8'
  surface-high: '#EEE7E3'
  text-primary: '#1E1B19'
  text-muted: '#554243'
  primary-maroon: '#6B1426'
  primary-maroon-dark: '#4B0013'
  primary-maroon-light: '#812535'
  accent-gold: '#B8860B'
  accent-gold-deep: '#7B5800'
  accent-gold-soft: '#FDC34D'
  border-hairline: '#E6DFC8'
  border-subtle: '#DBC0C1'
  border-gold: '#B8860B'
  status-available: '#2E7D32'
  status-booked: '#6B1426'
  status-tentative: '#B8860B'
typography:
  font-heading: 'Playfair Display, Georgia, serif'
  font-body: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif'
  display-hero:
    fontFamily: 'Playfair Display'
    fontSize: '56px'
    fontWeight: '400'
    lineHeight: '68px'
    letterSpacing: '-0.01em'
  display-hero-mobile:
    fontFamily: 'Playfair Display'
    fontSize: '34px'
    fontWeight: '400'
    lineHeight: '42px'
    letterSpacing: '0em'
  headline-lg:
    fontFamily: 'Playfair Display'
    fontSize: '40px'
    fontWeight: '400'
    lineHeight: '50px'
    letterSpacing: '-0.005em'
  headline-lg-mobile:
    fontFamily: 'Playfair Display'
    fontSize: '28px'
    fontWeight: '400'
    lineHeight: '36px'
    letterSpacing: '0em'
  headline-md:
    fontFamily: 'Playfair Display'
    fontSize: '28px'
    fontWeight: '500'
    lineHeight: '36px'
  headline-sm:
    fontFamily: 'Playfair Display'
    fontSize: '22px'
    fontWeight: '600'
    lineHeight: '30px'
  body-lg:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '18px'
    fontWeight: '400'
    lineHeight: '28px'
  body-md:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '15px'
    fontWeight: '400'
    lineHeight: '24px'
  body-sm:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '13px'
    fontWeight: '400'
    lineHeight: '20px'
  label-caps-lg:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '13px'
    fontWeight: '600'
    lineHeight: '18px'
    letterSpacing: '0.15em'
    textTransform: 'uppercase'
  label-caps-sm:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '11px'
    fontWeight: '600'
    lineHeight: '16px'
    letterSpacing: '0.18em'
    textTransform: 'uppercase'
spacing:
  container-max: '1360px'
  gutter-desktop: '2rem'
  gutter-mobile: '1rem'
  margin-desktop: '4rem'
  margin-mobile: '1.25rem'
  space-xs: '0.25rem'
  space-sm: '0.5rem'
  space-md: '1rem'
  space-lg: '1.5rem'
  space-xl: '2.5rem'
  space-2xl: '4rem'
  space-3xl: '6rem'
radii:
  all: '0px'
---

# Design System Document: Royal Heritage Editorial

## 1. Creative North Star: "The Stately Heritage Gazette"
The interface honors the solemnity, architectural dignity, and quiet luxury of grand Indian royal wedding estates. It replaces generic web components and playful SaaS tropes with an archival editorial register:
- **No Gradients, No Glassmorphism:** Surfaces are completely opaque and tactile, reminiscent of heavy handmade ivory stationery with hot-stamped gold foil.
- **Architectural Symmetry & Hairlines:** Strict 1px hairline borders (`#E6DFC8` and `#B8860B`) structure information into clear physical bays.
- **Photo-Led Grandeur:** Photography is presented as framed archival art with generous breathing space.

---

## 2. Color Palette & Rules
- **Base Canvas (`#FDFBF7`):** Warm Ivory linen base. Default ground for all pages and sections.
- **Subtle Surface (`#FAF2EE`):** Alternating section band fill for contrast.
- **Primary Sovereign Maroon (`#6B1426`):** Command color for solid primary buttons, section kickers, key metrics, and brand wordmarks. Dark variant: `#4B0013`.
- **Antique Gold Accent (`#B8860B`):** Fine keyline borders, focus rings, monogram emblems, and secondary button borders. Never used as a yellow fill or digital metallic glare.
- **Hairline Divider (`#E6DFC8`):** Crisp 1px borders, subtle container outlines, and architectural card divisions.
- **Charcoal Onyx Text (`#1E1B19`):** Grounded contrast for text, softer than pure black.
- **Muted Umber Text (`#554243`):** Secondary descriptions, captions, and venue meta-data.

---

## 3. Typography Scale & Guidelines
- **Headings (Playfair Display):** Refined high-contrast serif. Conveys heritage authority and editorial restraint. Hero headlines use regular weight with relaxed tracking.
- **Body & Data (Plus Jakarta Sans):** Modern geometric legibility for capacities, pricing, package tables, and forms.
- **Caps Labels (Tracked Uppercase):** Category kickers, table headers, and badges use uppercase with `letterSpacing: 0.15em` to `0.18em`.
- **Zero Emojis:** Web emojis, cartoon glyphs, and novelty icons are strictly prohibited. Use clean SVG geometric glyphs or antique gold diamond anchors (`◆`).

---

## 4. Radii & Elevation
- **Border Radius is 0px Everywhere:** Sharp 90-degree corners for all buttons, cards, image containers, badges, inputs, and modals.
- **Zero Drop Shadows & Zero Backdrop Blurs:** Elevation is created purely through 1px border framing, contrasting parchment background fills, and hairline nesting.

---

## 5. Component Specifications

### 5.1 Primary Button
- Solid `#6B1426` background, crisp `#FDFBF7` uppercase text.
- 1px inset or border in `#B8860B`.
- 0px radius, 48px height, padded `14px 28px`.
- Hover: shifts to `#4B0013` with subtle golden border illumination.

### 5.2 Secondary Button
- Transparent or `#FDFBF7` background.
- 1px solid `#B8860B` border.
- Text in `#6B1426` or `#1E1B19`, uppercase, tracked.
- Hover: fills with `#FAF2EE`.

### 5.3 Cards & Photo Frames
- Flat `#FFFFFF` or `#FAF2EE` background.
- 1px solid hairline border in `#E6DFC8`.
- Inset framing: images sit inside a 1px border with a 4px-6px ivory mat margin before the photo edge.

### 5.4 Sticky Bottom Action Bar (Mobile)
- Solid opaque `#FDFBF7` background with a 1px solid `#B8860B` top hairline.
- Direct Call action (antique gold framed) + WhatsApp Concierge (solid royal maroon).
- Always accessible on mobile without covering interactive form fields.

### 5.5 Navbar & Header
- Opaque `#FDFBF7` with bottom 1px `#E6DFC8` hairline.
- Stately monogram crest 'GRL' or venue shield + uppercase serif brand name.
- Direct phone link and "Reserve Dates" action.

### 5.6 Form Inputs
- 1px solid `#E6DFC8` border, `#FFFFFF` background, 0px radius.
- Focus: shifts to 1px `#B8860B` border with no fuzzy glowing outline.

---

## 6. Do and Don't Rules

### Do:
- Use generous vertical padding (`space-2xl` and `space-3xl`) to let sections breathe.
- Pair royal maroon solid actions with antique gold hairline frames.
- Keep all container corners strictly sharp (`0px`).
- Frame photography cleanly with hairlines.

### Don't:
- Don't use gradients, color fades, or iridescent mesh backgrounds.
- Don't use backdrop-blur or frosted glassmorphism anywhere.
- Don't use rounded corners (`rounded-lg`, `rounded-full`, etc.) on buttons, cards, or inputs.
- Don't use emojis or informal text icons.
- Don't use harsh pure black (`#000000`) or plain digital red/blue.
