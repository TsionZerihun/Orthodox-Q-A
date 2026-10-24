# Orthodox Q&A Forum — API Design Specification

**Status: proposed API contract for engineering review. Planning only.**

This is a separate companion to Database Design Reviewed v2. Do not replace that database document. No endpoints, services, tables, or policies have been implemented by this specification.

## 1. Architecture and responsibilities

Next.js/React presents the interface. Django exposes the forum API and enforces verification, account restrictions, ownership, staff permissions, anonymity, and visibility. Supabase Auth owns signup, login, logout, email verification, recovery, and credential changes. Supabase PostgreSQL stores forum data; Supabase Storage stores validated files.

Base path: `/api/v1`. Supabase Auth operations use the Auth client, not Django password endpoints. Tokens and service credentials never appear in URLs or logs. Django validates the authenticated identity before accessing the linked forum account. Email matching never restores deleted ownership.

This document defines application contracts. Exact supported JWT algorithms, session transport, CORS/CSRF settings, Auth callback URLs, connection pooling, and infrastructure must be verified during implementation; no SDK version or vendor capability is assumed here.

## 2. Shared conventions

### Authentication and access labels

| Label | Meaning |
| --- | --- |
| Public | Anonymous visitors can read currently visible content |
| Account | Authenticated account; endpoint-specific access may permit unverified or restricted members |
| Member | Authenticated, verified email, active account, and action permission |
| Owner | Member plus ownership of the resource |
| Staff | Moderator or administrator, subject to target and action restrictions |
| Admin | Administrator with the required action permission |
| Operator | Separately authorized operational access; no public API implied |

All protected requests are checked server-side, including direct URLs. Staff read access to private records is scoped; no general bypass of private member settings. Suspended accounts can read permitted account notices and appeals, but cannot participate. Deletion-pending accounts cannot create new content/uploads; account-status and permitted recovery/status access are handled explicitly.

### Formats and errors

- JSON requests/responses except authorized file transfers. UTF-8; IDs are UUID strings; timestamps are ISO 8601 UTC strings.
- Lists return `items`, `next_cursor` (string or null), and `has_more`. Proposed limit: default 20, maximum 50. Use stable ordering with ID tie-breakers; cursors must bind the query/filter scope. Exact total is returned only where defined and affordable.
- Public dates are stored as timestamps; display language/date formatting is a frontend concern.
- Create returns 201 with `data`; ordinary read/update returns 200 with `data`; idempotent relationship add/remove returns 204. Asynchronous work returns 202 with a status-resource reference.
- Error form: `{ "error": { "code": "VALIDATION_ERROR", "message": "Check the highlighted fields.", "fields": { "title": ["Enter 10–200 characters."] }, "request_id": "opaque-id" } }`.
- 400 malformed request/validation; 401 missing/invalid identity; 403 known authenticated action denied; 404 absent or deliberately concealed resource; 409 state/version/uniqueness conflict; 413 excessive payload; 415 unsupported media type; 429 rate limit with Retry-After; 503 retryable temporary failure. Do not disclose private resource existence through error differences.
- Unknown write fields are rejected. Author IDs, verification flags, roles, counts, timestamps, and derived author markers cannot be assigned by the browser.
- Required text is trimmed, Unicode-aware, and counted as visible text under one shared algorithm. Specify the algorithm before implementation. Formatting must use a documented safe representation; reject dangerous links/markup. Never execute raw submitted HTML.

### Concurrency and retries

- Mutable resource responses include opaque `version`; PATCH uses `If-Match`. Stale edits return 409 `EDIT_CONFLICT` and preserve the client draft. Exact version storage belongs to implementation design.
- Retry-sensitive POST requests accept `Idempotency-Key`. Scope it to account, method, and path; same key/different payload returns 409. Retention/replay windows are operational prerequisites.
- PUT and DELETE relationship requests are idempotent: repeated requests do not toggle state.
- Commit content changes, audit decisions, and durable notification work transactionally. Auth/Storage work uses durable resumable jobs rather than pretending external actions share a database transaction.

## 3. Public response privacy

Question shape: `id, title, body, status, author, is_anonymous, topics[], images[], answer_count, upvote_count, follower_count, accepted_answer_id, created_at, edited_at, version, viewer`.

