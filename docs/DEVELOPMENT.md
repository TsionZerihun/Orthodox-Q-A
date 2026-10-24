# Development guide

## Prerequisites
Node >=20.9 and Python >=3.11. Use a virtual environment. Dependencies are locked in frontend/package-lock.json and backend/requirements-lock.txt.

## Start locally
From backend: create/activate .venv, pip install -r requirements-lock.txt, copy .env.example to .env, python manage.py migrate, optionally python manage.py seed_demo, then python manage.py runserver 127.0.0.1:8000.

From frontend in a second terminal: npm ci, copy .env.example to .env.local, npm run dev. Browse http://localhost:3000; original images at /references.

No Supabase values are needed for public browsing. Real sign-in/posting remains gated until Auth is configured or an explicit isolated local adapter is implemented. Never treat simulated email verification as real.

## Checks
Backend: python manage.py check; python manage.py makemigrations --check --dry-run; python manage.py test.
Frontend: npm run typecheck; npm run build. Generate Next types with build first in a clean checkout if required.

## Working practices
- Use feature branches and small coherent commits.
- Preserve .env.example templates, never credentials.
- Do not commit local databases, dependencies, builds or private uploads.
- Commit reviewed migrations with corresponding model changes.
- Update docs/IMPLEMENTATION_STATUS.md and tests for real behavior changes.
- Keep incomplete features labelled; do not fabricate successful writes or badge verification.
- All local setup commands target an isolated development database, never production.
