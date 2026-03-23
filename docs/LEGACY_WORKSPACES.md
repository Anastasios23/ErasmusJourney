# Legacy Workspaces

These directories are not part of the active Erasmus Journey MVP runtime path.

## Active app

- App: root Next.js application
- Dev: `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run typecheck:next-only`

## Legacy directories

- `server/`
  - Historical standalone Express + SQLite backend
  - Manual local command if you explicitly need it: `npm --prefix server run dev`
- `api-service/`
  - Historical NestJS service spike
  - Manual local command if you explicitly need it: `npm --prefix api-service run start:dev`
- `angular-ssr/`
  - Historical Angular SSR experiment
  - Manual local command if you explicitly need it: `npm --prefix angular-ssr run start`

## Guidance

- Do not treat these workspaces as required for normal Next.js development.
- Do not point current user-facing setup instructions at `server/`.
- Prefer root `pages/api/*` and `src/server/*` for active backend behavior in the MVP.
- Keep legacy workspace commands out of the root `package.json` developer interface.
