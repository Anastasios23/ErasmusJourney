# Admin Form Data Diagnostic & Improvements

## 🎯 Current Status

**Backend Server:** ✅ Running on http://localhost:5000  
**Database:** PostgreSQL (configured)  
**Frontend:** Next.js with TypeScript

## 📊 Data Flow Analysis

### 1. Form Submission Process

#### Current Forms:

- **Basic Information** (`/basic-information`)
- **Course Matching** (`/course-matching`)
- **Accommodation** (`/accommodation`)
- **Living Expenses** (`/living-expenses`)
- **Erasmus Experience Form** (`/erasmus-experience-form`)

#### Data Storage Locations:

**A. ErasmusExperience Table** (Primary Storage)

- Forms save to: `/api/erasmus-experiences`
- Hook: `useErasmusExperience()`
- Status: `DRAFT` → `IN_PROGRESS` → `SUBMITTED`
- Stores: basicInfo, courses, accommodation, livingExpenses, experience

**B. FormSubmission Table** (Secondary/Legacy)

- API: `/api/form-submissions`
- Used by: Destination creation flow
- Status: `DRAFT` → `SUBMITTED` → `PUBLISHED`
- Stores: Generic form data with type field

**C. Application Table** (Separate flow)

- For formal Erasmus applications
- Different from experience sharing

## 🔍 Issues Identified

### Issue 1: Multiple Data Storage Systems

**Problem:** Forms save to different tables/APIs causing confusion

- `ErasmusExperience` - Main multi-step form
- `FormSubmission` - Destination submissions
- Backend SQLite - Separate database at `server/erasmus.db`

**Impact:**

- Admin pages may look at wrong table
- Data fragmentation across systems
- Inconsistent submission tracking

### Issue 2: Backend/Frontend Mismatch

**Two Separate Backends Running:**

1. **Next.js API Routes** (Primary) - Port 3000
   - `/api/erasmus-experiences`
   - `/api/admin/form-submissions`
   - Uses Prisma + PostgreSQL
2. **Express Server** (Secondary) - Port 5000
   - Basic auth endpoints
   - Uses SQLite database
   - May not sync with main app

**Issue:** Admin pages fetch from Next.js API, but forms might save to wrong location.

### Issue 3: Admin Page Data Fetching

**Current Admin Pages:**

- `/pages/admin/index.tsx` - Dashboard (fetches FormSubmissions)
- `/pages/admin/form-review.tsx` - Review submissions
- `/pages/admin/destinations.tsx` - Manage destinations
- `/pages/submissions.tsx` - View all submissions

**Problem:**

```typescript
// Admin fetches from FormSubmission table
await fetch("/api/admin/form-submissions?limit=100");

// But forms save to ErasmusExperience table
await saveProgress({ basicInfo: formData });
// This calls: /api/erasmus-experiences
```

### Issue 4: Authentication Disabled

Most auth checks are commented out, allowing anonymous access but potentially causing session-related data issues.

## 🛠️ Recommended Fixes

### Fix 1: Unify Data Storage

**Option A: Use ErasmusExperience for Everything** (Recommended)

- Update all forms to save to ErasmusExperience
- Update admin pages to fetch from ErasmusExperience
- Keep FormSubmission only for legacy data

**Option B: Dual System with Clear Separation**

- ErasmusExperience: Multi-step form data
- FormSubmission: Quick submissions (destinations, etc.)
- Update admin to show both sources

### Fix 2: Update Admin Dashboard

Create unified admin view that shows data from correct sources:

```typescript
// pages/admin/index.tsx
const fetchAllData = async () => {
  // Fetch from ErasmusExperience (main forms)
  const experiencesRes = await fetch("/api/erasmus-experiences");
  const experiences = await experiencesRes.json();

  // Fetch from FormSubmission (quick submissions)
  const submissionsRes = await fetch("/api/admin/form-submissions");
  const submissions = await submissionsRes.json();

  // Combine and display both
  return { experiences, submissions };
};
```

### Fix 3: Update Form Submission Logic

Ensure all forms consistently save to the same place:

**Current (basic-information.tsx):**

```typescript
await saveProgress({
  basicInfo: formData,
}); // Saves to ErasmusExperience
```

**Should also create FormSubmission for admin visibility:**

```typescript
// After successful save to ErasmusExperience
await fetch("/api/admin/form-submissions", {
  method: "POST",
  body: JSON.stringify({
    type: "basic-info",
    title: `${formData.firstName} ${formData.lastName} - ${formData.hostCity}`,
    data: formData,
    status: "SUBMITTED",
    hostCity: formData.hostCity,
    hostCountry: formData.hostCountry,
  }),
});
```

### Fix 4: Consolidate Backend Servers

**Decision Needed:**

- ✅ Keep only Next.js API (Port 3000) - Recommended
- ❌ Remove Express server (Port 5000) - No longer needed
- All data through Prisma + PostgreSQL

**Migration Steps:**

