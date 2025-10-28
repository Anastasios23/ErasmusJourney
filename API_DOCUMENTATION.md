# Unified Submissions API Documentation

**Version:** 2.0  
**Date:** October 28, 2025  
**Base URL:** `/api`

## Overview

The Unified Submissions API provides a complete workflow for students to submit experiences and for admins to review and approve them. This replaces the legacy `/api/erasmus-experiences` and `/api/form-submissions` endpoints.

---

## Authentication

All endpoints require authentication via NextAuth session. Include session cookies with requests.

**Admin-only endpoints** require the user's role to be `ADMIN`.

---

## Data Models

### SubmissionStatus

```typescript
"DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "REVISION_NEEDED" | "ARCHIVED";
```

### SubmissionType

```typescript
"FULL_EXPERIENCE" |
  "ACCOMMODATION" |
  "COURSE_EXCHANGE" |
  "QUICK_TIP" |
  "DESTINATION_INFO";
```

### StudentSubmission

```typescript
{
  id: string;
  userId: string;
  submissionType: SubmissionType;
  formStep?: string;
  data: object; // All form data as JSON

  // Denormalized fields
  title?: string;
  hostCity?: string;
  hostCountry?: string;
  hostUniversity?: string;
  semester?: string;
  academicYear?: string;

  // Status
  status: SubmissionStatus;

  // Admin review
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNotes?: string;
  rejectionReason?: string;
  revisionNotes?: string;

  // Quality & metadata
  qualityScore?: number;
  processed: boolean;
  publishedAt?: Date;
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  viewCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;

  // Relations
  author: User;
  reviewer?: User;
}
```

---

## Student Endpoints

### 1. List User's Submissions

**GET** `/api/submissions`

Get all submissions for the authenticated user.

**Query Parameters:**

