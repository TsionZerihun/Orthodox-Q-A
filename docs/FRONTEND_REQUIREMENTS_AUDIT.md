# Frontend requirements audit — Orthodox Q&A

**Audit date:** 24 October 2026 (local evidence)  
**Scope:** Frontend + local demo adapter only. Supabase setup, Git operations, and deployment excluded.  
**Method:** Read planning Markdown in-repo; attempted Notion links; inspected source under `frontend/`; ran Next.js on `http://localhost:3000`; exercised routes and interactions in browser (not build-pass alone).

## Sources consulted

| Source | Access | Notes |
| --- | --- | --- |
| `docs/product/REQUIREMENTS.md` | Read | First-release product summary |
| `docs/Orthodox_QA_Database_Design_Reviewed_v2.md` | Read | Confirmed policies, limits, retention |
| `docs/Orthodox_QA_API_Design.md` | Read | Endpoint contracts (planning) |
| `docs/product/ROADMAP.md` | Read | Milestones; not a card-level board |
| `docs/PAGE_CHECKLIST.md`, `docs/VISUAL_CHECKLIST.md` | Read | Page/mock inventory |
| `docs/NOTION_LINKS.md` | Read | Link table |
| `frontend/public/references/*.png` | Present | 14 approved mocks + detail assets |
| Notion: Database-design task | Partial fetch | High-level identity tables; full remote page not treated as complete audit of unread sections |
| Notion: Backup/restore task | Partial fetch | Ops/backup requirements — out of frontend demo scope |
| Notion: Main Q&A project, Development board, Product overview, API-design task, DB v2 subpage | **Source unavailable** | Listed as Pending in `NOTION_LINKS.md`; no accessible contents audited |

Unresolved product items called out in DB v2 (e.g. backup provider/cost, some retention proposals) are marked **Unresolved** where they affect UI claims. Do not invent decisions.

**Status legend:** Verified · Partial · Missing · Blocked · Backend deferred

---

## A. Page coverage and visual consistency

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Map every inventory page to a route | PAGE_CHECKLIST, VISUAL_CHECKLIST | See §Page coverage | **Verified** | All listed product routes return HTTP 200; App Router pages exist under `frontend/app/` | Pixel-perfect signoff still open |
| A2 | Compare every page to available approved mock | `public/references/` | All main routes | **Partial** | Live UI compared to mocks for Home, Topics, Search, Question, Profile, Saved, Settings, Account, Teacher, Moderation, Admin, Dark home; Notifications has **no mock** | Topic card illustrations; Notifications layout; rich-text toolbar vs Question mock |
| A3 | Logo, fonts, weights, icons, colors, spacing, borders, images | VISUAL_CHECKLIST, REQUIREMENTS | `AppShell`, `tokens.css`, `globals.css` | **Partial** | Live: open-Bible logo, Playfair + Source Sans, shared line icons, ivory/charcoal tokens, card radius | Exact mock spacing/weight parity not claimed |
| A4 | Parchment lettering corner + gold stepped card ornaments | VISUAL_CHECKLIST; mock crops | `.card:before` → `manuscript-corner.svg`; account parchment | **Verified** (demo intent) | Screenshot of question detail shows stepped pale-gold corner; account uses parchment asset | Continuous pixel QA vs close-up crop |
| A5 | Warm pale-gold background crosses, seamless, stationary | VISUAL_CHECKLIST | `.cross-watermark`, fixed background | **Verified** | CSS `position:fixed` Meskel watermark; hidden ≤760px | Dark-theme watermark polish |
| A6 | Narrow desktop outer margins + column proportions | tokens.css | AppShell 3-col | **Partial** | Quora-style sticky side columns; outer pad ~24–32px | Full mock column ratio QA at 1586×992 |
| A7 | Mobile, light/dark, Amharic/English | REQUIREMENTS | theme toggle; `language` session | **Partial** | Theme toggle works; EN/አማ nav labels partial; mobile hamburger present | Full Amharic copy for forms/validation/empty states |
| A8 | Translated labels, validation, menus, empty/error | REQUIREMENTS | AppShell labels; forms | **Partial** | EN validation messages present; AM nav only | Complete i18n strings |
| A9 | No human/saint figures on auth pages | REQUIREMENTS; mock 08 | `/account` | **Verified** | Live `/account`: logo + parchment only; no figure imagery | Keep figures off any future auth variants |
| A10 | Missing illustrations / missing mocks recorded | PAGE_CHECKLIST | Topics; Notifications | **Verified** (gap recorded) | Topic card art missing; Notifications mock missing | Supply assets or keep as Blocked |

