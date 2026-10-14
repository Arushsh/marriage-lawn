# Marriage Lawn Website Template

A fast, mobile-first website for marriage lawns, banquet halls and wedding venues in India.
Built once as a config-driven template; re-skinned for each new lawn in 1–2 days.

## Repo structure

```
marriage-lawn/
  backend/      # Django + DRF project
  frontend/     # Next.js app (coming in Chunk 2)
  docs/         # Specification documents
  README.md
```

## Quick start

### Backend

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env: set DJANGO_SECRET_KEY, DATABASE_URL, email settings, etc.

# 4. Run migrations
python manage.py migrate

# 5. Create a superuser (for the admin panel)
python manage.py createsuperuser

# 6. Seed demo data
python manage.py seed_demo

# 7. Start the dev server
python manage.py runserver
```

Admin panel: http://127.0.0.1:8000/private-admin/

API base:    http://127.0.0.1:8000/api/v1/

### Frontend (Chunk 2 — coming soon)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

See [`backend/.env.example`](backend/.env.example) for all required variables.
**Never commit a real `.env` file.**

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL (Neon / Supabase / Render) |
| Media | Cloudinary |
| Email | Gmail SMTP (MVP); Resend (alternative) |
| Hosting | Vercel (frontend) + Render/Railway (backend) |

## Documentation

See [`docs/`](docs/) for the full specification:
[PRD](docs/../PRD.md) · [TECH](docs/../TECH.md) · [UI](docs/../UI.md) · [DATABASE](docs/../DATABASE.md) · [API](docs/../API.md) · [TASKS](docs/../TASKS.md) · [CONTENT](docs/../CONTENT.md)