Answer shape: `id, question_id, body, author, references[], images[], helpful_count, comment_count, is_accepted, created_at, edited_at, version, viewer`.

Comment shape: `id, answer_id, parent_comment_id, body, author, reply_count, created_at, edited_at, version, viewer`.

- Named author: `display_name`, permitted public `profile_id`, `is_question_author`, and public teacher badge where allowed. No emails or Auth IDs.
- Anonymous question: author object has display label Anonymous, no profile ID, avatar, teacher flag, account ID, or identifying links. Author's answers/comments/replies use Anonymous author and an Author badge, never teacher status.
- Deleted named author: Deleted member without identifying links or teacher badge. Anonymous author markers survive account detachment.
- Anonymity applies to search, feeds, profiles, notifications, file metadata, and API payloads, not merely hidden HTML.
- `viewer` contains server-computed capabilities and current user's vote/follow/bookmark state; absent/default for visitors. It is never authoritative for authorization of a later action.
- Images return opaque attachment IDs, dimensions, alternative text, and authorized delivery information. Do not expose internal uploader/account metadata or private storage paths. Public post images retained after account deletion remain subject to privacy reports.
- Counts include eligible visible records only. Top-level comment and reply counts are distinct. Child visibility follows the parent-removal versus permanent-placeholder policies.
- Public response shapes are allowlists. Staff identification of anonymous accounts requires a separate authorized audit-logged request.

## 4. Authentication and account

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| POST | /me/bootstrap | Account | No email/password fields; optional display_name, preferred_language | 200 account/profile/preferences; idempotently creates linked forum records from trusted identity |
| GET | /me | Account | None | 200 private account state, verification state, profile, permissions; restricted accounts receive only allowed account data |
| PATCH | /me/profile | Member | display_name, biography, preferred_language; If-Match | 200 updated profile; no roles, email, teacher status, or avatar foreign key accepted |
| GET | /profiles/{profile_id} | Public | None | 200 public profile and currently visible non-anonymous contributions; deleted/deactivated-profile visibility checked |
| POST | /me/deletion | Account | Explicit confirmation; Idempotency-Key; fresh authentication requirement defined at implementation | 202 deletion status URL; begins verified ownership erasure flow |
| GET | /me/deletion-status | Account | None | 200 allowed deletion status while authentication exists; no unauthenticated lookup by email |

## 5. Topics, feeds and search

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| GET | /topics | Public | q, cursor, limit | 200 active topic list; archived topics discoverable only where referenced or explicitly requested |
| GET | /topics/{topic_id} | Public | None | 200 topic details and archived label |
| GET | /questions | Public | feed=latest / trending / unanswered, topic_ids, q, cursor, limit | 200 visible questions; proposal: topic_ids matches any selected topic, documented consistently |
| GET | /me/following-feed | Member | cursor, limit | 200 visible questions matching followed topics or questions; deduplicate results |
| GET | /search | Public | q, topic_ids, teacher_only, cursor, limit | 200 typed question/answer results using explicit privacy-safe serializers |
| GET | /questions/similar | Public | title, limit | 200 small list of visible similar questions; no unpublished/removed text |

## 6. Questions, answers and references

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| POST | /questions | Member | title, body, is_anonymous, topic_ids[1..3], attachment_ids[0..5] | 201 question; author follows automatically; default is_anonymous=false |
| GET | /questions/{question_id} | Public | None | 200 question detail or permitted deletion placeholder |
| PATCH | /questions/{question_id} | Owner | title, body, topic_ids, attachment_ids; If-Match | 200 updated question; is_anonymous locked after publication |
| GET | /questions/{question_id}/answers | Public | teacher_only, sort=helpful / oldest / newest, cursor, limit | 200 visible answers; counts/has_more support Show more answers |
| POST | /questions/{question_id}/answers | Member | body, references[], attachment_ids[0..3] | 201 answer; no new answers on removed/deleted questions |
| GET | /answers/{answer_id} | Public | None | 200 visible answer with parent context |
| PATCH | /answers/{answer_id} | Owner | body, references[], attachment_ids; If-Match | 200 answer; cannot change question or derived author identity |
| PUT | /questions/{question_id}/accepted-answer | Owner | answer_id | 200 selection; same-question published answer by another member only |
| DELETE | /questions/{question_id}/accepted-answer | Owner | None | 204; clears selection idempotently |
| POST | /content-deletion-requests | Member | target_type, target_id, reason | 201 private request; member must own target; no automatic permanent deletion |
| GET | /me/content-deletion-requests | Account | cursor, limit | 200 own request status; restricted read permitted |

