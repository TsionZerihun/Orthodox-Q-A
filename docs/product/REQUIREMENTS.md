# Orthodox Q&A — product requirements summary

## Purpose
A calm Ethiopian Orthodox question-and-answer website, welcoming Orthodox and non-Orthodox visitors. This repository is for the forum, not the separate Church & Gedam Discovery application.

## First-release requirements
- Public reading without signup. Verified email before participation. Signup, login/logout, verification pending/resend, recovery and intended-action return.
- Named posting by default; per-question anonymous choice locked after publication. Question author answers/comments/replies inherit anonymous identity with an Author label. Authorized staff can identify anonymous accounts through private audited access.
- Administrator-managed topics; question title, optional details, and 1–3 topics. Topic filtering and similar-question suggestions.
- Questions and answers editable by their owners with Edited label. Answers support references and permitted image attachments. Comments and a single reply level clarify answers.
- Question upvotes distinct from Helpful answer votes. No self-votes. Optional accepted answer by another member; not official Church approval.
- Current verified teacher badges and teacher-only filtering, excluding anonymous self-answers. Teacher applications are private; administrators approve/revoke status. Teachers are not automatically staff.
- Topic/question following, automatic following of own question, private saved questions, in-site notifications and ordinary preferences. Important decision notices mandatory.
- Latest, Trending, Unanswered and Following feeds; search; complete answer pagination and reply expansion.
- Member reporting; scoped moderator/admin actions; independent appeals within 30 days of notice availability; private staff notes and evidence.
- Account deletion detaches retained discussion/post images, removes private account data/evidence and votes, and never reconnects a new account via email.
- Amharic/English interface, responsive layouts, keyboard focus, meaningful alternative text, reduced motion, loading/empty/error states.

## Later release
Reputation points, achievement badges, star ratings, forum email digests and push notifications are not first-release features.

## Visual source of truth
Use [original reference images](../../frontend/public/references/) and [visual checklist](../VISUAL_CHECKLIST.md). Preserve Bible logo, shared line icons, subtle gold top-left card corners, restrained ivory/charcoal themes, quiet background, and spacing. No human/saint figures on account screens. Do not mistake reference-image availability for completed page implementation.

## Detailed contracts
Exact confirmed limits, retention and relationships are in the database v2 document; endpoint contracts are in API Design. [Implementation status](../IMPLEMENTATION_STATUS.md) reports actual code coverage.
