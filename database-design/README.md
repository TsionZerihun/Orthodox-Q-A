# Orthodox Q&A — database design diagrams

Architecture diagrams for the forum data model and related flows. These illustrate the planning in [docs/Orthodox_QA_Database_Design_Reviewed_v2.md](../docs/Orthodox_QA_Database_Design_Reviewed_v2.md). They are **design references**, not an implemented live schema.

Application code and migrations remain under `backend/` / `frontend/`. This folder is documentation only.

## Review document

- [DATABASE_ARCHITECTURE_REVIEW.pdf](DATABASE_ARCHITECTURE_REVIEW.pdf) — database architecture review (PDF)

## Diagrams

### 01 · System architecture

![01 System architecture](diagrams/01_system_architecture.png)

### 02 · Identity and teachers

![02 Identity and teachers](diagrams/02_identity_and_teachers.png)

### 03 · Questions and discussion

![03 Questions and discussion](diagrams/03_questions_and_discussion.png)

### 04 · Engagement and notifications

![04 Engagement and notifications](diagrams/04_engagement_and_notifications.png)

### 05 · Files and deletion

![05 Files and deletion](diagrams/05_files_and_deletion.png)

### 06 · Moderation and appeals

![06 Moderation and appeals](diagrams/06_moderation_and_appeals.png)

## Files

| File | Topic |
| --- | --- |
| [diagrams/01_system_architecture.png](diagrams/01_system_architecture.png) | System architecture |
| [diagrams/02_identity_and_teachers.png](diagrams/02_identity_and_teachers.png) | Identity and teachers |
| [diagrams/03_questions_and_discussion.png](diagrams/03_questions_and_discussion.png) | Questions and discussion |
| [diagrams/04_engagement_and_notifications.png](diagrams/04_engagement_and_notifications.png) | Engagement and notifications |
| [diagrams/05_files_and_deletion.png](diagrams/05_files_and_deletion.png) | Files and deletion |
| [diagrams/06_moderation_and_appeals.png](diagrams/06_moderation_and_appeals.png) | Moderation and appeals |

Also see: [API design](../docs/Orthodox_QA_API_Design.md), [architecture decisions](../docs/architecture/DECISIONS.md).