## 7. Comments and replies

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| GET | /answers/{answer_id}/comments | Public | cursor, limit | 200 top-level comments/placeholders with reply counts |
| POST | /answers/{answer_id}/comments | Member | body | 201 top-level comment; no attachments |
| GET | /comments/{comment_id}/replies | Public | cursor, limit | 200 published replies under permitted thread |
| POST | /comments/{comment_id}/replies | Member | body | 201 reply to top-level published comment on published parent answer/question |
| PATCH | /comments/{comment_id} | Owner | body; If-Match | 200 edit; cannot move between answers or change parent |

## 8. Votes, follows and bookmarks

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| PUT | /questions/{question_id}/upvote | Member | None | 204 add once; no self-vote |
| DELETE | /questions/{question_id}/upvote | Member | None | 204 undo own vote |
| PUT | /answers/{answer_id}/helpful | Member | None | 204 add once; no self-vote |
| DELETE | /answers/{answer_id}/helpful | Member | None | 204 undo own vote |
| PUT | /topics/{topic_id}/follow | Member | None | 204; cannot newly follow archived topic |
| DELETE | /topics/{topic_id}/follow | Member | None | 204 unfollow |
| PUT | /questions/{question_id}/follow | Member | None | 204 follow visible published question |
| DELETE | /questions/{question_id}/follow | Member | None | 204 unfollow own association |
| PUT | /questions/{question_id}/bookmark | Member | None | 204 save independently of following |
| DELETE | /questions/{question_id}/bookmark | Member | None | 204 unsave |
| GET | /me/bookmarks | Member | cursor, limit | 200 private list without exposing unavailable text |
| GET | /me/follows | Member | kind=topics / questions, cursor, limit | 200 private follow list |

## 9. Notifications

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| GET | /me/notifications | Account | unread_only, cursor, limit | 200 own inbox; suspended members retain important-notice access |
| GET | /me/notifications/unread-count | Account | None | 200 count for permitted own inbox |
| PUT | /me/notifications/{notification_id}/read | Account | None | 204 mark own notice read; does not change first availability |
| POST | /me/notifications/read-all | Account | through_available_at | 200 marked count; optional cutoff prevents marking unseen later arrivals |
| GET | /me/notification-preferences | Account | None | 200 own ordinary preferences |
| PATCH | /me/notification-preferences | Member | new_answers, comment_replies | 200 preferences; no disable-important field |

## 10. Uploads and image management

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| POST | /uploads | Member | purpose, content_type, size_bytes; optional intended destination ID | 201 attachment_id and authorized upload instructions; evidence purposes scoped to applicant |
| POST | /uploads/{attachment_id}/complete | Member | Completion marker; actual file verified server-side | 202 validation/processing status URL; caller must own pending upload |
| GET | /uploads/{attachment_id} | Account | None | 200 owner-authorized processing state; private evidence also permits authorized admin review |
| DELETE | /uploads/{attachment_id} | Member | None | 202 cancel own unused upload and queue cleanup; attached files changed through parent operations |
| PATCH | /attachments/{attachment_id}/description | Owner | alt_text; If-Match | 200 description; ownership resolved through parent use |
| GET | /attachments/{attachment_id}/access | Public or authorized private reader | variant=display / thumbnail / primary | 200 short-lived delivery authorization or redirect after current access checks |
| PUT | /me/profile-photo | Member | validated attachment_id | 200 current photo; atomic replacement and old-object cleanup |
| DELETE | /me/profile-photo | Member | None | 204 remove association; durable cleanup queued |

## 11. Teacher applications and decisions

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| POST | /teacher-applications | Member | application_details, evidence_attachment_ids[0..5] | 201 pending application; one pending and no active verification |
| GET | /me/teacher-applications | Account | cursor, limit | 200 own applications without private internal notes |
| GET | /teacher-applications/{application_id} | Applicant or Admin | None | 200 scoped application details; internal notes admin-only |
| POST | /teacher-applications/{application_id}/withdraw | Owner | If-Match | 200 withdrawn if still pending |
| GET | /teacher-decisions/{decision_id} | Affected account or Admin | None | 200 exact decision, notice time, deadline, appeal eligibility; private notes separately scoped |
| GET | /teacher-workspace/questions | Verified Teacher | topic_ids, cursor, limit | 200 visible unanswered questions; verification is not a staff role |

