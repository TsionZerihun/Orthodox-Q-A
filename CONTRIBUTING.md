# Contributing

Read docs/README.md and docs/IMPLEMENTATION_STATUS.md first. Work on one feature branch per coherent change. Use descriptive commits, for example `feat: add question topic filtering`, `fix: preserve anonymous author privacy`, or `docs: link Notion planning pages`.

Before a PR, run backend checks/tests and frontend build/typecheck. Describe the resulting behavior, validation and any remaining limitation. Update tests when permissions, privacy or persistence changes. Do not mark mocked external integration as tested.

Never commit credentials, .env files, local databases, node_modules, virtual environments, build output, private evidence or identifiable moderation records. Keep .env.example tracked. Preserve the approved visual assets and consistency rules.

Do not assume a project license: no open-source license has been selected. Do not copy third-party code/assets without permission; preserve existing font-license notices. CI is a starter check, not a substitute for privacy, security, concurrency or visual verification.
