# MVP Signoff Checklist

Use this checklist as the formal MVP release gate. If the automated gate passes and the manual release checklist is confirmed, the product is ready enough to move from refactoring into polish, demo, and usage work.

## Standard Gate

Run these commands as the default MVP signoff gate:

```bash
npm run typecheck:next-only
npm test
npm run smoke:public-destinations
npm run proof:approved-to-public
npm run proof:preview-to-approval
```

If you are using a fresh local database with no approved submissions yet, run `npm run db:seed:proof` once before the public smoke/proof commands.

## Manual Release Checklist

| Check | Status |
| --- | --- |
| student draft/save/submit works | [ ] |
| admin preview/approve works | [ ] |
| approved submission appears on all public pages | [ ] |
| database-down behavior fails safely | [ ] |