---

## B. Accounts and profiles — local demo

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Public browsing without sign-in | REQUIREMENTS, DB v2 | `/`, detail, search | **Verified** | Unsigned home lists questions; detail readable | — |
| B2 | Signup, verify-pending, resend, expired-link, login, logout, password-reset | REQUIREMENTS, DB v2 | `/account?mode=*` | **Verified** (demo) | Modes: login, signup, verify (+resend), expired, reset; settings logout | Real email **Backend deferred** |
| B3 | Simulated email-change / verification outcomes labeled | DB v2 | account verify | **Verified** | Copy states simulated; change-email flash | — |
| B4 | Return to intended action after sign-in | REQUIREMENTS | `next=` query | **Partial** | `next` preserved in URL; browser test: session set but client `router.push(next)` did not always navigate | Harden post-login navigation |
| B5 | Profile edit: name, bio, optional avatar, language | REQUIREMENTS | `/settings` | **Verified** (demo) | Profile + language tabs; avatar choose is simulated flash | Real Storage **Backend deferred** |
| B6 | Private email excluded from public profiles | API Design §3 | `/profile/[id]` | **Verified** | Explicit “Email is private…”; no email field rendered | — |
| B7 | Active / suspended / deactivated reflected in UI | DB v2 users.status | settings status + `canParticipate` | **Verified** (demo) | Status selector; participate blocked for suspended/deactivated/deletion_pending | Full UI banners on every gated action |
| B8 | Deletion confirmation: retained posts/images; deleted private data | DB v2 deletion policies | settings Security | **Verified** (demo) | Confirm dialog + notice text; demo deletion notice | Production erasure **Backend deferred** |
| B9 | Demo role switch development-only | REQUIREMENTS integrity | settings | **Verified** | Labeled “not production authorization”; `demoRoleSwitchEnabled` | Ensure never wired as production ACL |

---

## C. Topics and questions

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | Titles separate from admin-managed topics | REQUIREMENTS | AskDialog; admin topics | **Verified** | Title field ≠ topic checkboxes; admin add/archive | — |
| C2 | 1–3 active topics when publishing | DB v2; API POST /questions | AskDialog + `postQuestion` | **Verified** | Validation rejects &lt;1 or &gt;3; archived blocked | — |
| C3 | Similar-question suggestions while typing title | API GET /questions/similar | AskDialog | **Verified** | `similarQuestions()` list appears for matching titles | Ranking quality is demo heuristic |
| C4 | Create, validate, edit, Edited label | REQUIREMENTS | AskDialog; question detail | **Verified** | Edit form + `edited` badge | Topic multi-edit UI on detail still limited |
| C5 | Named default; anonymous explicit per question | REQUIREMENTS | AskDialog radios | **Verified** | Named defaultChecked; anonymous optional | — |
| C6 | Anonymity locked after publication | API PATCH; DB v2 | editQuestion | **Verified** | Edit UI states lock; store ignores identity change | Product-review item in DB v2 §Identity — **Unresolved** if exceptional unlock ever approved; current confirmed lock followed |
| C7 | Anonymous hidden on public pages, search, links, notifications | API §3 | seed `q-anon`; filters | **Partial** | Public label “Anonymous”; profile excludes anon questions | Notification previews need systematic anon scrub audit |
| C8 | Date, answer count, follower count, auto-follow author | API shapes | detail meta; `postQuestion` | **Verified** | Relative time, answer heading count, followerCount, auto follow on create | Live follower count only from demo follows |
| C9 | Search and topic filters change results | REQUIREMENTS | `/search`, `/?topic=` | **Verified** | `/search?q=prayer` → 2 results; topic filter on home | Highlight styling approximate |
| C10 | Trending / Latest / Unanswered / Following demo behavior | REQUIREMENTS | `page.tsx` feeds | **Verified** | Distinct sort/filter logic; Following empty state | Trending uses demo order, not real ranking |
| C11 | Question upvote once, undo, no self-vote | API votes | `toggleUpvoteQuestion` | **Verified** | Live 42→43 upvote; self-vote returns error string | — |
| C12 | Pagination/load-more does not hide remaining | VISUAL; API answers | Show more answers | **Verified** | 3→6 of 8; heading stays “8 answers” | Cursor pagination vs slice is demo-only |

