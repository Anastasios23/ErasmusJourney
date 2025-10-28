# Unified Data Model - One Pipeline Architecture

## 🎯 Goal

Implement a single source of truth for all student submissions with consistent status tracking and approval workflow.

## 📋 Current Problems

1. **Multiple Storage Systems**
   - `FormSubmission` - Quick forms
   - `ErasmusExperience` - Multi-step forms
   - Various denormalized tables (Accommodation, CourseExchange, etc.)

2. **Inconsistent Status Values**
   - FormSubmission: `DRAFT`, `SUBMITTED`, `PUBLISHED`
   - ErasmusExperience: `DRAFT`, `IN_PROGRESS`, `SUBMITTED`
   - No unified approval workflow

3. **No Clear Approval Pipeline**
   - Missing `pending`, `approved`, `rejected` status tracking
   - Admin actions not properly tracked

## ✅ Solution: Unified Submission Model

### Core Principle

**ONE table stores ALL student inputs** → Other tables are read-only views/denormalizations

### New Status Enum

```typescript
enum SubmissionStatus {
  DRAFT           // User is still editing
  PENDING         // Submitted, awaiting admin review
  APPROVED        // Admin approved, published
  REJECTED        // Admin rejected
  REVISION_NEEDED // Admin requested changes
  ARCHIVED        // Old/invalid data
}
```

## 🏗️ New Schema Design

### Primary Table: `StudentSubmission`

This is the **single source of truth** for all student data.

```prisma
model StudentSubmission {
  id            String   @id @default(cuid())
  userId        String

  // Submission Type & Content
  submissionType String  // 'EXPERIENCE' | 'ACCOMMODATION' | 'COURSE' | 'QUICK_TIP'
  formStep       String? // For multi-step forms: 'basic' | 'courses' | 'accommodation' | 'expenses' | 'experience'
  data           Json    // All form data stored here

  // Location (denormalized for queries)
  hostCity       String?
  hostCountry    String?
  hostUniversity String?

  // Status Pipeline
  status         SubmissionStatus @default(DRAFT)

  // Admin Review
  reviewedBy     String?
  reviewedAt     DateTime?
  adminNotes     String?
  rejectionReason String?

  // Quality & Processing
  qualityScore   Float?
  processed      Boolean  @default(false)
  publishedAt    DateTime?

  // Metadata
  version        Int      @default(1)
  previousVersion String? // For revision history
  tags           String[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  user           User     @relation(fields: [userId], references: [id])
  reviewer       User?    @relation("ReviewedSubmissions", fields: [reviewedBy], references: [id])

  // Denormalized references (optional, for performance)
  accommodationView Accommodation[]
  courseView        CourseExchange[]

  @@index([userId, status])
  @@index([hostCity, hostCountry, status])
  @@index([submissionType, status])
  @@index([status, createdAt])
}

enum SubmissionStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  REVISION_NEEDED
  ARCHIVED
}
```

### Denormalized Views (Read-Only)

These tables are **generated from** StudentSubmission, not direct user input:

```prisma
// Generated accommodation listings
model Accommodation {
  id               String   @id @default(cuid())
  sourceSubmissionId String // References StudentSubmission

  // Extracted data
  type             String
  name             String
  pricePerMonth    Int?
  city             String
  country          String

  // Always synced from source
  status           SubmissionStatus // Mirrors source

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  sourceSubmission StudentSubmission @relation(fields: [sourceSubmissionId], references: [id])
}

// Generated course exchanges
model CourseExchange {
  id               String   @id @default(cuid())
  sourceSubmissionId String

  homeCourse       String
  hostCourse       String
  ects             Int?
  university       String

  status           SubmissionStatus

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  sourceSubmission StudentSubmission @relation(fields: [sourceSubmissionId], references: [id])
}
```

## 🔄 Migration Strategy

### Phase 1: Add New Model (Non-Breaking)

1. Create `StudentSubmission` table
2. Keep old tables temporarily
3. Double-write to both systems

### Phase 2: Data Migration

```typescript
// Migrate ErasmusExperience → StudentSubmission
async function migrateErasmusExperiences() {
  const experiences = await prisma.erasmusExperience.findMany();

  for (const exp of experiences) {
    await prisma.studentSubmission.create({
      data: {
        userId: exp.userId,
        submissionType: "EXPERIENCE",
        data: {
          basicInfo: exp.basicInfo,
          courses: exp.courses,
          accommodation: exp.accommodation,
          livingExpenses: exp.livingExpenses,
          experience: exp.experience,
        },
        hostCity: exp.basicInfo?.hostCity,
        hostCountry: exp.basicInfo?.hostCountry,
        status: mapOldStatus(exp.status),
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt,
      },
    });
  }
}

// Migrate FormSubmission → StudentSubmission
async function migrateFormSubmissions() {
  const submissions = await prisma.formSubmission.findMany();

  for (const sub of submissions) {
    await prisma.studentSubmission.create({
      data: {
        userId: sub.userId,
        submissionType: sub.type,
        data: sub.data,
        hostCity: sub.hostCity,
        hostCountry: sub.hostCountry,
        status: mapOldStatus(sub.status),
        createdAt: sub.createdAt,
      },
    });
  }
}

function mapOldStatus(oldStatus: string): SubmissionStatus {
  const mapping = {
    DRAFT: "DRAFT",
    IN_PROGRESS: "DRAFT",
    SUBMITTED: "PENDING",
    PUBLISHED: "APPROVED",
    ARCHIVED: "ARCHIVED",
  };
  return mapping[oldStatus] || "PENDING";
}
```

