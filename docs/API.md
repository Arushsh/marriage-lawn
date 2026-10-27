# REST API Spec

Base URL: `/api/v1/`
Format: JSON. Public endpoints need no auth. Owner endpoints (Phase 2 dashboard) use JWT `Authorization: Bearer <token>`.

## Public endpoints

### GET `/site/`
Returns site settings and theme.
```json
{
  "venue_name": "Shree Palace Lawn",
  "tagline": "Where your wedding story begins",
  "city": "Prayagraj",
  "phone": "+91XXXXXXXXXX",
  "whatsapp_number": "91XXXXXXXXXX",
  "address": "...",
  "latitude": 25.43, "longitude": 81.84,
  "rating_value": 4.6, "rating_count": 210,
  "weddings_hosted": 500,
  "primary_color": "#7B1E3A", "accent_color": "#C9A227",
  "hero_image": "https://...", "logo": "https://..."
}
```

### GET `/halls/`
List of halls with capacity.

### GET `/facilities/`
List of facilities with icon keys.

### GET `/packages/`
List of packages ordered by `order`.

### GET `/gallery/?category=lawn&page=1`
Paginated images. Response items: `id, image, thumb, category, caption, alt_text`.

### GET `/videos/`
Video links.

### GET `/reviews/`
Visible reviews.

### GET `/faqs/`
FAQ list.

### GET `/services/?kind=event|addon`
Visible services ordered by `order`. Fields: `id, title, slug, kind, event_type, short_description, description, features, image, icon`.

### GET `/menu/`
All visible categories with their items in one response (menus are small).
```json
{
  "pdf_url": "https://...",
  "categories": [
    {
      "name": "Snacks", "slug": "snacks", "image": "https://...",
      "items": [
        {"id": 1, "name": "Paneer Tikka", "description": "", "is_veg": true, "is_popular": true},
        {"id": 2, "name": "Chicken Seekh Kebab", "is_veg": false}
      ]
    }
  ]
}
```
Supports `?veg=1` to return only vegetarian items.

### GET `/tour/`
Returns scenes with hotspots. Empty list if the tour is disabled or has no scenes.
```json
{
  "enabled": true,
  "scenes": [
    {
      "id": 1, "title": "Main Lawn", "panorama": "https://...", "thumbnail": "https://...",
      "initial_yaw": 0, "initial_pitch": 0,
      "hotspots": [
        {"label": "Stage", "target_scene": 2, "yaw": 1.2, "pitch": -0.1},
        {"label": "Parking entrance", "info_text": "Parking for 120 cars", "yaw": 3.0, "pitch": 0}
      ]
    }
  ]
}
```

### GET `/availability/?start=2026-11-01&end=2026-12-31`
Returns only non-available dates.
```json
{
  "dates": [
    {"date": "2026-11-21", "status": "booked"},
    {"date": "2026-11-26", "status": "tentative"}
  ]
}
```
Validation: max range 6 months. Never expose private notes.

### POST `/enquiries/`
Request:
```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "email": "",
  "event_type": "wedding",
  "package": 2,            // optional package id
  "event_date": "2026-11-21",
  "guest_count": "500-800",
  "message": "Need rooms for 10 guests",
  "website": ""          // honeypot, must be empty
}
```
Responses:
- `201` `{ "id": 42, "message": "Enquiry received" }`
- `400` field errors
- `429` too many requests (limit 5/hour per IP)

Side effects: save lead, email owner, return WhatsApp prefill text in response optionally.

## Owner endpoints (implemented — staff JWT required)
All routes require `Authorization: Bearer <access>` from a staff (`is_staff`) account. Refresh rotation + blacklist enabled. See `apps/owner/` for details.

### Auth
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login/` | `{username, password}` → `{access, refresh, user}` (non-staff rejected, throttled 20/h) |
| POST | `/auth/refresh/` | `{refresh}` → new `{access, refresh}` |
| GET | `/auth/me/` | Current user profile |

### Content management
| Method | Path | Purpose |
|---|---|---|
| GET/PATCH | `/owner/site/` | SiteSettings singleton (incl. `notify_email`) |
| CRUD | `/owner/halls/` `/owner/facilities/` `/owner/packages/` `/owner/services/` `/owner/menu-categories/` `/owner/menu-items/` `/owner/reviews/` `/owner/faqs/` `/owner/gallery/` `/owner/videos/` | Full content management; asset fields accept multipart uploads or http(s) URLs |
| POST | `/owner/gallery/bulk_order/` | `{"items": [{id, order}]}` |
| GET/POST | `/owner/availability/` | List (with private notes) or bulk block `{dates[], status, note}` |
| DELETE | `/owner/availability/{date}/` | Unblock a date |

### CRM
| Method | Path | Purpose |
|---|---|---|
| GET | `/owner/enquiries/?status=&search=` | List leads (paginated) |
| PATCH | `/owner/enquiries/{id}/` | Update `status` / `owner_note` |
| GET | `/owner/bookings/?status=&search=` | List bookings |
| GET/PATCH | `/owner/bookings/{reference}/` | Update `status`, `admin_notes`, `paid_amount` (payment status + balance auto-derived; cancelling releases a free date) |
| GET | `/owner/stats/` | Pipeline, revenue, conversion, recent activity |

## Payments (Phase 2)
| Method | Path | Purpose |
|---|---|---|
| POST | `/payments/create-order/` | Create Razorpay order for advance |
| POST | `/payments/webhook/` | Razorpay webhook, verify signature, mark booked |

## Chatbot (Phase 2)
| Method | Path | Purpose |
|---|---|---|
| POST | `/chat/` | Send message, returns streamed answer using venue FAQ context |

## Error format
```json
{ "error": "validation_error", "details": { "phone": ["Enter a valid mobile number"] } }
```

## Conventions
- Dates in ISO `YYYY-MM-DD`
- Phone stored as 10 digits, shown with +91
- Pagination: `page`, `page_size` (max 24)
- Cache public GET endpoints with short `Cache-Control` (60-300s)
- Throttle: anonymous 100/hour for GET, 5/hour for POST enquiries
