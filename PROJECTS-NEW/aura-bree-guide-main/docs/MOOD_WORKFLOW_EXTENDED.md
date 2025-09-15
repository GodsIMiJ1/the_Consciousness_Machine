# Mood Data Submission Workflow - Extended (Offline Sync, Testing, Accessibility)

## 1. Overview
This document extends the mood data submission workflow described in MOOD_WORKFLOW.md with explicit offline synchronization, testing guidance, accessibility considerations, and deployment/rollback notes.

## 2. Offline Sync Strategy
- Local fallback uses localStorage with the key aura_mood_submissions as a queue.
- Each payload includes mood, notes, timestamp (and can be extended with a unique id in future iterations).
- On application startup or upon connectivity restoration, a sync routine will attempt to POST queued payloads to /api/mood.
- Implement retry/backoff logic to avoid hammering the backend on transient failures.
- If backend becomes available, submitted payloads should be marked as synced and removed from the queue.
- Handling persistent failures: keep items in the queue with metadata (retry count, last_attempt) and expose a developer-facing log or status.

## 3. Data Privacy & Security
- No Personally Identifiable Information (PII) is collected; payload contains mood, optional notes, and a timestamp.
- Data in transit should be transmitted over HTTPS.
- LocalStorage data is not encrypted by default; consider future enhancements to encryption or leveraging platform-provided secure storage.
- Define a retention policy (e.g., purge locally stored mood submissions after successful sync or after 30 days) and implement a cleanup mechanism.

## 4. Testing & Verification
- Unit tests should validate:
  - Payload construction (mood, notes, timestamp)
  - Queue insertion into aura_mood_submissions
  - Correct behavior when /api/mood responds with success or failure
- Integration tests should simulate:
  - Online path: payload posted to /api/mood and queue cleared on success
  - Offline path: payload stored in aura_mood_submissions and retried on connectivity restoration
- Manual QA steps:
  - Submit mood data with and without notes
  - Simulate network failure and verify localStorage persistence
  - Restore network and verify sync behavior from the queue
- Accessibility tests:
  - Ensure the mood slider has visible labels and accessible name attributes
  - All actionable controls are keyboard accessible

## 5. Deployment Considerations
- Implement a serverless or backend endpoint at /api/mood to handle submissions.
- Provide a small onboarding guide for clinical users describing how offline mood submissions are queued and synced.
- Consider a simple dashboard indicator for clinicians showing the number of queued submissions awaiting sync.

## 6. Rollback Plan
- If issues arise after deployment, revert to a mode where mood submissions are only stored locally (no backend submissions attempted) and remove any new features that rely on /api/mood until backend integration is validated.
- Keep a changelog entry describing the rollback and rationale.

## 7. References
- Link back to the primary mood workflow MOOD_WORKFLOW.md for baseline behavior
- Internal implementation notes and TODOs in the project repository
