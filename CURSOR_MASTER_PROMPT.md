# Development continuation prompt

First-push instructions are in CURSOR_GITHUB_PROMPT.md. Supabase setup is deferred; do not require account creation now. User paused learn-and-build lessons and wants the packaged code first. Treat the integration notes below as later tasks, not immediate prerequisites for the first push.

You are continuing an Orthodox Q&A forum project, not redesigning it.

First read README.md, docs/IMPLEMENTATION_STATUS.md, docs/VISUAL_CHECKLIST.md, docs/Orthodox_QA_Database_Design_Reviewed_v2.md, and docs/Orthodox_QA_API_Design.md. Inspect every original PNG in frontend/public/references. User cares deeply about consistent logo, icons, top-left gold card corners, manuscript details, type, light/dark styling, spacing and animations. Account screens must not have saint/human figures. Do not replace the approved visual language with a generic template. Open /references for comparisons.

1. Identify environment (Mac expected). Check Node >=20.9, Python >=3.11, npm, venv. Install using committed package-lock.json and backend requirements-lock.txt when present. Never request pasted secrets; guide .env.local/.env setup with Supabase public configuration and a local/Supabase development DB. Never put service-role keys in the frontend.
2. Run backend checks/tests and frontend typecheck/build. Start Django at localhost:8000 and Next at localhost:3000. Do not silently kill unrelated services. Display clear errors.
3. Review starter limitations before changing anything. This is NOT a finished 88-endpoint implementation. It intentionally has minimal starter models; migrate toward reviewed full models in a disposable development DB, not production. Resolve the documented technical prerequisites before claiming full schema fidelity. Preserve contributions, anonymity, teacher-decision history and restricted evidence.
4. When the owner later authorizes Supabase setup, verify real signup, verification link, sign-in, password recovery, question posting and answering against a user-configured Supabase development project. Supabase redirect allowlist needs localhost:3000/auth/callback; no production changes without instruction. Verify rejection of unverified/restricted accounts and no public anonymous identifiers. Add resend/change-email and intended-action/draft return. No demo login bypass.
5. Build remaining features in tested vertical slices from API/schema specs. Mark explicit limitations accurately. Every visible control must either work or state its unfinished status; never fabricate writes or live badge status.
6. Use shared components/tokens for the entire site. Compare desktop/mobile, light/dark and interaction screenshots to references. Preserve reference images as evidence. Report any mismatch rather than claim pixel-perfect fidelity. No screenshot flattened as app UI.
7. User prefers concise progress updates, one complete result, not many micro-prompts or repeated Notion imports. Maintain a single implementation checklist. Tests must cover privacy/permissions/concurrency and real behavior, not implementation mirroring.

Deliver a short status with working URLs, checks run, real external integrations verified or blocked, and remaining features. Do not deploy, purchase hosting, send messages, or change live data without explicit scope.
