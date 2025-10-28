# Quick Testing Guide - Unified Submission System

**Date:** October 28, 2025

---

## Prerequisites

✅ Backend running on port 3000  
✅ Database migrated (181 records)  
✅ User authenticated via NextAuth  
✅ Admin user exists in database

---

## Test Scenario 1: Student Creates & Submits Experience

### Step 1: Create Draft Submission

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "submissionType": "FULL_EXPERIENCE",
    "data": {
      "basicInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    },
    "hostCity": "Paris",
    "hostCountry": "France",
    "hostUniversity": "Sorbonne University",
    "semester": "Fall 2024",
    "status": "DRAFT"
  }'
```

**Expected Response:**

```json
{
  "id": "cm...",
  "userId": "...",
  "status": "DRAFT",
  "submissionType": "FULL_EXPERIENCE",
  "createdAt": "2025-10-28T..."
}
```

**Save the `id` for next steps!**

---

### Using Browser Console (Easier)

```javascript
// 1. Create submission
const response = await fetch("/api/submissions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    submissionType: "FULL_EXPERIENCE",
    data: { basicInfo: { name: "Test" } },
    hostCity: "Paris",
    hostCountry: "France",
    hostUniversity: "Sorbonne",
  }),
});
const { id } = await response.json();
console.log("Created:", id);

// 2. Update
await fetch(`/api/submissions/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    data: { accommodation: { type: "Residence", monthlyRent: 450 } },
  }),
});

// 3. Submit
await fetch(`/api/submissions/${id}/submit`, {
  method: "POST",
});

// 4. Admin approve (as admin)
await fetch(`/api/admin/submissions/${id}/approve`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    qualityScore: 5,
    isFeatured: true,
  }),
});
```

---

## Quick Verification

### Check Submissions Count

```sql
SELECT status, COUNT(*) FROM student_submissions GROUP BY status;
```

### Check Views Created

```sql
SELECT COUNT(*) FROM accommodation_views;
SELECT COUNT(*) FROM course_exchange_views;
```

---

**See full TESTING_GUIDE.md for complete scenarios**
