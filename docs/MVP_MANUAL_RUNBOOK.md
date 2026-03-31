# MVP Manual Signoff Runbook

Use this runbook after the automated gate is green. It is designed to take about 10 to 15 minutes and maps directly to the 4 manual MVP checks.

## Prep

Run this local setup first:

```bash
npm run db:docker:up
npm run db:push
npm run db:seed:proof
npm run dev
```

Equivalent shortcut for the database/setup part:

```bash
npm run mvp:signoff:prep
```

Use two browser sessions:

- student session: normal browser window
- admin session: private/incognito window

Default admin credentials after `npm run db:push`:

- email: `admin@erasmusjourney.com`
- password: `ChangeMe123!`

Use one fresh Cyprus student account for this run. Prefer a supported domain such as `manual.student@ucy.ac.cy`.

## 1. Student Draft Save Submit

Goal: prove the student path works from login to real submit.

Actions:

1. In the student session, register or sign in with the fresh Cyprus student account.
2. Open `/share-experience?step=1`.
3. Complete Step 1 and click `Save draft`.
4. Refresh and confirm Step 1 data is restored.
5. Continue to Step 3, click `Save draft`, refresh, and confirm the Step 3 data is restored.
6. Continue to Step 4, click `Save draft`, refresh, and confirm the Step 4 data is restored.
7. Continue to Step 5, complete the required fields, and click `Submit experience`.

Pass if:

- Step 1 loads valid departments and host options for the student
- the draft survives refreshes at Steps 1, 3, and 4
- Step 5 ends on `/submission-confirmation?submitted=true`
- the page shows `Submission Successful!`

Record:

- submitted student email
- host city and country
- resulting destination slug if visible

## 2. Admin Preview Approve

Goal: prove moderation-before-publication works clearly.

Actions:

1. In the admin session, sign in and open `/admin/review-submissions`.
2. Confirm the new submission appears in the submitted list.
3. Open the submission detail.
4. In `Projected Public Impact`, read the `before` and `after` state for destination, accommodation, and courses.
5. If the preview is unavailable because destination identity is incomplete, stop and fail this run.
6. Approve the submission.

Pass if:

- the submission is reviewable only from the admin route
- preview clearly shows the projected public change
- approval succeeds without requiring extra workaround steps
- if you test reject or revision separately, feedback is required before the action is accepted

Record:

- destination slug from the preview
- `before` submission count
- `after` submission count

## 3. Approved Submission On Public Pages

Goal: prove the approved result matches the preview and reaches every canonical public page.

Actions:

1. Open `/destinations` and find the previewed destination.
2. Open `/destinations/[slug]`.
3. Open `/destinations/[slug]/accommodation`.
4. Open `/destinations/[slug]/courses`.
5. Compare what you see with the `after` state from the admin preview.

Pass if:

- the destination list reflects the approved submission count you just approved
- the destination overview matches the previewed `after` summary
- the accommodation page reflects the expected housing contribution
- the courses page reflects the expected course mapping contribution
- no student identity or exact accommodation address is exposed publicly

Record:

- whether counts matched preview exactly
- any mismatch between preview and public pages

## 4. Database Down Fails Safely

Goal: prove the app fails honestly when persistence is unavailable.

Actions:

1. Keep the dev app running.
2. In a terminal, stop Postgres with `npm run db:docker:down`.
3. In the student session, open `/share-experience?step=1` or try `Save draft`.
4. Observe the failure UI.
5. Restore Postgres with `npm run db:docker:up`.

Pass if:

- the page shows a friendly database-unavailable style message
- there is no false `Saved` state
- there is no `Last saved` timestamp after the failed action
- the app does not claim success when nothing persisted

If you need the local data immediately again after recovery, wait for the database to come back and refresh the page. The named Docker volume keeps the local data unless you explicitly remove volumes.

## Signoff

Mark the MVP manual checklist as passed only if all 4 sections above pass without workaround notes:

- student draft/save/submit works
- admin preview/approve works
- approved submission appears on all public pages
- database-down behavior fails safely
