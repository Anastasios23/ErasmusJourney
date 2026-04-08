Start PostgreSQL container: `npm run db:docker:up`

## Development Workflow

| Task                          | Command                              |
| ----------------------------- | ------------------------------------ |
| Start dev server              | `npm run dev`                        |
| Fresh start (clean artifacts) | `npm run dev:fresh`                  |
| Run tests (Vitest)            | `npm test`                           |
| Type check (Next.js boundary) | `npm run typecheck:next-only`        |
| Build for production          | `npm run build`                      |
| Run e2e smoke tests           | `npm run e2e:smoke`                  |
| Test share-experience flow    | `npm run e2e:smoke:share-experience` |

## Database Management

| Task                         | Command                                  |
| ---------------------------- | ---------------------------------------- |
| Start Docker PostgreSQL      | `npm run db:docker:up`                   |
| Stop database                | `npm run db:docker:down`                 |
| Apply/create dev migrations  | `npm run db:migrate`                     |
| Deploy committed migrations  | `npm run db:deploy`                      |
| Minimal local seed           | `npm run db:seed`                        |
| Seed with proof data         | `npm run db:seed:proof`                  |
| Refresh public read model    | `npm run db:refresh-public-destination-read-model` |
| Full reset and reseed        | `npm run db:reset`                       |
| Non-canonical local sync     | `npm run db:push`                        |

**Important**:

- Always run committed schema changes through Prisma Migrate, not by editing SQL directly.
- `npm run db:migrate` is the canonical local workflow for schema changes and applying committed migrations.
- `npm run db:deploy` is the canonical production or CI workflow for applying committed migrations.
- `npm run db:push` is local-only escape hatch tooling. Do not use it to land schema changes, prepare deploys, or repair drift.
- If Prisma reports drift or an existing schema with missing migration history, stop feature work and repair migration history before continuing.
- The `ensure-permanent-admin` script runs during `npm run db:seed` so a local admin always exists.
- Use `npm run db:seed:proof` only when you need approved proof data for public-destination smoke checks.

## Repository Guidance

### Code Organization

- Keep root package focused on Next.js app only
- Do not add new default startup paths through `legacy/`
- Use `tsconfig.next-only.json` as the CI type boundary

### Form & State Management

- Multi-step forms should use a single persistence channel per change path (prefer parent `onSave`)
- Avoid parallel `updateFormData` + `onSave` writes in the same step
- Canonicalize data at the boundary before parent save/submit to reduce drift

### API Route Imports

- Nested API routes (`pages/api/*/`) need correct relative path depth
  - Example: `pages/api/destinations/generate.ts` uses `../../../src/...`
  - Common mistake: using `../../src/...` when nested deeper

### Testing & Validation

- Run `npm run typecheck:next-only` to isolate Next app issues from legacy services
- E2e tests focus on critical flows: share-experience, public destinations
- Use `SMOKE_BASE_URL` env var to override test server URL if needed
- Example: `SMOKE_BASE_URL=http://localhost:3001 npm run e2e:smoke`

### Canonical Prisma Workflow

- Drift repair or baseline work must leave `prisma/migrations/` with one authoritative active history.
- Archive or remove contradictory migration chains before creating a new baseline. Do not leave multiple active stories under `prisma/migrations/`.
- After any migration repair, verify both:
  - existing local databases can be reconciled with `prisma migrate resolve` when appropriate
  - a fresh local database can be rebuilt with `npm run db:reset`
- Public-destination freshness belongs in the canonical `public_destination_read_models` migration path, not in `db push`-only schema state.

## Deep Dives

For architectural decisions and longer context, see:

- [DASHBOARD_IMPROVEMENTS.md](docs/DASHBOARD_IMPROVEMENTS.md) — Dashboard UX and data flow
- [DESTINATION_IMPROVEMENTS.md](docs/DESTINATION_IMPROVEMENTS.md) — Public destinations, admin curation
- [FORM_DESIGN_IMPROVEMENTS.md](docs/FORM_DESIGN_IMPROVEMENTS.md) — Multi-step form patterns
- [BRANDING_IMPROVEMENTS.md](docs/BRANDING_IMPROVEMENTS.md) — Design system work

## Key Scripts & Workflows

- **Public destination smoke tests**: `npm run smoke:public-destinations`
- **Refresh persisted public destinations**: `npm run db:refresh-public-destination-read-model`
- **MVP signoff prep**: `npm run mvp:signoff:prep`
- **Promote proof data to approval**: `npm run proof:preview-to-approval`
