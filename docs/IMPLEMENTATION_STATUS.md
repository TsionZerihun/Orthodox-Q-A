# Implementation status — multi-page frontend + local demo

## Working implementation
- Next.js TypeScript app (App Router), Django API (starter), example environment files.
- **All main planned routes** with shared `AppShell` (header, side nav, optional right rail), tokens, logo, parchment corner, Meskel fixed watermark, manuscript card corners, light/dark theme, EN/አማ toggle.
- **Local demo adapter** (`frontend/lib/demo/`): browser-persisted demo state for auth simulation, questions/answers/comments, upvotes vs Helpful, save/follow, notifications, teacher applications, moderation, admin — clearly labeled, isolated from production permissions. Supabase remains deferred.
- Responsive three-column light UI, quieter charcoal theme, open-Bible logo, line icons.
- Account screens (`/account`) without human/saint figures.
- Routes: `/`, `/topics`, `/search`, `/questions/[id]`, `/profile/[id]`, `/saved`, `/settings`, `/account`, `/notifications`, `/teacher`, `/moderation`, `/admin`, `/auth/callback`, `/references`.
- Question list/search/topic selection also available via Django when the API is running; the UI primary path for interactions is the demo adapter so flows work without Supabase.
- Homepage visual direction against Home Light (1586×992): Playfair Display + Source Sans 3, Quora-style sticky columns, fixed Meskel watermark (hidden ≤760px), stepped pale-gold manuscript-corner SVG.
- See **[PAGE_CHECKLIST.md](PAGE_CHECKLIST.md)** for per-page mock mapping, verification status, and recorded gaps.

## Explicitly unfinished / deferred
- Real Supabase Auth email, JWT, Storage uploads, PostgreSQL, RLS, production recovery.
- Exact pixel parity with every mock (topic card illustrations missing as assets; notifications page has no dedicated approved mock).
- Full Amharic copy, rich-text editors, real ranking for Trending/Following, immutable identity edits, staff audit compliance.
- Django remains starter models — not the full reviewed schema.

## Integrity note
Demo mode must never be described as production authentication. SQLite fallback is ONLY for isolated local API preview. Do not mark pages complete solely because a route exists — see PAGE_CHECKLIST evidence columns.

## Checks run (this slice)
- `npm run typecheck` — pass
- `npm run build` — pass (all listed routes)
- Headless screenshots captured for main routes at 1586×992 for visual comparison (see checklist)
- **Requirements audit:** see [FRONTEND_REQUIREMENTS_AUDIT.md](FRONTEND_REQUIREMENTS_AUDIT.md) (live browser + source evidence; Supabase/Git paused)