- `status` (optional): Filter by status
- `type` (optional): Filter by submission type
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "submissions": [
    /* StudentSubmission[] */
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 2. Create New Submission

**POST** `/api/submissions`

Create a new DRAFT submission.

**Request Body:**

```json
{
  "submissionType": "FULL_EXPERIENCE",
  "data": {
    "basicInfo": {
      /* ... */
    },
    "courses": [
      /* ... */
    ],
    "accommodation": {
      /* ... */
    }
  },
  "title": "My Exchange in Paris",
  "hostCity": "Paris",
  "hostCountry": "France",
  "hostUniversity": "Sorbonne University",
  "semester": "Fall 2024",
  "academicYear": "2024/2025",
  "formStep": "step1",
  "status": "DRAFT" // optional, defaults to DRAFT
}
```

**Response:** `201 Created`

```json
{
  "id": "cm...",
  "userId": "...",
  "submissionType": "FULL_EXPERIENCE",
  "status": "DRAFT",
  "data": {
    /* ... */
  },
  "createdAt": "2025-10-28T...",
  "author": {
    /* ... */
  }
}
```

---

### 3. Get Submission Details

**GET** `/api/submissions/[id]`

Get a specific submission (must own it or be admin).

**Response:** `200 OK`

```json
{
  "id": "cm...",
  "userId": "...",
  "submissionType": "FULL_EXPERIENCE",
  "status": "DRAFT",
  "data": {
    /* full form data */
  },
  "author": {
    /* ... */
  },
  "reviewer": null
  /* ... all fields ... */
}
```

---

### 4. Update Submission (Save Progress)

**PUT** `/api/submissions/[id]`

Update a DRAFT or REVISION_NEEDED submission.

**Request Body:**

```json
{
  "data": {
    "accommodation": {
      "type": "Student Residence",
      "monthlyRent": 450
    }
  },
  "hostCity": "Paris",
  "formStep": "step3"
}
```

**Notes:**

- `data` is merged with existing data (not replaced)
- Only DRAFT or REVISION_NEEDED submissions can be edited
- Must own the submission

**Response:** `200 OK` - Updated submission

---

### 5. Delete Submission

**DELETE** `/api/submissions/[id]`

Delete a DRAFT submission (cannot delete submitted ones).

**Response:** `200 OK`

```json
{
  "message": "Submission deleted successfully"
}
```

---

### 6. Submit for Review

**POST** `/api/submissions/[id]/submit`

Submit a DRAFT submission for admin review. Changes status to PENDING.

**Request Body:** (empty or optional metadata)

```json
{}
```

**Response:** `200 OK`

```json
{
  "message": "Submission sent for review",
  "submission": {
    "id": "cm...",
    "status": "PENDING",
    "submittedAt": "2025-10-28T10:30:00Z"
    /* ... */
  }
}
```

**Validation:**

- FULL_EXPERIENCE requires: hostCity, hostCountry, hostUniversity
- Can only submit DRAFT or REVISION_NEEDED

---

## Admin Endpoints

### 7. List All Submissions (Admin)

**GET** `/api/admin/submissions`

Get all submissions with advanced filtering (admin only).

**Query Parameters:**

- `status` (optional): Filter by status
- `type` (optional): Filter by submission type
- `search` (optional): Search in title, city, country, university
- `city` (optional): Filter by host city
- `country` (optional): Filter by host country
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset
- `sortBy` (optional): `updatedAt`, `createdAt`, `submittedAt`, `qualityScore`
- `sortOrder` (optional): `asc` or `desc`

**Response:** `200 OK`

```json
{
  "submissions": [
    /* StudentSubmission[] */
  ],
  "stats": {
    "total": 181,
    "byStatus": {
      "DRAFT": 10,
      "PENDING": 50,
      "APPROVED": 100,
      "REJECTED": 20,
      "REVISION_NEEDED": 1
    }
  },
  "pagination": {
    "total": 181,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 8. Approve Submission (Admin)

**POST** `/api/admin/submissions/[id]/approve`

Approve a PENDING submission and generate denormalized views.

**Request Body:**

```json
{
  "adminNotes": "Great quality submission!",
  "qualityScore": 4.5,
  "isFeatured": true
}
```

**What happens:**

1. ✅ Status changes to APPROVED
2. ✅ `isPublic` set to true
3. ✅ `publishedAt` timestamp set
4. ✅ Denormalized views created:
   - `accommodation_views` (for accommodation data)
   - `course_exchange_views` (for course data)

**Response:** `200 OK`

```json
{
  "message": "Submission approved successfully",
  "submission": {
    "id": "cm...",
    "status": "APPROVED",
    "isPublic": true,
    "publishedAt": "2025-10-28T10:35:00Z",
    "reviewedBy": "admin_user_id",
    "reviewedAt": "2025-10-28T10:35:00Z"
    /* ... */
  }
}
```

**Denormalized View Generation:**

For **ACCOMMODATION** submissions:

```javascript
accommodation_views {
  type, name, city, country, pricePerMonth,
  currency, neighborhood, description,
  pros, cons, studentName
}
```

For **COURSE_EXCHANGE** submissions:

```javascript
course_exchange_views {
  homeCourse, hostCourse, hostUniversity,
  city, country, ects, semester, studyLevel,
  fieldOfStudy, courseQuality, description
}
```

For **FULL_EXPERIENCE** submissions:

- Creates accommodation_views from `data.accommodation`
- Creates multiple course_exchange_views from `data.courses[]`

---

### 9. Reject Submission (Admin)

**POST** `/api/admin/submissions/[id]/reject`

Reject a PENDING submission with reason.

**Request Body:**

```json
{
  "rejectionReason": "Incomplete information about accommodation",
  "adminNotes": "Please add more details about monthly costs"
}
```

**Response:** `200 OK`

```json
{
  "message": "Submission rejected",
  "submission": {
    "id": "cm...",
    "status": "REJECTED",
    "rejectionReason": "Incomplete information...",
    "reviewedBy": "admin_user_id",
    "reviewedAt": "2025-10-28T10:40:00Z",
    "isPublic": false
  }
}
```

---

### 10. Request Revision (Admin)

**POST** `/api/admin/submissions/[id]/revise`

Request revisions from student (status becomes REVISION_NEEDED).

**Request Body:**

```json
{
  "revisionNotes": "Please add:\n1. Photos of accommodation\n2. Course syllabi links",
  "adminNotes": "Good start, needs more detail"
}
```

**Response:** `200 OK`

```json
{
  "message": "Revision requested",
  "submission": {
    "id": "cm...",
    "status": "REVISION_NEEDED",
    "revisionNotes": "Please add...",
    "reviewedBy": "admin_user_id",
    "isPublic": false
  }
}
```

**Student workflow:**

1. Sees `REVISION_NEEDED` status in their dashboard
2. Reads `revisionNotes`
3. Updates submission via `PUT /api/submissions/[id]`
4. Re-submits via `POST /api/submissions/[id]/submit`

---

## Status Flow Diagram

```
DRAFT ──────────┐
                │
                ▼
         [submit endpoint]
                │
                ▼
            PENDING ─────────┬──[approve]──▶ APPROVED ──▶ (public, views created)
                │            │
                │            ├──[reject]───▶ REJECTED ──▶ (hidden)
                │            │
                │            └──[revise]───▶ REVISION_NEEDED
                │                                  │
                └──────────────────────────────────┘
                           [student edits & resubmits]
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Missing required fields",
  "missingFields": ["hostCity", "hostCountry"]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "error": "Admin access required"
}
```

### 404 Not Found

```json
{
  "error": "Submission not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "details": "Specific error message"
}
```

---

## Migration from Legacy APIs

### Old → New Mapping

**Old:** `POST /api/erasmus-experiences`  
**New:** `POST /api/submissions` with `submissionType: "FULL_EXPERIENCE"`

**Old:** `PUT /api/erasmus-experiences` (action: submit)  
**New:** `POST /api/submissions/[id]/submit`

**Old:** `GET /api/form-submissions`  
**New:** `GET /api/submissions` (students) or `/api/admin/submissions` (admins)

---

## Usage Examples

### Example 1: Student Creates Draft

```typescript
// 1. Create draft
const response = await fetch("/api/submissions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    submissionType: "FULL_EXPERIENCE",
    data: { basicInfo: { name: "John" } },
    hostCity: "Paris",
    status: "DRAFT",
  }),
});
const { id } = await response.json();

