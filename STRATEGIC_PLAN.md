# Strategic System Improvement Plan

**Date:** October 28, 2025  
**Status:** 🎯 Action Plan Ready

---

## Problem Analysis

### Current Pain Points:

1. **❌ No single, enforced status gate**
   - Multiple tables with inconsistent status values
   - Public pages don't reliably filter by status
   - No clear PENDING → APPROVED → PUBLIC flow

2. **❌ Admin review UI isn't a mirror of public UI**
   - Admin sees raw data, not final rendered view
   - Can't preview what users will see before approving
   - Different components = potential display bugs

3. **❌ Averages/aggregation on client-side**
   - Performance issues with large datasets
   - Inconsistent calculations across pages
   - No handling of outliers or currency conversion

4. **❌ Navigation not focused on MVP journey**
   - Too many routes visible
   - No clear "Submit → Review → Public" path
   - Admin routes not properly guarded

---

## Solution: 5-Part Strategic Implementation

### Part 1: Enforce Status Gates at API Layer ✅

**What we have:**

- ✅ `student_submissions` with SubmissionStatus enum
- ✅ Status: DRAFT, PENDING, APPROVED, REJECTED, REVISION_NEEDED
- ✅ All API endpoints created

**What we need:**

1. **Force status filter on ALL public reads**

   ```typescript
   // ALWAYS filter status='APPROVED' for public data
   where: { status: 'APPROVED', isPublic: true }
   ```

2. **Validate data on submission**
   - Use Zod schema validation
   - Force currency='EUR'
   - Store prices as cents (integers)
   - Set status='PENDING' on submit

3. **Admin-only status changes**
   - Only ADMIN can change PENDING → APPROVED/REJECTED
   - Track reviewer ID and timestamp

**Files to update:**

- ✅ `/api/submissions/index.ts` - Already done
- ✅ `/api/admin/submissions/[id]/approve.ts` - Already done
- 🔄 `/api/destinations/*` - Add status filter
- 🔄 `/api/forms/get.ts` - Add status filter
- 🔄 `/api/accommodations/*` - Use approved views only

---

### Part 2: Admin Review = Public Preview 🎨

**Concept:** When admin reviews submission, show EXACTLY what users will see

**Implementation:**

1. **Create PreviewRenderer component**

   ```tsx
   // Reuses same components as public pages
   <PreviewRenderer
     submission={pendingSubmission}
     type="accommodation" // or "course" or "experience"
   />
   ```

2. **Update admin review page**
   - Left: Raw submission data (for editing)
   - Right: Live preview using public components
   - Top: Approve/Reject/Revise buttons

3. **Shared components**
   ```
   components/
   ├── public/
   │   ├── AccommodationCard.tsx   ← Used by both
   │   ├── CourseCard.tsx          ← Used by both
   │   └── ExperienceCard.tsx      ← Used by both
   └── admin/
       └── SubmissionPreview.tsx   ← Wraps public components
   ```

**New files to create:**

- `components/public/AccommodationCard.tsx`
- `components/public/CourseCard.tsx`
- `components/admin/SubmissionPreview.tsx`
- `pages/admin/review/[id].tsx` - Preview + approve

---

### Part 3: Server-Side Aggregation with Outlier Handling 📊

**What we need:**

1. **Stats API endpoint**

   ```typescript
   GET /api/destinations/stats?city=Paris

   Returns:
   {
     avgMonthlyRentCents: 45000,  // €450 (stored as cents)
     medianMonthlyRent: 42500,    // €425
     p5: 30000,   // 5th percentile (outlier threshold)
     p95: 65000,  // 95th percentile (outlier threshold)
     sampleSize: 47,
     currency: 'EUR',
     rentRange: {
       min: 30000,
       max: 65000,
       typical: { min: 35000, max: 55000 }
     }
   }
   ```

2. **Database requirements**
   - Store rent as INTEGER (cents): `monthlyRentCents`
   - Force currency='EUR' at API validation layer
   - Only aggregate from APPROVED submissions

3. **Outlier detection**
   ```typescript
   // Remove bottom 5% and top 5%
   const filtered = allRents.slice(
     Math.floor(allRents.length * 0.05),
     Math.floor(allRents.length * 0.95),
   );
   ```

**Files to create/update:**

- ✅ `/api/admin/submissions/[id]/approve.ts` - Already creates views
- 🔄 `/api/destinations/stats.ts` - Add aggregation logic
- 🔄 Update accommodation_views to store cents
- 🔄 Public pages consume stats API

---

### Part 4: Streamlined Navigation (MVP Focus) 🧭

**Public Navigation (Header):**

```
Home | Explore | Submit Experience | Login
```

**Explore Submenu:**

- Destinations (cities/countries)
- Partner Universities

**Admin Navigation (visible to ADMIN only):**

```
Admin Dashboard | Review Queue | Statistics
```

**Hide from public nav:**

- ❌ /system-status
- ❌ /partnership-management
- ❌ /dev/debug-admin
- ❌ /admin/destinations_backup
- ❌ Stories (unless MVP feature)

**Route Guards:**

```typescript
// pages/admin/**/*.tsx
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return {
      redirect: { destination: "/login?callbackUrl=/admin", permanent: false },
    };
  }

  return { props: { session } };
}
```

**Files to update:**

- 🔄 `components/Header.tsx` - Simplify navigation
- 🔄 Add getServerSideProps to all `/pages/admin/*`

---

### Part 5: Admin Review Workflow 🔄

**New Admin Review Page:** `/admin/review`

**Features:**

1. **Queue view**
   - List all PENDING submissions
   - Filter by: city, date, type
   - Sort by: date, priority

2. **Detail view** (on row click)
   - Left panel: Raw data + edit form
   - Right panel: Live preview (uses public components)
   - Actions: Approve, Reject, Request Revision

