# Product Requirements Document (PRD)

**Product:** Marriage Lawn Website Template
**Owner:** Arush Vishwakarma
**Status:** Draft v1
**Target market:** Marriage lawns, banquet halls and wedding venues in Prayagraj and nearby cities (then wider India)

---

## 1. Problem
Families search Google and Instagram for wedding venues, compare 3-5 options, and call the ones that look professional and answer their questions fast. Most local lawns have only a Google Maps listing and an Instagram page. Owners lose enquiries because:
- Photos, capacity, rooms and rates are scattered or missing
- Customers cannot see which dates are free, so they call repeatedly
- Enquiries come through calls and DMs with no record, and leads get forgotten
- The venue looks less established than competitors with a site

## 2. Goals
**Business goals (for the lawn owner)**
- More qualified enquiries per month
- Fewer repetitive phone calls
- A professional, trustworthy online presence

**Product goals (for us)**
- One reusable template deployable for a new lawn in 1-2 days
- Simple enough that a non-technical owner can manage dates and leads
- A clear upsell path (payments, chatbot, SEO, maintenance)

## 3. Target users
| Persona | Description | Needs |
|---|---|---|
| **Visitor (family)** | Parent or bride/groom, 25-60, on mobile, comparing venues | See photos, capacity, price idea, availability, location; enquire fast |
| **Lawn owner/manager** | 35-65, not technical, busy, uses WhatsApp daily | See new leads, mark booked dates, update photos |
| **Admin (us)** | Developer maintaining multiple lawn sites | Fast setup, config-driven content |

## 4. Success metrics
- Page load: LCP under 2.5s on 4G mobile; Lighthouse performance 90+
- Enquiry conversion: 3-5% of visitors submit form or tap WhatsApp/call
- Owner can update a date or reply to a lead in under 1 minute
- Time to launch a new lawn: under 2 days
- Business: first 3 paying lawn clients within 30 days of outreach

## 5. Scope

### MVP (Phase 1, ~7 days)
| ID | Requirement | Priority |
|---|---|---|
| F-01 | Hero section with venue name, tagline, key stats, and primary CTAs (WhatsApp, Call, Check Dates) | Must |
| F-02 | Photo gallery with categories (Lawn, Stage/Mandap, Dining, Rooms, Decoration, Night), lightbox, lazy loading | Must |
| F-03 | Video section (YouTube/Cloudinary embed) for venue walkthrough | Should |
| F-04 | Venue details: capacity (seating/floating), halls, rooms, parking, AC, power backup, catering/decor policy | Must |
| F-05 | Packages/pricing section with Basic, Standard, Premium cards or "Get Quote" mode | Must |
| F-06 | Availability calendar showing Available / Booked / Tentative dates, read-only for visitors | Must |
| F-07 | Enquiry form: name, phone, event type, date, guest count, message. Validates phone, stores lead | Must |
| F-08 | WhatsApp click-to-chat with pre-filled message including selected date | Must |
| F-09 | Sticky mobile bottom bar with Call and WhatsApp buttons | Must |
| F-10 | Google Maps embed, address, directions button | Must |
| F-11 | Reviews section (manually entered Google reviews with names and ratings) | Should |
| F-12 | FAQ accordion | Should |
| F-13 | Owner admin: manage gallery, packages, calendar dates, view/export leads, mark lead status | Must |
| F-14 | Email notification to owner on every new enquiry | Must |
| F-15 | SEO basics: meta tags, Open Graph, sitemap, robots, LocalBusiness schema markup | Must |
| F-16 | Config-driven branding (name, colors, logo, contact, hours) via `SiteSettings` | Must |
| F-17 | Services section: events hosted (wedding, reception/engagement, birthday, corporate and official parties, social gatherings) and add-on services (decor, catering, DJ/sound, photography, lighting). Each opens an enquiry with the event type prefilled | Must |
| F-18 | Menu section: categories (snacks, main course, rice and breads, Chinese, desserts, beverages, live counters), veg/non-veg filter with standard markers, /menu page, optional PDF menu download | Must |
| F-19 | 360 degree virtual tour: scenes (lawn, stage, dining, rooms, entrance) with navigation hotspots, mobile gyroscope option, falls back to gallery if no tour exists | Must |
| F-19a | Package details drawer with grouped inclusions, price unit (per plate or per event) and package selection carried into the enquiry form | Must |