// 2. Save progress
await fetch(`/api/submissions/${id}`, {
  method: "PUT",
  body: JSON.stringify({
    data: { accommodation: { type: "Student Residence" } },
    formStep: "step2",
  }),
});

// 3. Submit for review
await fetch(`/api/submissions/${id}/submit`, {
  method: "POST",
});
```

### Example 2: Admin Reviews Submissions

```typescript
// 1. Get pending submissions
const response = await fetch("/api/admin/submissions?status=PENDING");
const { submissions } = await response.json();

// 2. Approve one
await fetch(`/api/admin/submissions/${submissions[0].id}/approve`, {
  method: "POST",
  body: JSON.stringify({
    qualityScore: 4.5,
    isFeatured: true,
    adminNotes: "Excellent detail!",
  }),
});
```

---

## Best Practices

### For Students:

1. ✅ Save progress frequently with `PUT /submissions/[id]`
2. ✅ Only submit when form is complete
3. ✅ Check `status` and `revisionNotes` regularly
4. ✅ Keep `data` object well-structured

### For Admins:

1. ✅ Use `qualityScore` to rank submissions
2. ✅ Provide clear `revisionNotes` when requesting changes
3. ✅ Use `isFeatured` for high-quality submissions
4. ✅ Monitor `stats.byStatus` for workflow bottlenecks

### Performance:

1. ✅ Use pagination for large lists
2. ✅ Filter by `status` to reduce query size
3. ✅ Denormalized views auto-created (no manual work)
4. ✅ Indexes optimized for common queries

---

## Database Schema

```prisma
model student_submissions {
  id                String           @id @default(cuid())
  userId            String
  submissionType    SubmissionType
  data              Json             // Single source of truth
  status            SubmissionStatus @default(DRAFT)

  // Denormalized for fast queries
  hostCity          String?
  hostCountry       String?

  // Admin review
  reviewedBy        String?
  reviewedAt        DateTime?

  // Relations
  author            users            @relation("SubmissionAuthor")
  reviewer          users?           @relation("SubmissionReviewer")
  accommodationViews accommodation_views[]
  courseViews       course_exchange_views[]

  @@index([userId, status])
  @@index([status, submittedAt])
  @@index([hostCity, hostCountry, status])
}
```

---

## Support

For questions or issues:

- Check status codes and error messages
- Verify authentication session
- Ensure required fields are provided
- Check user role for admin endpoints

**Deprecated APIs:**

- ❌ `/api/erasmus-experiences` (use `/api/submissions` instead)
- ❌ `/api/form-submissions` (use `/api/submissions` instead)
