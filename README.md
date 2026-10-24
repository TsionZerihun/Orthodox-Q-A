# Orthodox Q&A

A calm Ethiopian Orthodox question-and-answer website for Orthodox and non-Orthodox visitors. This repository is **Orthodox Q&A only** — 

The product goal is a respectful forum: public reading without signup; verified email before participation; topics, questions, answers, comments, follows, saves, notifications, teacher verification, and moderated community tools. Confirmed product rules live in the planning documents under `docs/`.

## Technology stack

| Layer | Role |
| --- | --- |
| **Next.js (App Router) + TypeScript** (`frontend/`) | UI, routing, and a **browser-local demo adapter** for interactive flows without production auth |
| **Django** (`backend/`) | Forum API starter (models, endpoints, tests). Target owner of authorization and business rules |
| **Supabase (planned)** | PostgreSQL, Auth, and Storage in production. **Having a Supabase project does not mean integration is complete.** Auth, Storage, and live PostgreSQL wiring remain unfinished until explicitly verified |

## Current implementation status (evidence-based)

See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md), [docs/PAGE_CHECKLIST.md](docs/PAGE_CHECKLIST.md), and [docs/FRONTEND_REQUIREMENTS_AUDIT.md](docs/FRONTEND_REQUIREMENTS_AUDIT.md) for detail.

**Working locally today**

- Multi-page Next.js UI for the planned main routes (home, topics, search, question detail, profile, saved, settings, account, notifications, teacher, moderation, admin, references viewer).
- Shared shell: logo, themes, Meskel watermark, manuscript card corners, EN/አማ toggle (partial Amharic).
- **Local demo adapter** (`frontend/lib/demo/`): simulated sign-in, questions/answers/comments, votes, follow/save, notifications, teacher application, moderation/admin previews — persisted in the browser and labeled as demo. **Not** production authentication, email, uploads, or server authorization.
- Django starter API and tests; with an empty `DATABASE_URL`, Django uses local SQLite for isolated API preview only.
- Approved design reference images are tracked under `frontend/public/references/` and viewable at `/references` when the frontend is running.

**Not complete / not claimed**

- Real Supabase Auth (email verification, recovery), JWT enforcement, Storage uploads, RLS, or production PostgreSQL schema matching Database Design v2.
- Exact pixel parity with every mock (for example, topic card illustrations are missing as reusable assets; notifications has no dedicated approved mock).
- Full Amharic copy, rich-text editors, production ranking, and full staff/audit compliance.
- Django models are a **starter**, not the full reviewed schema.

Do not treat demo UI behavior as live backend integration.

## Repository structure

```text
frontend/                 Next.js app, demo adapter, env example, lockfile
  app/                    Routes (pages)
  components/             Shared UI
  lib/demo/               Browser-local demo state (not production auth)
  public/assets/          Logo, fonts (with licenses), shared decoration
  public/references/      Final mock PNGs (same set as mockups/; GitHub + /references viewer)
backend/                  Django project, starter models/migrations/tests
docs/                     Requirements, roadmap, architecture, DB/API plans, status
database-design/          Database architecture diagrams (planning)
mockups/                  Final approved mockup PNGs (+ inventory README)
.github/                  CI workflow and pull request template
AGENTS.md                 Project rules for assistants working in this repo
CONTRIBUTING.md           Contribution conventions
```

## Local setup

Requirements: **Node ≥ 20.9**, **Python ≥ 3.11**.

### Backend

```bash
cd backend
```

```bash
python3 -m venv .venv
```

```bash
source .venv/bin/activate
```

```bash
pip install -r requirements-lock.txt
```

```bash
cp .env.example .env
```

```bash
python manage.py migrate
```

```bash
python manage.py seed_demo
```

```bash
python manage.py runserver 127.0.0.1:8000
```

Leave `DATABASE_URL` empty in `backend/.env` to use SQLite for isolated local API preview. **Do not run starter migrations against a production or shared Supabase database** until the schema work is intentionally planned and approved.

### Frontend

In a second terminal:

```bash
cd frontend
```

```bash
npm ci
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Reference images: [http://localhost:3000/references](http://localhost:3000/references).

Interactive posting and account flows work through the **local demo adapter** without Supabase. Seeded/demo questions are illustrative, not real teacher endorsements.

## Environment configuration

| File | Purpose |
| --- | --- |
| `backend/.env.example` | Template for Django settings and optional `DATABASE_URL` |
| `backend/.env` | Local secrets (gitignored). Never commit |
| `frontend/.env.example` | Template for API URL and optional Supabase public keys |
| `frontend/.env.local` | Local frontend env (gitignored). Never commit |

Optional later: set a Supabase Session pooler `DATABASE_URL` (with SSL) in `backend/.env` only after you are ready to connect intentionally. Configuring URL values is not the same as finishing Auth, Storage, or schema integration.

## Tests and checks

Backend (with virtualenv activated; empty `DATABASE_URL` for SQLite):

```bash
python manage.py check
```

```bash
python manage.py makemigrations --check --dry-run
```

```bash
python manage.py test
```

Frontend:

```bash
npm run typecheck
```

```bash
npm run build
```

Recorded results: [docs/VERIFICATION.md](docs/VERIFICATION.md). CI under `.github/workflows/` repeats these starter checks; it is not a full privacy or end-to-end audit.

## Documentation and design

| Document | Contents |
| --- | --- |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/product/REQUIREMENTS.md](docs/product/REQUIREMENTS.md) | Product requirements summary |
| [docs/product/ROADMAP.md](docs/product/ROADMAP.md) | Milestones |
| [docs/architecture/DECISIONS.md](docs/architecture/DECISIONS.md) | Architecture notes |
| [docs/Orthodox_QA_Database_Design_Reviewed_v2.md](docs/Orthodox_QA_Database_Design_Reviewed_v2.md) | Database design (planning) |
| [database-design/README.md](database-design/README.md) | Database architecture diagrams |
| [docs/Orthodox_QA_API_Design.md](docs/Orthodox_QA_API_Design.md) | API design (planning) |
| [docs/VISUAL_CHECKLIST.md](docs/VISUAL_CHECKLIST.md) | Visual acceptance checklist |
| [mockups/README.md](mockups/README.md) | Mockup inventory with preview links |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

No project distribution license has been selected yet. Font license notices under `frontend/public/assets/` are retained.
