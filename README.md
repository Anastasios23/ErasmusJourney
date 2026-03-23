# Erasmus Journey MVP

A web application helping future Erasmus students from Cyprus plan their exchange experience by learning from past students.

## Active App Boundary

The active product in this repository is the root Next.js application.

- Primary development path: `npm run dev`
- Primary production build: `npm run build`
- Primary CI typecheck signal: `npm run typecheck:next-only`
- Root `tsconfig.json` is editor compatibility for the active app only

Legacy directories such as `angular-ssr/`, `api-service/`, and `server/` are not part of the default startup path. They remain in the repo for historical or auxiliary reasons and should not be treated as required for MVP development.

If you need background on those archived paths, see [docs/LEGACY_WORKSPACES.md](./docs/LEGACY_WORKSPACES.md).

## Core Features

### For past Erasmus students

- **5-step experience form** (`/share-experience`)
  1. Basic information
  2. Course matching
  3. Accommodation
  4. Living expenses
  5. Tips and advice

### For future Erasmus students

- **Destinations** (`/destinations`) for aggregated city data
- **Course matching** (`/course-matching-experiences`) for approved course equivalences
- **Destination details** (`/destinations/[slug]`) for city-specific insights

### For signed-in users

- **Dashboard** (`/dashboard`) to track form progress
- **My submissions** (`/my-submissions`) to review submitted experiences

### For admins

- **Review submissions** (`/admin/review-submissions`) to moderate student data before it becomes public

## Tech Stack

- **Framework**: Next.js 15 with the Pages Router
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS with Radix UI primitives
- **State/Data**: React Query

## Getting Started

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your database URL and auth secrets
npm run db:push
npm run dev
```

## Page Structure

```text
pages/
|-- index.tsx
|-- share-experience.tsx
|-- dashboard.tsx
|-- my-submissions.tsx
|-- destinations/
|   |-- index.tsx
|   `-- [slug].tsx
|-- course-matching-experiences.tsx
|-- login.tsx
|-- register.tsx
|-- admin/
|   |-- index.tsx
|   `-- review-submissions.tsx
`-- accommodation/
    `-- [id].tsx
```

## Data Flow

1. Past students submit experiences through `/share-experience`.
2. Admins review submissions in `/admin/review-submissions`.
3. Approved data is aggregated into destination and course-matching views.

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```
