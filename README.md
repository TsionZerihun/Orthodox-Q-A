# Small download edition

Large reference PNGs are omitted. Add your own mockup ZIP to mockups/archives/ and extracted PNGs to frontend/public/references/. Read DOWNLOAD_NOTE.md first.

# Orthodox Q&A

An Ethiopian Orthodox question-and-answer website built with **Next.js / React, TypeScript and Django**. The target integrations are Supabase PostgreSQL, Auth and Storage. This repository is the **initial working foundation**, not the completed forum.

## Start here

- **First GitHub push:** give Cursor [CURSOR_GITHUB_PROMPT.md](CURSOR_GITHUB_PROMPT.md).
- **Continue development:** [CURSOR_MASTER_PROMPT.md](CURSOR_MASTER_PROMPT.md).
- **Plans and requirements:** [documentation index](docs/README.md).
- **Live Notion planning:** [Notion links](docs/NOTION_LINKS.md).
- **Approved mockups / your existing ZIP:** [mockups guide](mockups/README.md).
- **Actual code coverage:** [implementation status](docs/IMPLEMENTATION_STATUS.md).

## Repository layout

```text
frontend/             Next.js source, lockfile, env example
  app/                Interface, account callback and reference viewer
  public/assets/      Shared logo, icons/decoration and licensed fonts
  public/references/  14 original approved design PNGs, stored once
backend/              Django source, initial migrations, tests and env example
  config/             Settings and URL routing
  forum/              Starter models, endpoints and tests
docs/                 Requirements, roadmap, architecture, DB/API plans, checks
mockups/              Design manifest and archives/ for owner's chosen ZIP
.github/              Starter CI workflow and PR template
AGENTS.md             Project rules for coding assistants
CONTRIBUTING.md       Development and commit conventions
```

## Current scope

Public question browsing/search/topics and initial verified-identity question/answer endpoints exist. The UI reconstructs the approved light/dark visual direction and includes all original references at `/references`. Many planned features/pages remain incomplete; the ZIP is not an exact pixel replica or a production-ready site.

Supabase account setup is **deferred**. Public local browsing needs no credentials. Sign-in and protected writes currently require actual Auth configuration; simulated local flows are future work and must be clearly isolated. No claim of real email/Storage/PostgreSQL integration testing is made.

## Local setup

Requirements: Node >=20.9 and Python >=3.11. Extract and open this repository folder in Cursor.

Terminal 1, from repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-lock.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 127.0.0.1:8000
```

Terminal 2, from repository root:

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Original references: http://localhost:3000/references. Seeded questions are illustrative, not real teacher endorsements. Empty DATABASE_URL selects local SQLite only for isolated preview. Never run starter migrations against an existing production database.

## Checks

```bash
# backend, activated virtual environment
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
# frontend
npm run build
npm run typecheck
```

See [verification](docs/VERIFICATION.md) for checks actually performed and untested integration. CI repeats the starter checks, not a complete end-to-end/privacy audit.

## Plans, design and changes

The Markdown database v2/API design are included planning contracts; unresolved implementation constraints remain tracked. Notion links supplement these files without duplicating the entire workspace. Update implementation status as code changes. Keep the forum visually distinct from Church & Gedam Discovery.

Add your existing mockup ZIP to `mockups/archives/` and update [manifest](mockups/MANIFEST.md). No owner-supplied archive is claimed included yet. Do not commit credentials, local databases, private evidence, dependencies or build output. Font-license notices are retained; a project distribution license has not been selected.

**No GitHub remote, public publication or deployment is configured by this package.**