3. **Approval flow**
   ```
   PENDING submission
   → Admin clicks "Preview"
   → See exactly how it renders
   → Click "Approve"
   → Status = APPROVED
   → isPublic = true
   → Views auto-generated
   → Appears on public pages immediately
   ```

**Files to create:**

- `pages/admin/review/index.tsx` - Queue list
- `pages/admin/review/[id].tsx` - Detail + preview
- `components/admin/ReviewQueue.tsx` - Table component
- `components/admin/SubmissionPreview.tsx` - Preview renderer

---

## Implementation Priority

### Phase 1: Critical (Do First) 🚨

1. ✅ Status enum in database (DONE)
2. ✅ API endpoints with status enforcement (DONE)
3. 🔄 **Add status filter to ALL public reads** (30 min)
4. 🔄 **Guard admin routes** (20 min)
5. 🔄 **Update Header navigation** (30 min)

### Phase 2: High Value (Do Next) ⭐

6. 🔄 **Server-side stats API** (1 hour)
7. 🔄 **Shared public components** (1 hour)
8. 🔄 **Admin preview page** (2 hours)

### Phase 3: Polish (Complete MVP) ✨

9. 🔄 **Outlier detection** (30 min)
10. 🔄 **Currency standardization** (EUR only) (30 min)
11. 🔄 **Store rent as cents** (migration + validation) (1 hour)

---

## Technical Specifications

### Data Validation Schema (Zod)

```typescript
import { z } from "zod";

export const AccommodationSubmissionSchema = z.object({
  type: z.enum(["STUDENT_RESIDENCE", "APARTMENT", "SHARED", "STUDIO", "OTHER"]),
  name: z.string().min(3).max(100),
  monthlyRentCents: z.number().int().min(10000).max(500000), // €100-€5000
  currency: z.literal("EUR"), // Force EUR only
  city: z.string().min(2),
  country: z.string().min(2),
  neighborhood: z.string().optional(),
  description: z.string().min(20).max(1000),
  pros: z.array(z.string()).min(1).max(10),
  cons: z.array(z.string()).min(1).max(10),
});

export const CourseExchangeSchema = z.object({
  homeCourse: z.string().min(3),
  hostCourse: z.string().min(3),
  ects: z.number().int().min(1).max(30),
  hostUniversity: z.string().min(3),
  semester: z.string(),
  rating: z.number().min(1).max(5).optional(),
  description: z.string().min(20).optional(),
});
```

### Status Filter Middleware

```typescript
// lib/middleware/statusFilter.ts
export function enforceApprovedOnly(query: any) {
  return {
    ...query,
    where: {
      ...query.where,
      status: "APPROVED",
      isPublic: true,
    },
  };
}

// Usage in API routes:
const accommodations = await prisma.accommodation_views.findMany(
  enforceApprovedOnly({ where: { city: "Paris" } }),
);
```

### Admin Route Guard HOC

```typescript
// lib/auth/adminGuard.ts
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export function withAdminAuth(gssp?: GetServerSideProps): GetServerSideProps {
  return async (context) => {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions,
    );

    if (!session || session.user.role !== "ADMIN") {
      return {
        redirect: {
          destination: `/login?callbackUrl=${context.resolvedUrl}`,
          permanent: false,
        },
      };
    }

    if (gssp) {
      return await gssp(context);
    }

    return { props: { session } };
  };
}

// Usage:
export const getServerSideProps = withAdminAuth();
```

---

## Success Metrics

### After Implementation:

✅ **Status Enforcement**

- 100% of public queries filter `status='APPROVED'`
- 0 unapproved items visible to public

✅ **Admin Preview**

- Admin sees exact public rendering before approving
- 0 "looks different after approval" surprises

✅ **Server Aggregation**

- All averages calculated server-side
- <200ms response time for stats
- Outliers excluded (5%-95% range)

✅ **Navigation**

- 4 main nav items (Home, Explore, Submit, Login)
- Admin links only visible to ADMIN role
- All admin routes guarded with auth

✅ **Data Quality**

- EUR only (enforced at API validation)
- Rent stored as cents (integers)
- Validation schema prevents bad data

---

## Files Modified Summary

### Phase 1 (Critical):

```
✅ prisma/schema.prisma (DONE)
✅ pages/api/submissions/* (DONE)
✅ pages/api/admin/submissions/* (DONE)
🔄 pages/api/destinations/stats.ts
🔄 pages/api/forms/get.ts
🔄 components/Header.tsx
🔄 pages/admin/*.tsx (add guards)
```

### Phase 2 (High Value):

```
🆕 lib/validations/submission.ts (Zod schemas)
🆕 lib/middleware/statusFilter.ts
🆕 lib/auth/adminGuard.ts
🆕 components/public/AccommodationCard.tsx
🆕 components/public/CourseCard.tsx
🆕 components/admin/SubmissionPreview.tsx
🆕 pages/admin/review/index.tsx
🆕 pages/admin/review/[id].tsx
```

### Phase 3 (Polish):

```
🔄 Migrate existing prices to cents
🔄 Update all forms to use cents
🔄 Add outlier detection to stats
🔄 Currency conversion removed (EUR only)
```

---

## Next Steps

**Now that we have the foundation (10 APIs + unified model), we need to:**

1. **Add status filters everywhere** (prevents unapproved leaks)
2. **Create admin preview** (ensures quality before approval)
3. **Move aggregation server-side** (performance + consistency)
4. **Simplify navigation** (focus on MVP user journey)
5. **Guard admin routes** (security)

**Let's start with Phase 1 (Critical) implementation!**

Would you like me to:
A) Start implementing the critical fixes (status filters + route guards)?
B) Create the admin preview page first?
C) Focus on a specific pain point you're experiencing?