1. Export data from SQLite (`server/erasmus.db`)
2. Import to PostgreSQL
3. Remove Express server
4. Update all fetch calls to use `/api/*` routes

## 📋 Implementation Checklist

### Phase 1: Data Verification

- [ ] Check what's in `ErasmusExperience` table
  ```sql
  SELECT * FROM "ErasmusExperience" LIMIT 10;
  ```
- [ ] Check what's in `FormSubmission` table
  ```sql
  SELECT * FROM "FormSubmission" LIMIT 10;
  ```
- [ ] Check Express SQLite database
  ```bash
  cd server && sqlite3 erasmus.db ".tables"
  ```

### Phase 2: Admin Page Updates

- [ ] Update `/pages/admin/index.tsx` to fetch from both sources
- [ ] Add filter tabs: "Experiences" vs "Quick Submissions"
- [ ] Show proper data fields for each type
- [ ] Add export functionality

### Phase 3: Form Submission Fixes

- [ ] Update all form handlers to create FormSubmission entry
- [ ] Ensure proper status tracking
- [ ] Add proper error handling
- [ ] Test full form submission flow

### Phase 4: Backend Consolidation

- [ ] Migrate Express data to Prisma
- [ ] Update environment variables
- [ ] Remove Express server code
- [ ] Update documentation

## 🔧 Quick Diagnostic Commands

### Check Database Contents

```bash
# From project root
npx prisma studio
# Opens GUI at http://localhost:5555
```

### Test API Endpoints

```bash
# Get all experiences
curl http://localhost:3000/api/erasmus-experiences

# Get all form submissions
curl http://localhost:3000/api/admin/form-submissions

# Get submissions (admin view)
curl http://localhost:3000/api/submissions
```

### Check Server Logs

```bash
# Watch Next.js logs
npm run dev

# Watch Express logs (if still needed)
cd server && npm run dev
```

## 📊 Current Data Schema

### ErasmusExperience Table

```typescript
{
  id: string
  userId: string
  currentStep: number
  completedSteps: number[]
  basicInfo: JSON        // ✅ Basic form data here
  courses: JSON          // ✅ Course matching here
  accommodation: JSON    // ✅ Accommodation here
  livingExpenses: JSON   // ✅ Living expenses here
  experience: JSON       // ✅ Final experience here
  status: DRAFT | IN_PROGRESS | SUBMITTED
  lastSavedAt: DateTime
  submittedAt: DateTime
}
```

### FormSubmission Table

```typescript
{
  id: string;
  userId: string;
  type: string; // 'basic-info', 'destination', etc.
  title: string;
  data: JSON; // Generic data storage
  status: DRAFT | SUBMITTED | PUBLISHED;
  hostCity: string;
  hostCountry: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

## 🎨 Admin UI Improvements

### Current Issues:

1. ❌ Empty tables - fetching from wrong source
2. ❌ No filtering by form type
3. ❌ Limited data preview
4. ❌ No bulk actions

### Proposed Improvements:

1. ✅ Unified dashboard with tabs
2. ✅ Filter by: Status, Type, Date, User
3. ✅ Rich data preview cards
4. ✅ Bulk approve/reject/export
5. ✅ Search functionality
6. ✅ Analytics dashboard

## 📝 Next Steps

1. **Run Diagnostics** (15 min)

   ```bash
   npm run dev
   npx prisma studio
   ```

   Check which tables have data

2. **Update Admin Index** (30 min)
   Modify `/pages/admin/index.tsx` to fetch from correct source

3. **Test Form Flow** (20 min)
   Submit a test form and verify it appears in admin

4. **Document Findings** (10 min)
   Record what data is where

## 🚀 Testing Guide

### Test Form Submission

1. Go to http://localhost:3000/basic-information
2. Fill out form
3. Click "Save & Continue"
4. Check admin at http://localhost:3000/admin
5. Verify data appears

### Test Admin Access

1. Go to http://localhost:3000/admin
2. Check if submissions show up
3. Try filtering/sorting
4. Test status updates

### Check Database

```bash
npx prisma studio
# Look in ErasmusExperience table
# Look in FormSubmission table
# Compare what you see
```

## 💡 Pro Tips

1. **Use Prisma Studio** - Best way to inspect data visually
2. **Check Browser DevTools** - Network tab shows API calls
3. **Add Console Logs** - Temporarily log in form handlers
4. **Use React DevTools** - Inspect component state

## ⚠️ Common Pitfalls

1. **Wrong API endpoint** - Double-check fetch URLs
2. **Missing userId** - Forms need authenticated user
3. **Status mismatch** - Admin filters by status, ensure consistent values
4. **JSON parsing** - Data field is JSON, needs proper handling

## 📞 Support

If issues persist:

1. Check browser console for errors
2. Check server logs for API errors
3. Verify database connection
4. Test with Prisma Studio
5. Review this diagnostic document

---

**Last Updated:** October 28, 2025  
**Status:** Diagnostic Complete - Ready for Implementation
