# Angular Rewrite Backlog

## Phase 1: Foundation

- Create Angular SSR app (Angular Universal)
- Configure TailwindCSS
- Add Angular Material and theme tokens
- Establish base routing and layout shell
- Add SEO service (Title + Meta + canonical + JSON-LD)

## Phase 2: API Extraction

- Inventory Next.js API routes under pages/api
- Create API service endpoints (auth, submissions, admin, content)
- Migrate NextAuth to JWT + refresh token auth
- Align Prisma usage in the API service

## Phase 3: Feature Modules (UI)

- Destinations list + detail module
- Course matching experiences module
- Share experience multi-step form module
- Dashboard + submissions module
- Accommodation module
- Auth module (login/register)
- Admin review module

## Phase 4: Gap Fixes

- Add URL-synced tabs for destination detail
- Lazy load heavy sections and images
- Add a11y checks (aria labels, keyboard focus)
- Expand SEO metadata and OG/Twitter for all public pages

## Phase 5: QA + Launch

- Add end-to-end tests for critical flows
- SEO audit and performance benchmarks
- Plan production cutover
