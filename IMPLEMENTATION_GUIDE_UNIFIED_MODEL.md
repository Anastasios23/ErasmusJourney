# 🚀 Implementation Guide: Unified Data Model

## Overview

This guide walks you through implementing the unified `StudentSubmission` model with a clear `pending → approved → rejected` pipeline.

## 📋 Prerequisites

- [ ] Backup your current database
- [ ] Review `UNIFIED_DATA_MODEL_PLAN.md`
- [ ] Review `prisma/schema_unified.prisma`
- [ ] Test environment ready

## 🔧 Step-by-Step Implementation

### Step 1: Backup Current Database

```bash
# Backup PostgreSQL database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using Prisma
npx prisma db pull
```

### Step 2: Apply New Schema

```bash
# 1. Replace schema
cp prisma/schema_unified.prisma prisma/schema.prisma

# 2. Generate Prisma client
npx prisma generate

# 3. Create migration
npx prisma migrate dev --name unified_submission_model

# 4. Apply migration
npx prisma migrate deploy
```

### Step 3: Run Data Migration

```bash
# Migrate existing data to new model
npx tsx scripts/migrate-to-unified-model.ts
```

This will:

- Migrate all `ErasmusExperience` records
- Migrate all `FormSubmission` records
- Generate denormalized views
- Preserve original data (renamed to `_legacy` tables)

### Step 4: Verify Migration

```bash
# Open Prisma Studio to inspect data
npx prisma studio
```

Check:

- [ ] `StudentSubmission` table has data
- [ ] All users migrated correctly
- [ ] Status values are correct (`DRAFT`, `PENDING`, `APPROVED`, etc.)
- [ ] `AccommodationView` and `CourseExchangeView` populated

### Step 5: Create New API Endpoints

Create `pages/api/submissions/index.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { SubmissionType, SubmissionStatus } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET: Fetch user's submissions
  if (req.method === "GET") {
    try {
      const submissions = await prisma.studentSubmission.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return res.status(200).json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  // POST: Create new submission
  if (req.method === "POST") {
    try {
      const {
        submissionType,
        formStep,
        data,
        hostCity,
        hostCountry,
        hostUniversity,
        title,
      } = req.body;

      const submission = await prisma.studentSubmission.create({
        data: {
          userId: session.user.id,
          submissionType: submissionType as SubmissionType,
          formStep,
          data,
          hostCity,
          hostCountry,
          hostUniversity,
          title: title || generateTitle(data, submissionType),
          status: "DRAFT",
        },
      });

      return res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      return res.status(500).json({ error: "Failed to create submission" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

function generateTitle(data: any, type: string): string {
  // Generate title based on submission type and data
  if (type === "FULL_EXPERIENCE") {
    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const city = data.hostCity || "Unknown City";
    return name ? `${name}'s Experience in ${city}` : `Experience in ${city}`;
  }
  return "Student Submission";
}
```

Create `pages/api/submissions/[id]/submit.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  try {
    // Verify ownership
    const submission = await prisma.studentSubmission.findUnique({
      where: { id: id as string },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.userId !== session.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Update status to PENDING
    const updated = await prisma.studentSubmission.update({
      where: { id: id as string },
      data: {
        status: "PENDING",
        submittedAt: new Date(),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error submitting:", error);
    return res.status(500).json({ error: "Failed to submit" });
  }
}
```

Create `pages/api/admin/submissions/[id]/approve.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.query;
  const { adminNotes } = req.body;

  try {
    // Approve submission
    const submission = await prisma.studentSubmission.update({
      where: { id: id as string },
      data: {
        status: "APPROVED",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        publishedAt: new Date(),
        isPublic: true,
        adminNotes,
      },
    });

    // Generate denormalized views
    await generateDenormalizedViews(submission);

    return res.status(200).json(submission);
  } catch (error) {
    console.error("Error approving submission:", error);
    return res.status(500).json({ error: "Failed to approve submission" });
  }
}

async function generateDenormalizedViews(submission: any) {
  const data = submission.data as any;

  // Create accommodation view if applicable
  if (data.accommodation) {
    await prisma.accommodationView.create({
      data: {
        sourceSubmissionId: submission.id,
        type: data.accommodation.type,
        name: data.accommodation.name,
        city: submission.hostCity,
        country: submission.hostCountry,
        pricePerMonth: data.accommodation.pricePerMonth,
        status: submission.status,
        isPublic: true,
      },
    });
  }

  // Create course views if applicable
  if (data.courses && Array.isArray(data.courses)) {
    for (const course of data.courses) {
      await prisma.courseExchangeView.create({
        data: {
          sourceSubmissionId: submission.id,
          homeCourse: course.homeCourse,
          hostCourse: course.hostCourse,
          hostUniversity: submission.hostUniversity,
          city: submission.hostCity,
          country: submission.hostCountry,
          ects: course.ects,
          status: submission.status,
          isPublic: true,
        },
      });
    }
  }
}
```

Create `pages/api/admin/submissions/[id]/reject.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.query;
  const { rejectionReason, adminNotes } = req.body;

  try {
    const submission = await prisma.studentSubmission.update({
      where: { id: id as string },
      data: {
        status: "REJECTED",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason,
        adminNotes,
      },
    });

    return res.status(200).json(submission);
  } catch (error) {
    console.error("Error rejecting submission:", error);
    return res.status(500).json({ error: "Failed to reject submission" });
  }
}
```

### Step 6: Update Form Submission Handlers

Update your form handlers to use the new API:

```typescript
// OLD
await fetch("/api/erasmus-experiences", {
  method: "POST",
  body: JSON.stringify({ basicInfo: formData }),
});

// NEW
await fetch("/api/submissions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    submissionType: "FULL_EXPERIENCE",
    formStep: "basic",
    data: formData,
    hostCity: formData.hostCity,
    hostCountry: formData.hostCountry,
    hostUniversity: formData.hostUniversity,
  }),
});

