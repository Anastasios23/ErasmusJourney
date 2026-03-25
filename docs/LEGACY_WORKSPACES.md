# Legacy Workspaces

These directories live under `legacy/` and are not part of the active Erasmus Journey MVP runtime path.

## Active app

- App: root Next.js application
- Dev: `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run typecheck:next-only`

## Legacy directories

- `legacy/server/`
  - Historical standalone Express + SQLite backend
  - Manual local command if you explicitly need it: `npm --prefix legacy/server run dev`
- `legacy/api-service/`
  - Historical NestJS service spike
  - Manual local command if you explicitly need it: `npm --prefix legacy/api-service run start:dev`
- `legacy/angular-ssr/`
  - Historical Angular SSR experiment
  - Manual local command if you explicitly need it: `npm --prefix legacy/angular-ssr run start`

## Guidance

- Do not treat these workspaces as required for normal Next.js development.
- Do not point current user-facing setup instructions at `legacy/server/`.
- Prefer root `pages/api/*` and `src/server/*` for active backend behavior in the MVP.
- Keep legacy workspace commands out of the root `package.json` developer interface.
