# Erasmus Journey

The active product in this repository is the root Next.js application. Treat `angular-ssr/`, `api-service/`, and `server/` as archived side paths rather than the default runtime.

## Core Stack

- **Next.js 15** with the Pages Router
- **React 18**
- **TypeScript**
- **Prisma + PostgreSQL**
- **NextAuth.js**
- **TailwindCSS + Radix UI**
- **Vitest** for unit tests
- **Playwright** for browser smoke coverage

## Routing And Boundaries

- Page routes live in `pages/`.
- API routes live in `pages/api/`.
- Shared server logic for the active app lives in `src/server/`.
- Shared client and UI code lives in `src/`, `components/`, and `lib/`.

## Development Workflow

- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Typecheck**: `npm run typecheck:next-only`
- **Tests**: `npm test`

## Repository Guidance

- Keep the root package interface focused on the Next.js app.
- Do not add new default startup paths through `server/`, `api-service/`, or `angular-ssr/`.
- Prefer `tsconfig.next-only.json` as the CI type boundary for the active app.
- Keep user-facing setup docs aligned with the root Next.js flow.
