# Marriage Lawn Website (Reusable Template)

A fast, mobile-first website for marriage lawns, banquet halls and wedding venues in India.
Built once as a config-driven template, then re-skinned for each client lawn in 1-2 days.

## Goal
Help a lawn owner get more booking enquiries online: photos, availability, packages, and one-tap WhatsApp/call enquiries, with a simple way to manage dates and leads.

## Docs
| File | Purpose |
|---|---|
| [PRD.md](PRD.md) | What we are building, for whom, scope, requirements, metrics |
| [TECH.md](TECH.md) | Stack, architecture, folder structure, deployment, security |
| [UI.md](UI.md) | Design system, pages, sections, components, wireframes |
| [DATABASE.md](DATABASE.md) | Data models and relationships |
| [API.md](API.md) | REST endpoints |
| [TASKS.md](TASKS.md) | Build roadmap and checklist |
| [CONTENT.md](CONTENT.md) | Client onboarding checklist, copy, SEO keywords |
| [AGENTS.md](AGENTS.md) | Rules for Antigravity: workflow, review gate, plugins, code and design rules |
| [REFERENCES.md](REFERENCES.md) | What we take from alron.in and what we avoid |
| DESIGN.md (later) | Design tokens generated from Stitch during the UI revamp |

## Stack (summary)
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- Backend: Django + Django REST Framework, PostgreSQL
- Hosting: Vercel (frontend), Render/Railway/AWS (backend), Cloudinary (images)
- Notifications: WhatsApp click-to-chat (MVP), email via SMTP/Resend

## Suggested repo layout
```
lawn-website/
  frontend/     # Next.js app
  backend/      # Django project
  docs/         # these markdown files
  README.md
```

## Quick start (once code exists)
```bash
# backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate && python manage.py createsuperuser
python manage.py runserver

# frontend
cd frontend && npm install
cp .env.example .env.local
npm run dev
```

## Tooling (Antigravity)
- Plugins: coderabbit (review gate after every chunk), gemini-api (Phase 2 chatbot), caveman (terse chat replies only), ponytail (skills used when relevant)
- Stitch MCP: used only for the UI revamp after the MVP works
- Agents read AGENTS.md first in every session

## Working agreement
- Build for the first lawn as a demo, but keep everything driven by `SiteSettings` data so the next lawn needs no code changes.
- Mobile first. Most visitors will be on phones.
- Ship MVP in about 7 days, then iterate.
