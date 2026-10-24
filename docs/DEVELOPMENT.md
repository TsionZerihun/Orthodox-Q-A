# Development guide

## Prerequisites
Node ≥ 20.9 and Python ≥ 3.11. Use a virtual environment. Dependencies are locked in `frontend/package-lock.json` and `backend/requirements-lock.txt`.

## Start locally

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

### Frontend (second terminal)

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

Browse http://localhost:3000. Approved reference images: http://localhost:3000/references.

## Demo vs backend
- UI interactions use the **local demo adapter** (`frontend/lib/demo/`) so flows work without Supabase.
- Empty `DATABASE_URL` selects SQLite for isolated Django preview only.
- Real sign-in, email, Storage, and production PostgreSQL remain incomplete until intentionally integrated and verified. Never treat simulated email verification as real.

## Checks

```bash
python manage.py check
```

```bash
python manage.py makemigrations --check --dry-run
```

```bash
python manage.py test
```

```bash
npm run typecheck
```

```bash
npm run build
```

## Working practices
- Use feature branches and small coherent commits.
- Preserve `.env.example` templates; never commit credentials.
- Do not commit local databases, dependencies, builds, or private uploads.
- Commit reviewed migrations with corresponding model changes.
- Update `docs/IMPLEMENTATION_STATUS.md` and tests for real behavior changes.
- Keep incomplete features labelled; do not fabricate successful production writes or verification.
- Target an isolated development database only — never production — unless the owner explicitly directs otherwise.