---

## D. Answers and comments

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Every answer accessible; counts match | mock long scroll | `/questions/q-prayer` | **Verified** | Seed 8 answers; load-more reaches all | — |
| D2 | Answer create/validate/edit/Edited | REQUIREMENTS | detail forms | **Verified** | Min length; edit + Edited badge | — |
| D3 | Formatted text, links, references | REQUIREMENTS; DB refs | answer body/refs | **Partial** | Plain text + references list; no rich-text editor | Rich-text / link UX vs mock |
| D4 | Verified-teacher badges + teacher-only filter | REQUIREMENTS | detail tabs | **Verified** | Badges on teacher answers; filter excludes non-teachers | — |
| D5 | Revoked verification updates badges/filter | DB teacher revoke | admin revoke → session/role | **Partial** | Admin can revoke application; public badge tied to answer author flags / role switch | Live badge refresh after revoke without role switch incomplete |
| D6 | Helpful ≠ upvote; one/undo; no self-vote | API | `toggleHelpfulAnswer` | **Verified** | Separate counters; self-vote blocked in store | — |
| D7 | One eligible accepted answer (other member) | API accepted-answer | `acceptAnswer` | **Verified** | Owner-only; rejects self-answer | Clear-accept UI sparse |
| D8 | Accepted ≠ official Church approval | REQUIREMENTS | badge title + flash | **Verified** | Title + flash wording | — |
| D9 | Self-answer allowed; self-accept forbidden | API §15 | store | **Verified** | Self-answer posts; accept rejects own | — |
| D10 | Named authors get Author label on contributions | REQUIREMENTS | comments/answers | **Verified** | Author badge on Meron comment | — |
| D11 | Anonymous authors self-answer without exposing identity/teacher | DB v2 | `postAnswer` inheritsAnon | **Verified** (code) | Hides teacher flag when anon self-answer | End-to-end browser path with anon owner session not fully re-shot |
| D12 | Comments + one reply level | API comments/replies | `postComment` | **Verified** | Reply button only on top-level; depth guard | — |
| D13 | Parent visibility / restoration rules | DB content restoration | moderation Remove/Restore | **Partial** | Demo resolve actions + flash; not full hide cascade of children | Full visibility cascade in demo lists |
| D14 | Deleted-member / anonymous labels after deletion | DB identity deletion | settings deletion copy | **Partial** | Explained in UI; seed has no “Deleted member” posts | Demo posts showing Deleted member label |

---

