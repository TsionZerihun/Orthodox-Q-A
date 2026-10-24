# Repository hosting notes

The project remote is the owner’s GitHub repository. Prefer a **private** repository while distribution and licensing are undecided. No project open-source license has been selected.

## Practices
1. Keep secrets out of Git: track only `.env.example` files; never commit `.env`, `.env.local`, SQLite files, private evidence, or dependency/build folders.
2. Do not invent remotes, Notion URLs, licenses, or author identity.
3. Prefer normal pushes; do not force-push or rewrite shared history unless the owner explicitly requests it.
4. If authentication fails, sign in locally with GitHub CLI or the system credential helper — never paste tokens into repository files or chat.
5. Update [NOTION_LINKS.md](NOTION_LINKS.md) when the owner supplies additional planning URLs.

CI under `.github/workflows/` runs starter backend and frontend checks. It does not replace privacy, security, or visual acceptance review.