## 12. Reports, deletion requests and appeals

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| POST | /reports | Member | target_type, target_id, reason_code, details | 201 report; duplicate open report returns 409; reporter identity never public |
| GET | /me/moderation-decisions | Account | cursor, limit | 200 own notices/decisions; restricted accounts allowed |
| GET | /moderation-decisions/{decision_id} | Affected account or Staff | None | 200 scoped explanation and appeal availability; no reporter/private notes for member |
| POST | /appeals | Account | decision_type=moderation / teacher, decision_id, explanation | 201 appeal; affected verified identity including suspended/deactivated permitted where Auth exists |
| GET | /me/appeals | Account | cursor, limit | 200 own appeals |
| GET | /appeals/{appeal_id} | Appellant or eligible Staff | None | 200 scoped appeal and supporting history |
| POST | /appeals/{appeal_id}/supporting-information | Account | body | 201 own addition while pending/in_review; no file attachments |

## 13. Moderation and administrator endpoints

| Method | Path | Access | Request / query | Result |
| --- | --- | --- | --- | --- |
| GET | /staff/reports | Staff | status, target_type, cursor, limit | 200 authorized queue |
| GET | /staff/reports/{report_id} | Staff | None | 200 report and relevant case details |
| PATCH | /staff/reports/{report_id} | Staff | status, reason_code; If-Match | 200 transition with audit record; cannot alter reporter submission |
| POST | /staff/moderation-actions | Staff | action_type, target_type, target_id, reason_code, explanation, internal_notes, optional ends_at, reverses_action_id | 201 immutable action; enforce 7-day moderator and staff-target restrictions |
| POST | /admin/permanent-content-deletions | Admin | request_id or target reference, reason_code, explanation | 202 authorized erase request; preserve discussion placeholders and retention holds |
| GET | /staff/content-deletion-requests | Staff | status, cursor, limit | 200 scoped queue; only admins authorize permanent erase |
| POST | /staff/content-deletion-requests/{request_id}/decision | Admin | approve / reject, explanation; If-Match | 200/202 decision; erasure queued if approved |
| GET | /staff/appeals | Staff | status, cursor, limit | 200 eligible review queue |
| POST | /staff/appeals/{appeal_id}/start-review | Eligible Staff | If-Match | 200 assign independent reviewer; in_review |
| POST | /staff/appeals/{appeal_id}/decision | Eligible Staff | approved / rejected, decision_explanation; If-Match | 200 outcome plus transactional corrective action |
| GET | /admin/teacher-applications | Admin | status, cursor, limit | 200 application review queue |
| POST | /admin/teacher-applications/{application_id}/decision | Admin | approved / rejected, reason_code, explanation, internal_notes; If-Match | 201 teacher decision; approval creates verification atomically |
| POST | /admin/teacher-verifications/{verification_id}/revoke | Admin | reason_code, explanation, internal_notes; If-Match | 201 revocation decision and mandatory-notice work |
| POST | /admin/topics | Admin | slug, name_en, name_am, descriptions | 201 topic |
| PATCH | /admin/topics/{topic_id} | Admin | names, descriptions, is_active; If-Match | 200 topic; stable slug changes need explicit URL strategy |
| PUT | /admin/users/{user_id}/roles/{role_code} | Admin | reason_code, reason | 204 grant with atomic audit event |
| DELETE | /admin/users/{user_id}/roles/{role_code} | Admin | reason_code, reason | 204 revoke with atomic audit event |
| GET | /admin/staff-role-audit | Admin | target_user_id, cursor, limit | 200 private minimized audit history |
| POST | /staff/anonymous-identity-access | Staff | target_type, target_id, access_reason | 200 authorized internal identity; audit access and deny erased accounts |
| GET | /staff/dashboard | Staff | None | 200 permitted aggregate queues; no unrelated private data |
| GET | /admin/dashboard | Admin | None | 200 approved operational aggregates; operator secrets/logs excluded |

## 14. Payload examples

