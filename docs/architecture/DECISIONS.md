# Architecture decisions

## Agreed stack
- Frontend: Next.js / React with TypeScript.
- Backend: Django, responsible for business rules and authorization.
- Target database: Supabase-hosted PostgreSQL.
- Target identity/files: Supabase Auth and Storage.
- Forum API requests go through Django; private service credentials never enter frontend bundles.

## Current delivery versus target
The starter uses minimal models and allows a local SQLite preview when DATABASE_URL is absent. This does not replace the target schema or PostgreSQL. Existing Supabase hooks remain optional and unconfigured. Actual protected writes require verified Supabase identity; no demo authentication bypass is enabled.

The owner explicitly deferred Supabase account creation/integration. Local simulated flows can be built next using isolated adapters, clearly marked simulated and disabled for production. Do not pressure the owner to configure Supabase during the initial repository push.

## Engineering prerequisites
See API Design section 18 and database v2 technical review. In particular: durable content-deletion requests, anonymous-identity access audit, request versions/idempotency, exact feed/search queries, attachment cleanup races, and teacher decision/history dependencies.

## Change policy
Preserve the approved design and privacy requirements. Propose material changes with rationale, implementation impact and validation. Keep Notion snapshots and actual implementation status distinct.
