# 🚀 Quick Start Guide - Admin Dashboard

## Running the Application

### Step 1: Start the Backend (Optional)

The Express backend on port 5000 is currently running. You may not need it since Next.js handles most APIs.

```bash
# If you want to stop it
# Press Ctrl+C in the terminal where it's running

# To start again later
cd server
npm run dev
```

### Step 2: Start the Main Application

```bash
# From project root
npm run dev
```

This starts Next.js on **http://localhost:3000**

### Step 3: Access Admin Pages

#### Current Admin Pages:

1. **Original Admin Dashboard**
   - URL: http://localhost:3000/admin
   - Shows: FormSubmissions from database
2. **NEW Unified Dashboard** ⭐
   - URL: http://localhost:3000/admin/unified-dashboard
   - Shows: BOTH ErasmusExperiences AND FormSubmissions
   - Recommended: Use this one!

3. **Other Admin Pages:**
   - Form Review: http://localhost:3000/admin/form-review
   - Destinations: http://localhost:3000/admin/destinations
   - Stories: http://localhost:3000/admin/stories
   - Analytics: http://localhost:3000/admin/analytics

## Testing the Data Flow

### Test 1: Submit a Form

1. Go to http://localhost:3000/basic-information
2. Fill out the form (at least required fields)
3. Click "Save & Continue" or "Save Draft"
4. Check the unified dashboard - should appear there

### Test 2: View in Database

```bash
# Open Prisma Studio
npx prisma studio
```

Then check:

- **ErasmusExperience** table - Multi-step form data
- **FormSubmission** table - Quick submissions
- **User** table - User accounts

### Test 3: Check API Responses

Open browser DevTools (F12) → Network tab, then:

1. Visit http://localhost:3000/admin/unified-dashboard
2. Look for these API calls:
   - `/api/erasmus-experiences` - Should return array of experiences
   - `/api/admin/form-submissions` - Should return submissions
3. Click on each to see the actual data

## Common Issues & Solutions

### Issue: Admin shows empty tables

**Diagnosis:**

```bash
# Check what data exists
npx prisma studio

# Look in these tables:
# - ErasmusExperience (multi-step forms)
# - FormSubmission (quick forms)
```

**Solutions:**

1. If NO data exists:
   - Submit a test form first
   - Go to /basic-information and fill it out
2. If data exists but doesn't show:
   - Check API is fetching from correct endpoint
   - Open DevTools Network tab and check API responses
   - Verify no JavaScript errors in Console

### Issue: Forms don't save data

**Check:**

1. Are you logged in? (Auth is disabled, but check session)
2. Check browser console for errors
3. Check API response in Network tab
4. Try Prisma Studio to see if data is being created

**Debug Command:**

```bash
# Watch server logs
npm run dev
# Submit form and watch for any errors
```

### Issue: Data in wrong table

**Understanding:**

- **ErasmusExperience** - Created by multi-step forms (basic-info, course-matching, etc.)
- **FormSubmission** - Created by quick/destination forms
- Both are valid! Admin should show both.

**Fix:**
Use the unified dashboard: `/admin/unified-dashboard`

## Data Sources Explained

### ErasmusExperience Table

```
Source: /api/erasmus-experiences
Forms:
  - /basic-information
  - /course-matching
  - /accommodation
  - /living-expenses
  - /erasmus-experience-form

Fields:
  - basicInfo (JSON)
  - courses (JSON)
  - accommodation (JSON)
  - livingExpenses (JSON)
  - experience (JSON)
  - status: DRAFT | IN_PROGRESS | SUBMITTED
```

### FormSubmission Table

```
Source: /api/admin/form-submissions
Forms:
  - Quick submission forms
  - Destination creation

Fields:
  - type (string)
  - title (string)
  - data (JSON)
  - hostCity, hostCountry
  - status: DRAFT | SUBMITTED | PUBLISHED
```

## Improving Data Collection

### Option 1: Make Forms Save to Both Tables

Update form submission handlers to create BOTH:

```typescript
// After saving to ErasmusExperience
await saveProgress({ basicInfo: formData });

// Also create FormSubmission for admin visibility
await fetch("/api/admin/form-submissions", {
  method: "POST",
  body: JSON.stringify({
    type: "basic-info",
    title: `${formData.firstName} ${formData.lastName} - ${formData.hostCity}`,
    status: "SUBMITTED",
    hostCity: formData.hostCity,
    hostCountry: formData.hostCountry,
    data: formData,
  }),
});
```

### Option 2: Create Admin API to Read from Both

The unified dashboard already does this! Just use it.

## Recommended Next Steps

### 1. Use the Unified Dashboard (5 minutes)

- Navigate to http://localhost:3000/admin/unified-dashboard
- Check if you see data from both tables
- Test filters and search

### 2. Submit Test Data (10 minutes)

- Fill out the basic information form
- Submit completely
- Verify it appears in admin

### 3. Check Database (5 minutes)

```bash
npx prisma studio
```

- Browse all tables
- Verify data structure
- Check relationships

### 4. Review Diagnostic Document (15 minutes)

Read: `ADMIN_FORM_DATA_DIAGNOSTIC.md` for full details

### 5. Plan Improvements (Optional)

Based on findings, decide:

- Keep both tables? ✅ Recommended
- Update forms to save to both?
- Add more admin features?
- Consolidate backends?

## Quick Commands Reference

```bash
# Start main app
npm run dev

# Start backend (if needed)
cd server && npm run dev

# Open database GUI
npx prisma studio

# Check database
npx prisma db push

# Generate Prisma client
npx prisma generate

# View logs
# Just watch the terminal where npm run dev is running
```

## Admin Features Available

✅ View all experiences (multi-step forms)  
✅ View all submissions (quick forms)  
✅ Filter by status  
✅ Search by name/email/city  
✅ See submission dates  
✅ View statistics  
⚠️ Status updates (needs implementation)  
⚠️ Bulk actions (needs implementation)  
⚠️ Export to CSV (needs implementation)

## Getting Help

1. **Check browser console** - F12 → Console tab
2. **Check server logs** - Terminal where npm run dev runs
3. **Use Prisma Studio** - Visual database inspection
4. **Read diagnostic doc** - ADMIN_FORM_DATA_DIAGNOSTIC.md
5. **Check network calls** - F12 → Network tab

## Pro Tips

💡 **Use Prisma Studio** - Best way to see actual database contents  
💡 **Check Network Tab** - See what APIs are being called  
💡 **Console Log Everything** - When debugging, add console.logs  
💡 **Test with Real Data** - Fill out complete forms to test properly  
💡 **Bookmark Admin URLs** - Save time accessing admin pages

## Success Checklist

- [ ] Main app running on localhost:3000
- [ ] Can access /admin/unified-dashboard
- [ ] Can submit a form successfully
- [ ] Form data appears in admin
- [ ] Prisma Studio shows data in tables
- [ ] No errors in browser console
- [ ] Understanding data flow (read diagnostic doc)

---

**Ready to start?**

```bash
# 1. Start the app
npm run dev

# 2. Open admin
# http://localhost:3000/admin/unified-dashboard

# 3. Open database viewer
npx prisma studio

# 4. Test a form submission
# http://localhost:3000/basic-information
```

Good luck! 🎉
