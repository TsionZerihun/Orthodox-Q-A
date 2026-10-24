# Page checklist — Orthodox Q&A frontend

Authority: `frontend/public/references/` approved mocks + `docs/product/REQUIREMENTS.md`.  
Inventory and GitHub preview links: `mockups/README.md`.  
Supabase integration is incomplete; interactive flows that need a backend use the **local demo adapter** (`frontend/lib/demo/`). Demo outcomes are simulated and labeled — not production auth, email, uploads, or persistence.

Status legend:
- **implemented** — route + primary UI built against mock
- **verified** — screenshot compared to mock at matching viewport (see Evidence)
- **demo** — interactions update local demo state
- **blocked** — missing approved asset/reference for a detail
- **awaiting-supabase** — real auth/email/storage/API required

| Page | Route | Approved mock | Status | Missing visual / interaction | Evidence / notes |
| --- | --- | --- | --- | --- | --- |
| Home (light) | `/` | `01_home.png` (composite) + single-page mocks in `mockups/` | **implemented · demo · verified** | Exact pixel fidelity not claimed; Following uses demo follows only | Live vs final mock set; Quora sticky; fixed Meskel; corners |
| Home (dark) | `/` + theme | `13_Home_Dark.png` | **implemented · demo** | Further charcoal polish possible | Theme toggle + `data-theme=dark` |
| Home (mobile) | `/` | (responsive requirement) | **implemented · demo** | — | 390×844 screenshot; hamburger + mobile ask |
| Topics | `/topics` | `02_Topics.png` | **implemented · demo** | **Blocked asset:** topic card illustrations not in repo — line icons used | Follow/unfollow demo; recent-in-topic list |
| Search | `/search` | `03_Search_Results.png` | **implemented · demo** | Highlight styling approximate | Header search → `/search?q=`; filters; empty state; pagination |
| Question detail | `/questions/[id]` | `04_Question_Detail.png`, `12_…Long_Scroll.png` | **implemented · demo** | Rich-text toolbar simplified vs mock | Upvote≠Helpful; show-more answers; comments; lightbox; menus |
| Profile | `/profile/[id]` | `05_Profile.png` | **implemented · demo** | Avatar uploads **awaiting-supabase** Storage | Answers/questions tabs; verified badge |
| Saved | `/saved` | `06_Saved_Questions.png` | **implemented · demo** | — | Private list + empty; requires demo sign-in |
| Settings | `/settings` | `07_Settings.png` | **implemented · demo** | Photo upload simulated | Profile / language / security / notifications; **demo role switch** |
| Account access | `/account` | `08_Account_Access_No_Figures.png`, `02_Account_Flow.png` (composite) | **implemented · demo** | Real email **awaiting-supabase**; parchment + watermark from shared assets (no figures) | login / signup / verify / reset |
| Auth callback | `/auth/callback` | (requirement, no dedicated mock) | **implemented · awaiting-supabase** | Needs configured Supabase | Recovery password form |
| Notifications | `/notifications` | **no dedicated mock** | **implemented · demo** | Layout from requirements — gap recorded | Inbox + mark read; essential notices |
| Teacher workspace | `/teacher` | `09_Teacher_Workspace.png` | **implemented · demo** | Evidence upload simulated | Application form or unanswered queue by demo role |
| Moderation | `/moderation` | `10_Moderation.png` | **implemented · demo** | Demo role gate (not production ACL) | Report queue + dismiss/warn/suspend/remove |
| Administration | `/admin` | `11_Administration.png` | **implemented · demo** | Demo role gate | Apps, topics, audit, approve/decline |
| References | `/references` | (meta viewer) | **implemented · verified** | Not product UI | Lists all approved PNGs |

## Interaction coverage (cross-page)

| Flow | Status |
| --- | --- |
| Navigation + browser back/forward (App Router) | demo |
| Search, topic filters, feed tabs | demo |
| Open question + all answers (pagination “show more”) | demo |
| Question upvote vs answer Helpful | demo (separate counters) |
| Post named / anonymous; Author label | demo |
| Answer/comment forms + validation | demo |
| Save / follow | demo |
| Post menus: edit own, report, copy link | demo |
| Image expand + alt text | demo |
| Account / verify-pending / recovery screens | demo (local) · awaiting-supabase for real email |
| Notifications + preferences | demo |
| Teacher application + staff screens | demo (role switch in settings) |
| Language + theme | demo |
| Fixed-background Meskel scroll | preserved |
| Auth pages free of human/saint figures | preserved on `/account` |

## Gaps that must not be invented

1. **Topic card illustrations** in `02_Topics.png` — no approved reusable illustration set beyond line icons; recorded as visual gap.
2. **Dedicated Notifications page mock** — not in the final mock set; UI follows requirements + settings patterns.
3. **Supabase Auth/Storage/PostgreSQL** — deferred by owner; demo adapter isolated from production permissions.
