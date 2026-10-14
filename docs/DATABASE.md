# Database Design (PostgreSQL via Django ORM)

## Overview
```
SiteSettings (1)
Hall (many) --- Facility (many, M2M)
Package (many)
GalleryImage (many)  VideoLink (many)
AvailabilityDate (many)
Enquiry (many)
Review (many)
FAQ (many)
(Phase 2) Payment, Booking, VendorPartner, ChatSession
```

## Models

### SiteSettings (singleton)
| Field | Type | Notes |
|---|---|---|
| venue_name | CharField | |
| tagline | CharField | |
| about_text | TextField | |
| city | CharField | |
| address | TextField | |
| latitude, longitude | Decimal | For schema and map |
| phone | CharField | |
| whatsapp_number | CharField | With country code |
| email | EmailField | |
| opening_hours | CharField | |
| google_maps_url, google_reviews_url | URLField | |
| instagram_url, facebook_url, youtube_url | URLField | optional |
| rating_value, rating_count | Decimal, Int | Shown in hero |
| weddings_hosted | Int | Stat |
| primary_color, accent_color | CharField | Hex, theme override |
| logo | ImageField (Cloudinary) | |
| hero_image | ImageField | |
| hero_video_url | URLField | optional |
| meta_title, meta_description | CharField | SEO |
| notify_email | EmailField | Lead alerts |

### Hall
| Field | Type |
|---|---|
| name | CharField (e.g. Main Lawn, AC Banquet) |
| description | TextField |
| seating_capacity | Int |
| floating_capacity | Int |
| is_ac | Bool |
| image | ImageField |
| order | Int |

### Facility
| Field | Type |
|---|---|
| name | CharField (Parking, Bridal Room, Generator) |
| icon | CharField (icon key) |
| detail | CharField (optional, e.g. "100 cars") |
| order | Int |

### Package
| Field | Type |
|---|---|
| name | CharField |
| description | TextField |
| price_from | Decimal (nullable) |
| price_note | CharField (e.g. "per event, varies by season") |
| inclusions | JSONField (list of strings) |
| is_popular | Bool |
| show_price | Bool (False shows "Get Quote") |
| order | Int |

### GalleryImage
| Field | Type |
|---|---|
| image | ImageField |
| category | Choice: lawn, mandap, dining, rooms, decor, night, other |
| caption, alt_text | CharField |
| is_featured | Bool |
| order | Int |
| created_at | DateTime |

### VideoLink
| Field | Type |
|---|---|
| title | CharField |
| url | URLField (YouTube/Cloudinary) |
| order | Int |

### AvailabilityDate
| Field | Type | Notes |
|---|---|---|
| date | Date, unique | |
| status | Choice: booked, tentative | Absent date = available |
| note | CharField | Private note for owner |
| updated_at | DateTime | |

### Enquiry
| Field | Type | Notes |
|---|---|---|
| name | CharField | |
| phone | CharField | Validated Indian number |
| email | EmailField | optional |
| event_type | Choice: wedding, reception, engagement, birthday, other | |
| event_date | Date | nullable |
| guest_count | Choice/Int range | |
| message | TextField | max 500 chars |
| status | Choice: new, contacted, visited, booked, lost | default new |
| source | CharField | website, whatsapp, calendar |
| owner_note | TextField | |
| ip_address | GenericIPAddress | For rate limiting/spam |
| created_at | DateTime | |

### Review
| Field | Type |
|---|---|
| author_name | CharField |
| rating | Int 1-5 |
| text | TextField |
| source | CharField (Google, Justdial) |
| date | Date |
| is_visible | Bool |

### FAQ
| Field | Type |
|---|---|
| question | CharField |
| answer | TextField |
| order | Int |

## Phase 2 additions
- **Booking:** enquiry FK, event_date, amount, advance_paid, status, created_at
- **Payment:** booking FK, razorpay_order_id, razorpay_payment_id, amount, status, paid_at
- **VendorPartner:** name, category, phone, logo, website, is_visible
- **ChatSession / ChatMessage:** session_id, role, content, created_at

## Indexes and constraints
- `AvailabilityDate.date` unique + indexed
- `Enquiry(status, created_at)` index for dashboard
- `Enquiry.phone` indexed for duplicate checks
- Validate `event_date` is not in the past on create

## Seed data
Create a management command `seed_demo` that fills SiteSettings, 3 halls, 10 facilities, 3 packages, 12 gallery images, 5 reviews, 6 FAQs, and a few booked dates.
