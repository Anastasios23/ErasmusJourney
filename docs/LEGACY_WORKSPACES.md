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
  - Optional legacy dev command: `npm run legacy:server:dev`
- `api-service/`
  - Historical NestJS service spike
  - Optional legacy dev command: `npm run legacy:api-service:dev`
- `angular-ssr/`
  - Historical Angular SSR experiment
  - Optional legacy dev command: `npm run legacy:angular-ssr:dev`

## Guidance

- Do not treat these workspaces as required for normal Next.js development.
- Do not point current user-facing setup instructions at `server/`.
- Prefer root `pages/api/*` and `src/server/*` for active backend behavior in the MVP.