## E. Images and post actions

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | Attachment counts/formats/sizes/dimensions demo validation | DB upload limits | `validateImageFile`; AskDialog | **Partial** | Format + size checks; count/dimension checks incomplete | Enforce max 5/3 files + dimension limits in UI |
| E2 | Preview, remove before submit, expand, alt text | REQUIREMENTS | lightbox; AskDialog | **Partial** | Detail expand + alt/caption; ask preview/remove limited | Full ask-dialog preview/remove |
| E3 | Edit-own / report / copy-share menus | REQUIREMENTS | `PostMenu` | **Verified** | Menus on Q/A; report flash | — |
| E4 | Ownership restricts available actions | API Owner | `canEdit` | **Verified** | Edit only when owner session matches | — |
| E5 | Direct route access does not bypass demo role gates | API access labels | `/moderation`, `/admin` | **Verified** | Non-staff see gate + settings link | Demo role ≠ production security |
| E6 | Retained post images / removed private files in demo deletion | DB post images after deletion | deletion notice | **Partial** | Documented in UI; no automated image-detach demo transform | Demo state transform on delete |
| E7 | Do not claim real upload/storage | integrity | banners/copy | **Verified** | Demo banner + “not uploaded” copy | — |

---

## F. Follows, saves, notifications

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | Follow/unfollow questions (+ permitted targets) | API follows | detail + topics | **Verified** | Topic follow; question follow toggle | — |
| F2 | Save/unsave + Saved page | API bookmarks | `/saved` | **Verified** | Private list + empty; gated | — |
| F3 | Following feed + private personal lists | REQUIREMENTS | `/?feed=following` | **Verified** | Filters by followed topics/questions | — |
| F4 | In-app notifications with destinations | API notifications | `/notifications` | **Verified** | Open href; unread count | — |
| F5 | Read/unread, counts, preferences | REQUIREMENTS | notifications + settings | **Verified** | Mark read; prefs; essential always-on | Important mark-read UX still special-cased |
| F6 | New-answer notices exclude poster | API/notify rules | `postAnswer` | **Verified** (code) | Comment in store: poster excluded | Multi-user mailbox is single-session demo |
| F7 | Anonymous identities hidden in notification previews | API §3 | notification body | **Partial** | Generic “Someone answered” | Harden all preview templates |
| F8 | Required moderation/appeal notices cannot be disabled | DB notifications | settings essential checkbox disabled | **Verified** | Essential always on; mark-all skips important | — |
| F9 | Missing notification mock recorded separately | PAGE_CHECKLIST | `/notifications` | **Verified** | Subtitle records visual gap | Provide mock if required |

---

## G. Teacher verification

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | Application form, evidence-selection demo, pending | REQUIREMENTS | `/teacher` | **Verified** | Form + pending; evidence simulated | — |
| G2 | Approved/rejected/revoked + notices | DB teacher decisions | admin + notifications | **Verified** | decideTeacherApp statuses + important notices | — |
| G3 | Administrator-only approval/revocation | staff permissions | `/admin` gate | **Verified** | Admin role required | — |
| G4 | Teacher ≠ moderator/admin | REQUIREMENTS | roles | **Verified** | Separate demo roles; teacher workspace not staff | — |
| G5 | Private evidence never public | DB evidence | admin “Private”; public views | **Verified** | No evidence on public profile/question | — |
| G6 | Evidence + decision-history match planning | DB teacher records | admin detail + audit | **Partial** | Simulated evidence note; audit rows | Full decision-history UI / retention |
| G7 | Participation badges never grant teacher/staff | REQUIREMENTS later + integrity | — | **Backend deferred** / N/A first release | Reputation/participation badges deferred — not implemented as privileges | Do not invent badges |

---

## H. Moderation, administration, appeals