### Phase 2 (after first client signs)
| ID | Requirement |
|---|---|
| F-20 | Custom owner dashboard (React) replacing Django admin: leads board, calendar editor, media manager |
| F-21 | WhatsApp notification to owner via WhatsApp Business API |
| F-22 | Hindi/English language toggle |
| F-23 | Online advance booking with Razorpay/UPI and booking confirmation PDF |
| F-24 | AI chatbot for FAQs (capacity, rates, availability) with lead capture |
| F-25 | 360 degree / virtual tour viewer |
| F-26 | Vendor partners page (decorators, caterers, DJ, photographers) |
| F-27 | Analytics dashboard (visits, enquiries, sources) |
| F-28 | Multi-venue support (one account, several halls) |
| F-29 | Interactive 3D layout planner (Three.js / React Three Fiber): stage, round tables, seating by guest count. Needs a modelled lawn, so only after a client asks |

### Out of scope (for now)
- Full marketplace of multiple lawns
- Guest management or invitation features
- Native mobile apps
- Complex pricing calculator

## 6. Key user flows
1. **Visitor enquiry:** Land on page → browse gallery → check calendar → pick date → tap WhatsApp or submit form → see confirmation → owner notified.
2. **Owner marks date booked:** Log in → Calendar → select date → status Booked → saved, public calendar updates.
3. **Owner handles lead:** Receives email → opens admin → sees lead → calls → sets status (New, Contacted, Visited, Booked, Lost) → adds note.

## 7. Non-functional requirements
- **Performance:** Image optimization (WebP/AVIF, responsive sizes), lazy loading, under 300 KB JS on first load where possible
- **Mobile first:** Designed at 360px width first
- **Accessibility:** Semantic HTML, alt text, color contrast AA, keyboard focus
- **Security:** HTTPS, input validation, rate limiting on enquiry form, spam protection (honeypot + captcha), no secrets in frontend
- **Reliability:** Site stays usable if backend is down (static content cached, form shows fallback WhatsApp link)
- **Privacy:** Store only needed lead data; show a short privacy note near the form
- **Maintainability:** Config-driven content, typed code, documented env vars

## 8. Assumptions
- Owner provides photos, details, and phone/WhatsApp number
- Owner is willing to update dates (or we do it for a monthly fee)
- Most traffic comes from Google Maps/Search and Instagram on mobile

## 9. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Owner never updates the calendar | Keep it simple, offer maintenance plan, show "call to confirm" notice |
| Poor quality photos | Provide photo guidelines; offer reshoot referral |
| Spam enquiries | Honeypot, rate limit, captcha |
| Overbuilding before first sale | Build MVP demo only, add Phase 2 per client request |
| Slow site from heavy images | Cloudinary transforms, lazy load, size limits |

## 10. Commercial packaging (for selling)
| Plan | Includes | Suggested price (India) |
|---|---|---|
| Starter | MVP site without calendar, 5-7 sections, domain + hosting setup | ₹8,000-12,000 |
| Standard | Starter + availability calendar + lead dashboard + email alerts | ₹15,000-25,000 |
| Premium | Standard + Razorpay booking + chatbot + Hindi toggle + SEO setup | ₹30,000-50,000 |
| Maintenance | Updates, calendar upkeep, backups, support | ₹1,500-3,000/month |

## 11. Milestones
| Milestone | Target |
|---|---|
| Docs and design done | Day 1 |
| Frontend static MVP with sample data | Day 2-3 |
| Backend, calendar, enquiry API | Day 4-5 |
| Admin, notifications, SEO | Day 6 |
| QA, deploy demo, record walkthrough | Day 7 |
| First outreach with real lawn demo | Day 8 |