### Create a question

```json
{
  "title": "Why do we fast before receiving Communion?",
  "body": "I would like to understand the preparation.",
  "is_anonymous": false,
  "topic_ids": ["<topic-uuid>"],
  "attachment_ids": []
}
```

On anonymous submission, the public response excludes the author's profile identifier. The authenticated author can still manage it through private ownership/capability fields; do not leak ownership to other viewers.

### Add an answer

```json
{
  "body": "An answer with enough text to satisfy the minimum length.",
  "references": [
    {"source_title": "Gospel of Matthew", "citation_text": "Matthew 6:16–18", "url": "", "position": 1}
  ],
  "attachment_ids": []
}
```

Reference maximum 10; title 200, citation 1,000, URL 2,048 characters. Each reference requires a title and citation or permitted URL. The placeholder UUID above is illustrative, not a valid submitted identifier.

### List envelope

```json
{
  "items": [],
  "next_cursor": null,
  "has_more": false
}
```

Question pages request a limited first batch of answers. The interface uses has_more/next_cursor and the eligible answer count to show “Show more answers”; it must not display an apparently complete 8-answer discussion after loading only a subset. Filtered teacher counts and overall counts are named separately.

## 15. Limits and visibility rules

- Title 10–200; question body optional up to 10,000; answer 10–20,000; comment/reply 1–2,000; name 2–50; biography 500 characters.
- Topics: 1–3 at publication; existing archived associations can remain within the total. Newly added topics must be active; removed archived associations cannot be re-added.
- Question/answer images: 5/3, up to 5 MB each; JPG/PNG/WebP. Profile: one up to 2 MB. Evidence: five up to 10 MB each, PDF/JPG/PNG. No comment/reply attachments.
- Image maximum 8,000 pixels per side and 25 million pixels total. Post display longest side up to 2,048; thumbnails up to 480; square profile up to 512 with no upscaling. Validate type/size/dimensions before processing; sanitize metadata.
- Removal hides question/answer descendants without rewriting their individual statuses. Restore only still-published descendants. Removed comment placeholders may retain visible published replies under otherwise visible parents.
- Permanent erasure can leave a redacted parent placeholder with surviving discussion. Clear accepted-answer selections on removed/deleted answers; never restore automatically. Retain an existing selection when its question author account is erased.
- New answers/comments are not allowed under a deleted question placeholder, even if surviving discussion can still be read.
- Public post images survive account deletion detached from uploader; profile/evidence files do not. Private evidence never has automatic expiry while the account exists.
- A self-answer is permitted; self-voting and accepting a self-answer are forbidden. An anonymous self-answer must never be exposed through teacher-only filtering.

## 16. Decision and appeal workflows

1. Save moderation/teacher decision and durable mandatory-notice work together.
2. Deliver notice idempotently; record first availability and the same timestamp on the exact decision.
3. Compute appeal eligibility from affected identity, eligible type, original availability plus 30 days, and absence of an existing appeal.
4. Permit supporting text additions while pending/in_review. Preserve history with privacy-redaction exceptions.
5. Independent reviewer rules apply; teacher/staff-related cases need an independent administrator. No reviewer available means pending escalation, not automatic rejection.
6. Appeal approval records a new reversal/corrective decision; original decision remains. Teacher reinstatement updates current state without erasing revocation history. No new replacement account inherits any case.
7. Important notices stay accessible for the decision-retention period. Ordinary notices expire after 90 days. Delete a recipient's notices when their account is erased.

## 17. Failure handling and domain codes

| Code | HTTP | Behavior |
| --- | --- | --- |
| AUTH_REQUIRED / INVALID_SESSION | 401 | Sign in or refresh session through Auth; retry only if valid |
| EMAIL_VERIFICATION_REQUIRED | 403 | Offer verification-pending/resend flow |
| ACCOUNT_RESTRICTED | 403 | Explain permitted restriction without internal notes |
| RESOURCE_NOT_FOUND | 404 | Same response for missing/concealed private resources |
| VALIDATION_ERROR | 400 | Field errors; preserve draft |
| EDIT_CONFLICT | 409 | Fetch latest, let author reconcile; do not silently overwrite |
| DUPLICATE_PENDING_APPLICATION | 409 | Link own pending application |
| ALREADY_APPEALED / APPEAL_WINDOW_CLOSED | 409 | Explain own eligible decision state |
| INVALID_TRANSITION | 409 | Reject outdated review/restoration action |
| UPLOAD_NOT_READY / UPLOAD_RESERVED_FOR_DELETION | 409 | Prevent attaching incomplete/cleanup-reserved object |
| FILE_TOO_LARGE | 413 | Show confirmed per-purpose limits |
| UNSUPPORTED_FILE_TYPE | 415 | Reject actual type mismatch |
| RATE_LIMITED | 429 | Respect Retry-After; do not auto-loop |
| TEMPORARY_UNAVAILABLE | 503 | Controlled retry with idempotency protection |

