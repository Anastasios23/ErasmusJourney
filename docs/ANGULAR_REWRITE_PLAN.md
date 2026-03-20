# Angular SSR Rewrite Plan (SEO-First)

## Goal

Full rewrite from Next.js/React to Angular SSR (Angular Universal), preserving functionality while improving SEO, maintainability, accessibility, and performance.

## Target Stack

- Angular 18+ with Angular Universal (SSR)
- TailwindCSS + Angular Material
- REST API service (Node/Express or NestJS)
- Prisma (existing schema)
- Auth: JWT + refresh tokens (service-based, SSR-safe)

## Scope

### Normal User Flows

- Discover destinations (list + detail)
- Course matching experiences
- Share experience (multi-step form)
- Dashboard and submission tracking
- Auth (login/register)
- Accommodation detail

### Admin Flows

- Review/approve submissions
- Admin dashboards and content moderation

## SEO Requirements

- SSR for all public routes
- Per-route metadata: title, description, canonical, Open Graph, Twitter
- JSON-LD for destinations and stories where applicable
- OG image endpoint integration

## Key Risks

- API extraction from Next.js routes
- Auth migration from NextAuth to service-based auth
- Large page components need decomposition

## Phases

1. Foundation: Angular SSR scaffold, Tailwind + Angular Material, routing shell
2. API Extraction: move Next.js API routes to a dedicated service
3. UI Migration: convert shared components and build feature modules
4. Gap Fixes: SEO completeness, accessibility, performance optimizations
5. QA + Launch: E2E tests, SEO audit, performance verification

## Success Criteria

- All critical flows fully functional
- SEO metadata SSR-rendered for public pages
- Admin review flows operational and secured
- Lighthouse SEO/Performance scores improved
