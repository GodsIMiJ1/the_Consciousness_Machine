# Mood Data Submission Workflow for AURA-BREE Clinic Dashboard

## 1. Overview
This document describes how mood data submissions are collected from the Clinic dashboard, including payload shape, client-side handling, and backend expectations. It also covers fallback behavior when a backend endpoint is unavailable and how data is persisted locally for offline scenarios.

## 2. Payload
The mood submission payload contains:
- mood: integer (1-10) representing the user-reported mood
- notes: string (optional) providing context behind the mood
- timestamp: ISO 8601 string indicating submission time

Example:
{
  "mood": 7,
  "notes": "Feeling hopeful after a breathing exercise",
  "timestamp": "2025-08-28T04:15:00.000Z"
}

## 3. Client-side Flow
- User interacts with a mood slider (range 1-10) and optional notes field.
- On submit:
  - A payload is constructed with mood, notes, and timestamp.
  - An attempt is made to POST the payload to /api/mood.
  - If the server responds with 2xx, a success message is shown and notes are cleared.
  - If the server responds with an error, a fallback path is triggered.
  - If a network error occurs or the server is unreachable, the payload is saved to localStorage under the key aura_mood_submissions, and a success message is shown indicating local persistence.

## 4. API Endpoint (Current Status)
- Endpoint: /api/mood (server-side implementation is not part of this repository yet)
- Expected behavior: return a 2xx status on success, 4xx/5xx on failure.

## 5. Fallback Behavior
- When /api/mood is unavailable, mood payloads are stored in localStorage:
  - Key: aura_mood_submissions
  - Value: JSON array of mood payload objects
- This enables offline-first workflows and ensures data is not lost when connectivity is intermittent.

## 6. Data Persistence
- Local persistence uses localStorage, which is limited to the user’s device.
- Data will remain in localStorage until the backend is reachable and a synchronization process is implemented.

## 7. Validation and Error Handling
- Mood is constrained to a 1-10 range via the UI slider.
- Notes are optional and unstructured text.
- On submission, errors are surfaced to the user with a concise message.
- The UI provides immediate feedback for successful submissions or errors.

## 8. Tests and Verification
- Unit tests should verify:
  - Payload construction from UI state
  - Proper handling of successful backend responses
  - Fallback to localStorage when backend is unavailable
- Integration tests should simulate both online and offline scenarios.
- Consider adding a mock mood API during development to exercise the full flow.

## 9. Deployment Considerations
- Ensure the backend /api/mood endpoint is implemented or wired to a serverless function.
- Consider a synchronization mechanism to flush local mood submissions to the backend when connectivity is restored.