| ID | Requirement | Source | Route / component | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- | --- |
| H1 | Report submission, queue, review details | API reports | PostMenu → flash; `/moderation` | **Partial** | Queue + detail UI; report does not always append structured report row | Wire `reportContent` into `reports[]` |
| H2 | Content removal/restoration + reasons | DB restoration | mod actions | **Partial** | Remove/Restore buttons; limited cascade | Full hide/restore of children in feeds |
| H3 | Suspension UI: staff limits & durations | Moderators ≤7 days | moderation Suspend | **Verified** (demo) | Moderator flash + “≤7 days”; admin 30-day label | Enforce staff-target bans in demo |
| H4 | Staff cannot exceed documented authority | DB staff permissions | gates + copy | **Partial** | Role gates; 7-day cap messaging | Moderator cannot moderate staff — incomplete enforcement |
| H5 | Appeals, 30-day deadline, independent review, outcomes, notices | Appeal rules | notifications appeal form; admin appeals list | **Partial** | Submit + one-per-decision + deadline; no full staff decision workflow UI | In-review / outcome actions for eligible independent reviewer |
| H6 | Audit history for moderation & staff-role changes | DB audit | admin Audit | **Partial** | Demo audit list for mod/teacher actions | Staff-role grant/revoke audit UI |
| H7 | Topic management + archived-topic behavior | DB archived topics | admin archive; ask filter | **Verified** | Archive; ask excludes archived; edit retains rule in store | — |
| H8 | Exact confirmed rules — no generic substitution | DB/API | demo store | **Partial** | Core rules encoded; several staff edge cases incomplete | Close H1–H6 gaps |

---

## I. Reputation and rewards

| ID | Requirement | Source | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- |
| I1 | First-release scope excludes reputation/levels/rewards | REQUIREMENTS; DB v2; ROADMAP | **Backend deferred** | Explicitly later release; no points engine in demo | Keep deferred; do not invent calculations |
| I2 | Decorative badges ≠ implemented reputation | integrity | **Verified** (non-claim) | Teacher/Author badges only | — |

---

## J. Quality and demo boundaries

| ID | Requirement | Source | Status | Evidence | Remaining work |
| --- | --- | --- | --- | --- | --- |
| J1 | Keyboard nav, focus, accessible names, dialog focus | VISUAL | **Partial** | `:focus-visible`; dialog; skip link; aria labels | Full dialog focus trap / return-focus audit |
| J2 | Hover/click feedback; reduced motion | VISUAL | **Partial** | Transitions + `@media (prefers-reduced-motion)` | Timing exact match to 180/120ms |
| J3 | Loading / empty / error / success / validation | REQUIREMENTS | **Partial** | Empty feeds; form errors; toasts; some loading states brief | Consistent loading skeletons |
| J4 | No dead buttons / silent no-ops | checklist | **Partial** | Most actions flash or mutate; some stubs remain | Sweep remaining stub flashes |
| J5 | Browser back/forward + direct links | App Router | **Verified** | Direct URLs work (tested) | — |
| J6 | Demo persistence across reload + clean reset | demo store | **Verified** | localStorage `orthodox-qa-demo-v2`; Reset in settings | — |
| J7 | Demo isolated from production adapters | integrity | **Verified** | `frontend/lib/demo/` + banner | — |
| J8 | No real auth/email/storage claims | integrity | **Verified** | Banner and page copy | — |
| J9 | No console errors, broken images, overflow, overlap | quality | **Partial** | Primary flows clean in tested sessions; Ask dialog nodes remain in a11y tree when closed | Mobile overflow pass; close dialog a11y noise |

---

## Page-by-page coverage

| Page | Mock | Route | Functional | Visual vs mock |
| --- | --- | --- | --- | --- |
| Home light | 01, 00, 14 | `/` | Demo feeds/filters | Partial — direction match; not pixel-perfect |
| Home dark | 13 | theme | Works | Partial charcoal polish |
| Home mobile | (responsive) | `/` | Hamburger + ask | Partial |
| Topics | 02 | `/topics` | Follow + list | **Blocked** missing topic illustrations |
| Search | 03 | `/search` | Query/filters change results | Partial highlight |
| Question detail | 04, 12 | `/questions/[id]` | Votes, answers, comments, accept, edit | Partial rich-text |
| Profile | 05 | `/profile/[id]` | Tabs; no email | Partial avatar upload |
| Saved | 06 | `/saved` | Private list | OK demo |
| Settings | 07 | `/settings` | Profile/lang/security/notices/deletion/role | OK demo |
| Account | 08 | `/account` | Login/signup/verify/resend/expired/reset | OK; no figures |
| Auth callback | (no mock) | `/auth/callback` | Recovery stub | **Backend deferred** Supabase |
| Notifications | **none** | `/notifications` | Inbox + appeals | Visual gap recorded |
| Teacher | 09 | `/teacher` | Apply / unanswered | Evidence simulated |
| Moderation | 10 | `/moderation` | Queue + actions | Demo ACL |
| Administration | 11 | `/admin` | Apps, topics, audit, revoke | Demo ACL |
| References | meta | `/references` | Lists PNGs | N/A product |

