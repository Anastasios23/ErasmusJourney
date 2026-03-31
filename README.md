# Erasmus Journey MVP

A web application helping future Erasmus students from Cyprus plan their exchange by learning from approved student submissions.

## Active App Boundary

The active product in this repository is the root Next.js application.

- Dev: `npm run dev`
- Clean dev: `npm run dev:fresh`
- Build: `npm run build`
- Typecheck: `npm run typecheck:next-only`
- Tests: `npm test`

Archived experiments now live under `legacy/` and are not part of the default runtime path for the MVP. If you need background on those workspaces, see [docs/LEGACY_WORKSPACES.md](./docs/LEGACY_WORKSPACES.md).

## Canonical Public Routes

These are the current MVP public routes:

- `/destinations`
- `/destinations/[slug]`
- `/destinations/[slug]/accommodation`
- `/destinations/[slug]/courses`

Supplementary public pages may still exist in `pages/`, but the destination routes above are the canonical public browsing path for the current app.

## Authenticated And Admin Routes

- `/share-experience` for the 5-step Erasmus experience form
- `/dashboard` for progress tracking
- `/my-submissions` for reviewing saved and submitted experiences
- `/admin/review-submissions` for moderation and approval

## Architecture Boundaries

- Page routes live in `pages/`
- API routes live in `pages/api/`
- Shared server aggregation and publishing logic lives in `src/server/`
- Shared client and UI code lives in `src/`, `components/`, and `lib/`

## Tech Stack

- **Framework**: Next.js 15 with the Pages Router
- **UI**: React 18, TailwindCSS, Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Tests**: Vitest + Playwright

## Primary Route Map

```text
pages/
|-- index.tsx
|-- share-experience.tsx
|-- dashboard.tsx
|-- my-submissions.tsx
|-- destinations.tsx
|-- destinations/
|   |-- [slug].tsx
|   `-- [slug]/
|       |-- accommodation.tsx
|       `-- courses.tsx
|-- login.tsx
|-- register.tsx
`-- admin/
    `-- review-submissions.tsx
```

## Data Flow

1. Signed-in students create and update a draft through `/share-experience` and `pages/api/erasmus-experiences.ts`.
2. The API sanitizes step data into canonical `basicInfo`, `courses`, `accommodation`, `livingExpenses`, and `experience` payloads before persistence.
3. Admin preview and review flows validate publishability before approval, including required public destination fields such as `hostCity` and `hostCountry`.
4. Approved submissions are aggregated through `src/server/publicDestinations`.
5. Public destination pages read only approved, publishable data.

## Getting Started

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your database URL and auth secrets
npm run db:push
npm run dev
```

Use `npm run dev:fresh` when you want to clear stale `.next` artifacts before starting the app.

## Local Postgres With Docker Compose

If you want a repeatable local PostgreSQL setup for Prisma, proofs, and public smoke checks, use the root `compose.yaml`.

```bash
npm run db:docker:up
```

Default local database connection:

```env
DATABASE_URL="postgresql://erasmus:erasmus123@localhost:5432/erasmusjourney"
```

After the container is healthy:

```bash
npm run db:push
```

If you are starting from a fresh local database and want the public smoke/proof checks to run against non-empty approved data, seed the focused proof dataset once:

```bash
npm run db:seed:proof
```

Useful local commands:

- `npm run db:docker:down`
- `npm run db:docker:logs`
- `npm run db:docker:ps`

Equivalent raw Docker Compose commands still work if you prefer them:

- `docker compose up -d postgres`
- `docker compose down`
- `docker compose logs -f postgres`
- `docker compose ps`

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

`NEXTAUTH_SECRET` is required for production and production-like execution.

## Quality Gates

- `npm run typecheck:next-only`
- `npm test`
- `npm run smoke:public-destinations`
- `npm run proof:approved-to-public`
- `npm run proof:preview-to-approval`

Fresh local database note: if your database has schema but no approved submissions yet, run `npm run db:seed:proof` before the public smoke/proof commands.

If you want shortcut commands for release-style verification:

- `npm run mvp:signoff:prep`
- `npm run mvp:signoff:auto`

For the formal MVP release gate, use [docs/MVP_SIGNOFF.md](./docs/MVP_SIGNOFF.md).
For the final browser-side signoff pass, use [docs/MVP_MANUAL_RUNBOOK.md](./docs/MVP_MANUAL_RUNBOOK.md).
