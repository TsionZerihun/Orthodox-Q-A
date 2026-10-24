Prepare and push this existing Orthodox Q&A starter repository to my GitHub using a professional initial repository structure.

Read AGENTS.md, README.md, docs/README.md, docs/IMPLEMENTATION_STATUS.md, docs/GITHUB_SETUP.md, docs/NOTION_LINKS.md and mockups/README.md before changing anything. This is the Orthodox Q&A forum, separate from Church & Gedam Discovery. Do not redesign it or claim the full project is finished.

I will provide the exact GitHub repository/owner, Notion links, and the chosen mockup ZIP. Ask once in a bundled question for any missing required values. Do not invent URLs or silently publish publicly. Prefer private if I authorize creation without a visibility preference, and state that choice.

1. Inspect the folder, current Git state, branch, remotes and existing changes. Do not discard changes or reinitialize an existing repository. Keep frontend/, backend/, docs/, mockups/ and .github/ organized.
2. Add my Notion links to docs/NOTION_LINKS.md. Do not scrape/copy the whole Notion workspace. The versioned Markdown files contain the requirements/roadmap/database/API plans needed for implementation. Do not modify their approved product rules simply to match incomplete code.
3. Copy my supplied mockup ZIP into mockups/archives/ with a clear filename and update mockups/MANIFEST.md. Original PNGs already exist in frontend/public/references/; preserve them and shared icons/logo/fonts. If I have not supplied the ZIP, report it missing instead of claiming inclusion.
4. Check .gitignore and staged files. Exclude all actual credentials/env files, private data, local SQLite DBs, node_modules, .next, .venv, caches and temporary files. Keep environment examples, package-lock, Python requirements lock, reviewed initial migrations and font licenses. Inspect archives for secrets before tracking. Never commit local tool caches or huge dependencies.
5. Supabase is deliberately deferred. No Supabase account creation, keys, deployment or live-data changes are required for this push. Existing optional integration code can remain unconfigured. Local public browsing works; complete simulated workflows later behind isolated development-only adapters. Never add a production auth bypass.
6. Run Django check, migration drift check and tests; frontend npm ci, production build and typecheck. Record actual results in docs/VERIFICATION.md. Do not represent real email/PostgreSQL/Storage integration as verified without testing it.
7. Ensure README/docs links and mockup manifest are correct. Verify starter GitHub Actions configuration. No license has been selected; do not invent an MIT or other license. Confirm author identity locally if Git requires it, without changing global configuration.
8. Initialize main only if needed. Show a short staged-file summary, then commit the reviewed initial source/docs/design assets. Use commit message: chore: initialize Orthodox Q&A foundation and project documentation.
9. Use the exact GitHub remote I authorize. Push normally; no force push, deletion, history rewrite or overwrite of an existing remote. If the remote is nonempty, inspect history and use a safe branch/PR approach. Missing authentication must be handled through my local sign-in, never asking me to paste secrets.
10. Return repository URL, branch, commit SHA and checks actually passed, plus remaining incomplete features. Do not deploy.

Be concise. I want setup and the first GitHub push now, not a React lesson. Afterward use CURSOR_MASTER_PROMPT.md for development, preserving the approved mockups and every documented detail.