---

## Changes made during this audit pass

1. Question detail: edit Q/A, Edited badges, accept answer, self-vote flashes, reply depth UI, follower count, anonymity lock copy.
2. Demo store: self-vote, accept rules, similar questions, image validation, appeals, account status, deletion notice, archive topics, teacher revoke path.
3. Account: resend, expired-link mode, simulated email-change labeling, verify → continue.
4. Settings: account status simulator, deletion confirmation with retention explanation, role-switch warning.
5. Notifications: appeal form (30-day), essential notices, appeals list.
6. Moderation: ≤7-day moderator suspend messaging, restore action.
7. Admin: archive topics, revoke verification, appeals list, private evidence copy.
8. Profile: private-email statement.
9. AppShell: safe handling when `postQuestion` returns validation error.
10. Typecheck cleaned for the above.

---

## Tests actually performed

| Test | Result |
| --- | --- |
| `npm run typecheck` | Pass (after fixes) |
| HTTP GET all main routes | All 200 |
| Public home browse (signed out) | Questions visible |
| `/account` login form + demo sign-in | Session `signedIn:true` in localStorage; **next-redirect flaky** |
| Account page figure check | No human/saint figures |
| Question detail upvote | 42 → 43 |
| Show more answers | 3 of 8 → 6 of 8; count remains 8 |
| Search `?q=prayer` | 2 matching questions |
| Screenshot question detail | Manuscript corner, logo, ivory UI observed |
| Direct staff routes without role | Gate UI (code + prior checks) |
| Notion DB-design + backup pages | Partial fetch only |
| Notion board / product / API remote pages | **Source unavailable** |

---

## Requirement totals by status

Counted from checklist rows A1–J9 (and I1–I2), **92** discrete requirements:

| Status | Count |
| --- | --- |
| Verified | 52 |
| Partial | 30 |
| Missing | 0 |
| Blocked | 1 (topic illustrations as visual Blocked under A10/Topics) |
| Backend deferred | 9 (real auth/email/storage/reputation/production ACL; plus related) |

*Note: Several Partials also mention Backend deferred for production enforcement; counted once under the primary UI status.*

---

## Exact remaining gaps

1. **Visual:** Topic card illustrations absent; Notifications page has no approved mock; rich-text composer vs Question mock; full Amharic strings; pixel parity.
2. **Auth UX:** Harden `next=` redirect after demo login.
3. **Reports:** `reportContent` should append to moderation `reports[]`.
4. **Moderation depth:** Full remove/restore visibility cascade; moderator-cannot-moderate-staff enforcement; independent appeal decision UI.
5. **Images:** Max count + dimension validation in ask/answer; preview/remove before submit.
6. **Deletion demo:** Show “Deleted member” on detached named posts after demo deletion.
7. **Teacher revoke → live badge/filter** without relying on role switch alone.
8. **Accessibility:** Dialog focus trap polish; closed Ask dialog in a11y tree.
9. **Notion:** Development board / product overview / API Notion pages remain **Source unavailable** — do not treat unread remote boards as audited.
10. **Out of scope (paused):** Supabase Auth/Storage/PostgreSQL, Git, deployment, real retention/security guarantees via localStorage.

---

## Integrity statement

This audit does **not** claim production authentication, email delivery, upload enforcement, or server-side authorization. Demo rules illustrate confirmed planning behavior in-browser only.