### Phase 3: Update APIs

```typescript
// NEW: Single submission endpoint
// POST /api/submissions
export async function createSubmission(data: {
  submissionType: string;
  formStep?: string;
  data: any;
  hostCity?: string;
  hostCountry?: string;
}) {
  return prisma.studentSubmission.create({
    data: {
      ...data,
      userId: session.user.id,
      status: "DRAFT",
    },
  });
}

// NEW: Submit for review
// POST /api/submissions/:id/submit
export async function submitForReview(id: string) {
  return prisma.studentSubmission.update({
    where: { id },
    data: {
      status: "PENDING",
      updatedAt: new Date(),
    },
  });
}

// NEW: Admin approve
// POST /api/admin/submissions/:id/approve
export async function approveSubmission(id: string, adminId: string) {
  const submission = await prisma.studentSubmission.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      publishedAt: new Date(),
    },
  });

  // Denormalize data after approval
  await denormalizeSubmission(submission);

  return submission;
}

// NEW: Admin reject
// POST /api/admin/submissions/:id/reject
export async function rejectSubmission(
  id: string,
  adminId: string,
  reason: string,
) {
  return prisma.studentSubmission.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },
  });
}
```

### Phase 4: Denormalization Service

```typescript
// Automatically create denormalized views after approval
async function denormalizeSubmission(submission: StudentSubmission) {
  if (submission.status !== "APPROVED") return;

  const data = submission.data as any;

  // Create accommodation entries
  if (data.accommodation) {
    await prisma.accommodation.create({
      data: {
        sourceSubmissionId: submission.id,
        type: data.accommodation.type,
        name: data.accommodation.name,
        pricePerMonth: data.accommodation.pricePerMonth,
        city: submission.hostCity,
        country: submission.hostCountry,
        status: submission.status,
      },
    });
  }

  // Create course entries
  if (data.courses && Array.isArray(data.courses)) {
    for (const course of data.courses) {
      await prisma.courseExchange.create({
        data: {
          sourceSubmissionId: submission.id,
          homeCourse: course.homeCourse,
          hostCourse: course.hostCourse,
          ects: course.ects,
          university: submission.hostUniversity,
          status: submission.status,
        },
      });
    }
  }
}
```

## 📊 Admin Dashboard Updates

### New Submission Management View

```typescript
// Get all submissions with filters
const submissions = await prisma.studentSubmission.findMany({
  where: {
    status: filter.status || undefined,
    submissionType: filter.type || undefined,
    hostCity: filter.city || undefined,
  },
  include: {
    user: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    reviewer: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});
```

### Admin Action Buttons

```tsx
<Button onClick={() => approveSubmission(id)}>
  ✅ Approve
</Button>

<Button onClick={() => requestRevision(id)}>
  📝 Request Changes
</Button>

<Button onClick={() => rejectSubmission(id, reason)}>
  ❌ Reject
</Button>
```

## 🎯 Benefits

### 1. Single Source of Truth

- All data in ONE table
- No confusion about where data lives
- Easy to query and report

### 2. Clear Status Pipeline

```
DRAFT → PENDING → APPROVED → Published
              ↓
           REJECTED
              ↓
        REVISION_NEEDED → PENDING
```

### 3. Full Audit Trail

- Who submitted
- When submitted
- Who reviewed
- When reviewed
- What decision was made
- Why rejected (if applicable)

### 4. Easy to Query

```sql
-- All pending submissions
SELECT * FROM StudentSubmission WHERE status = 'PENDING';

-- All approved accommodations in Paris
SELECT * FROM StudentSubmission
WHERE status = 'APPROVED'
  AND hostCity = 'Paris'
  AND data->>'accommodation' IS NOT NULL;

-- Submission stats by status
SELECT status, COUNT(*)
FROM StudentSubmission
GROUP BY status;
```

### 5. Performance

- Denormalized views for fast reads
- Source table for accurate writes
- Best of both worlds

## 🚀 Implementation Checklist

- [ ] Create new `StudentSubmission` model
- [ ] Add `SubmissionStatus` enum
- [ ] Create migration scripts
- [ ] Migrate existing data
- [ ] Update all form submission handlers
- [ ] Create new admin approval APIs
- [ ] Update admin dashboard UI
- [ ] Create denormalization service
- [ ] Add status change notifications
- [ ] Update documentation
- [ ] Test full pipeline
- [ ] Remove old models (after verification)

## 📝 Code Changes Required

### 1. Form Submission Handler

```typescript
// OLD: Multiple endpoints
await fetch('/api/erasmus-experiences', ...)
await fetch('/api/form-submissions', ...)

// NEW: Single endpoint
await fetch('/api/submissions', {
  method: 'POST',
  body: JSON.stringify({
    submissionType: 'EXPERIENCE',
    formStep: 'basic',
    data: formData,
    hostCity: formData.hostCity,
    hostCountry: formData.hostCountry,
  })
});
```

### 2. Admin Dashboard

```typescript
// OLD: Fetch from multiple sources
const experiences = await fetch("/api/erasmus-experiences");
const submissions = await fetch("/api/admin/form-submissions");

// NEW: Single source
const allSubmissions = await fetch("/api/admin/submissions");
```

## 🎉 Result

After implementation, you'll have:

- ✅ One table for all student inputs
- ✅ Clear approval workflow (pending → approved → rejected)
- ✅ Full audit trail
- ✅ Easy admin management
- ✅ Denormalized views for performance
- ✅ No data fragmentation
- ✅ Consistent status across the system

---

**Next Step:** Review this plan and decide when to start implementation.