// When user clicks "Submit for Review"
await fetch(`/api/submissions/${submissionId}/submit`, {
  method: "POST",
});
```

### Step 7: Update Admin Dashboard

Update `pages/admin/unified-dashboard.tsx`:

```typescript
// Fetch all submissions
const fetchAllData = async () => {
  const response = await fetch("/api/admin/submissions");
  const submissions = await response.json();
  setSubmissions(submissions);
};

// Approve submission
const handleApprove = async (id: string) => {
  await fetch(`/api/admin/submissions/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminNotes: "Approved" }),
  });
  await fetchAllData();
};

// Reject submission
const handleReject = async (id: string, reason: string) => {
  await fetch(`/api/admin/submissions/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rejectionReason: reason }),
  });
  await fetchAllData();
};
```

Add action buttons in the UI:

```tsx
<div className="flex gap-2">
  {submission.status === "PENDING" && (
    <>
      <Button onClick={() => handleApprove(submission.id)} variant="default">
        ✅ Approve
      </Button>
      <Button
        onClick={() => handleReject(submission.id, "Needs improvement")}
        variant="destructive"
      >
        ❌ Reject
      </Button>
    </>
  )}
</div>
```

## ✅ Testing Checklist

### Data Migration

- [ ] All ErasmusExperience records migrated
- [ ] All FormSubmission records migrated
- [ ] No data loss
- [ ] Status values correct

### API Endpoints

- [ ] POST /api/submissions (create)
- [ ] GET /api/submissions (list user's)
- [ ] POST /api/submissions/:id/submit (submit for review)
- [ ] POST /api/admin/submissions/:id/approve
- [ ] POST /api/admin/submissions/:id/reject

### Admin Dashboard

- [ ] Can see all submissions
- [ ] Can filter by status
- [ ] Can approve submissions
- [ ] Can reject submissions
- [ ] Denormalized views created after approval

### User Experience

- [ ] Forms save to StudentSubmission
- [ ] Users can submit for review
- [ ] Users see submission status
- [ ] Approved content appears publicly

## 🎉 Benefits After Implementation

1. ✅ **Single Source of Truth** - All data in StudentSubmission
2. ✅ **Clear Pipeline** - DRAFT → PENDING → APPROVED/REJECTED
3. ✅ **Full Audit Trail** - Who reviewed, when, why
4. ✅ **Easy Admin Management** - One dashboard for everything
5. ✅ **Consistent Status** - No more confusion
6. ✅ **Better Performance** - Denormalized views for fast reads

## 🚨 Rollback Plan

If issues occur:

```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or revert migration
npx prisma migrate resolve --rolled-back <migration_name>
```

## 📞 Support

If you encounter issues:

1. Check migration logs
2. Verify data in Prisma Studio
3. Check API responses in DevTools
4. Review error logs

---

**Ready to implement?** Start with Step 1 (backup) and proceed carefully through each step.