Do not put personal content, tokens, private evidence, storage download signatures, or identifying anonymous data into error logs. Rate limits must be specified per action before launch; do not invent provider quotas.

## 18. Database prerequisites identified by API design

These are engineering additions/clarifications for the implementation checklist, not a request to re-import Database v2.

- Content deletion requests require durable records: id, requester (nullable after erasure), target type/reference, explanation, state, reviewer, outcome, and timestamps. Define state/retention with the same deletion/moderation safeguards; do not hide a destructive operation behind an unrecorded request.
- Anonymous-identity lookups require private access audit events with actor, target, purpose category and timestamp, subject to minimization/retention. A GET alone must not bypass audit.
- Resource versions and Idempotency-Key records need a precise concurrency/replay design; never put persistent client-controlled author or privilege fields into content.
- Upload reservation, worker leases, validated-unattached state, object-locator registry, expiry and cleanup races must be resolved before file endpoints are implemented.
- Define immutable teacher decision targets and consistent current-state pointers; appeal targets and notice availability must be atomic and retry-safe.
- Decide the minimum operational request/audit payload limits, case-note retention, retry windows, and recovery-log schema in implementation planning.
- Authentication deletion must block delayed bootstrap recreation and retain only minimal opaque operational identifiers until external cleanup and backup-replay needs expire.
- Do not count this document as verification that DB constraints or storage access policies already work.

## 19. Frontend behavior and accessibility

- Amharic/English switch localizes interface and server error codes. User content is not automatically translated. language preference is private member data.
- Sign-in returns to a validated same-site intended action; do not accept arbitrary redirect URLs.
- Distinguish question Upvote from answer Helpful; selected state comes from viewer fields. Anonymous visitors prompted to sign in for participation.
- Preserve drafts on validation/network errors. Do not optimistically publish a teacher badge, accepted answer, or irreversible moderation change without server confirmation.
- Handle loading, empty, unavailable, conflict, expired-upload, and retry states. Keyboard focus, expanded images, alternative text and reply expansion remain accessible.
- Read-only/public responses must not be cached together with user-specific viewer state or private data. Define public cache keys and private/no-store behavior during implementation.
- Respect reduced-motion settings; the approved visual design does not change the API privacy rules.

## 20. Contract review and implementation acceptance

- [ ] Endpoint naming, pagination, versions, and errors agreed as a contract.
- [ ] Proposed query behavior, pagination defaults and teacher workspace semantics reviewed.
- [ ] Auth token/session transport and verification freshness defined using current official documentation at implementation time.
- [ ] Exact request/response schemas converted to OpenAPI with no password-handling Django endpoints.
- [ ] Permission matrix tested for visitor, unverified, member, teacher, suspended, deleting, moderator, and admin states.
- [ ] Anonymous identity absent from every public payload/cache/profile/notification/file path.
- [ ] Concurrent votes, topic edits, accepted-answer writes, moderation, reinstatement and account deletion covered by integration tests.
- [ ] Job retries, redaction and storage cleanup fail safely; backup-replay procedure verified.
- [ ] Similar-question search, Amharic search, trending, unanswered definition and ranking documented without unsupported promises.
- [ ] Rate limits, safe content format, file scanning/validation policy, and logging boundaries specified.
- [ ] No final migration approval inferred from API planning.

## 21. Where this belongs in Notion

Create one task or subpage named **Design API contracts and permissions**, linked from the existing database-design task. Keep its status In Progress until contract review is complete. Its deliverable is this document plus eventual validated OpenAPI—not a replacement database import.

**Guardrail:** No services, tables, storage policies, endpoints, or production resources are created by this planning document.
