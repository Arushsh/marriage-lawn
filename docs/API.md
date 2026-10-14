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

## Owner endpoints (Phase 2)
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login/` | Get JWT access/refresh |
| POST | `/auth/refresh/` | Refresh token |
| GET | `/owner/enquiries/?status=new&search=` | List leads |
| PATCH | `/owner/enquiries/{id}/` | Update status/note |
| GET | `/owner/enquiries/export/` | CSV export |
| GET/POST | `/owner/availability/` | List or set date status |
| DELETE | `/owner/availability/{date}/` | Mark available again |
| GET/POST/PATCH/DELETE | `/owner/gallery/` | Manage images |
| PATCH | `/owner/site/` | Update settings |
| GET | `/owner/stats/` | Leads count, conversion, upcoming dates |

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
