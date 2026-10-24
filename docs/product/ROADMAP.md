# Roadmap and implementation milestones

Status below reflects the delivered source, not the Notion board's remote state. No dates or owners are invented.

| Milestone | Scope | Status |
| --- | --- | --- |
| Product and visual planning | Requirements, role/privacy decisions, original mockups | Documented; some engineering details remain open |
| Data/API contract | Database v2 and API-design draft | Documented; not fully validated for migrations |
| Initial foundation | Next.js, Django, examples, local public browsing, initial protected question/answer endpoints | Implemented and locally checked within documented scope |
| Local interaction coverage | Forms and simulated service adapters, questions/answers/votes/follows/comments | Incomplete; Supabase setup deferred by owner |
| Full first-release backend | Full reviewed models, permissions, staff cases, jobs, deletion | Incomplete |
| External integration | Supabase Auth/PostgreSQL/Storage, real email flow | Deferred until owner creates/configures development project |
| Full visual implementation | All main screens and supporting states, light/dark/mobile parity | Incomplete; original images retained |
| Integration verification | Privacy, concurrency, accessibility, end-to-end journeys | Partial starter tests only |
| Pilot and release | Teachers/moderators, starter content, policies, backups, monitoring, hosting | Not started |

## Development task groups
1. Repository/environment setup and contract prerequisites.
2. Identity, profiles, roles, account restrictions and verification lifecycle.
3. Topics, questions, anonymous identity, answers, references and attachments.
4. Comments/replies, votes, accepted answers and privacy-safe counts.
5. Search/similarity, feeds, follows/bookmarks, notifications/preferences.
6. Teacher applications/verification/workspace.
7. Reports/moderation, suspensions, appeals, administration, audit history.
8. Account/content deletion, private evidence cleanup and backup replay.
9. Amharic/English, responsive screens, accessibility and approved visual parity.
10. End-to-end tests, email/storage/database integration, policies, deployment and pilot.

See the original development board through [Notion links](../NOTION_LINKS.md); this grouped roadmap is not a full export of every board card.
