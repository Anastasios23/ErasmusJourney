# Erasmus Experience Flow

This document explains how form data is stored during the multi‑step Erasmus application and how final submissions are handled.

## Draft Saving

1. When a user opens the form, a single `ErasmusExperience` record is created (or loaded) for that user.
2. Each step – basic information, course matching, accommodation and living expenses – saves its data into the corresponding field on this record via `prisma.erasmusExperience.upsert`.
3. Progress is tracked using `currentStep`, `completedSteps`, `status` and `lastSavedAt` on the same record so users can resume later.

## Final Submission

1. On the **Help Future Students** step the client aggregates all saved sections.
2. The complete payload is sent once to `/api/erasmus-experiences` and the record is marked `COMPLETED` and `SUBMITTED`.
3. For backwards compatibility a consolidated entry is created in the legacy `FormSubmission` table so existing admin tools continue to work.

## Admin View

Admins now only review these consolidated `FormSubmission` entries. Draft data for individual steps is stored solely in `ErasmusExperience` and is not duplicated.

## Migration Notes

- Old step‑level `FormSubmission` rows are no longer created.
- Admin interfaces should read from `FormSubmission` only for finalized submissions; any draft tracking should query `ErasmusExperience` directly.
