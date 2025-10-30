# 🧪 Erasmus Journey - Form Submission Testing Checklist

**Date**: October 30, 2025  
**Goal**: Verify the complete form submission flow works correctly

---

## ✅ **COMPLETED FIXES**

- [x] Removed duplicate "Exchange Details" section from form
- [x] Removed `semester`, `homeUniversityId`, `hostUniversityId` from validation schema
- [x] Updated API to only extract `hostCity` and `hostCountry` (not removed fields)
- [x] Backend now matches frontend form structure

---

## 📋 **PHASE 1: Form Submission Testing**

### **Test 1.1: Access the Form** ⏱️ 2 minutes

**Steps:**

1. Open browser to `http://localhost:3000/basic-information`
2. Check if form loads without errors
3. Verify all sections are visible:
   - ✅ Personal Information
   - ✅ Academic Information
   - ✅ Exchange Preferences

**Expected Result:**

- Form loads successfully
- No TypeScript errors in browser console (F12 → Console tab)
- All fields are empty (if new) or filled (if continuing)

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**Notes**: ********************\_\_\_\_********************

---

### **Test 1.2: Fill Out Basic Information** ⏱️ 5 minutes

**Steps:**

1. Fill in **Personal Information**:
   - First Name: `Anastasios`
   - Last Name: `Andreou`
   - Email: `ana@gmail.com`
   - Date of Birth: `1995-10-15` (or your date)
   - Nationality: `Cypriot`

2. Fill in **Academic Information**:
   - Cyprus University: `University of Nicosia`
   - Level of Study: `Bachelor`
   - Department: `Marketing management (BBA)` (wait for dropdown to populate)
   - ✅ Verify you see: "37 partner universities available..."

3. Fill in **Exchange Preferences**:
   - Exchange Period: `Fall Semester`
   - Preferred Host Country: `Latvia`
   - Preferred Host City: `Riga`
   - Preferred Host University: `Latvian Academy of Culture - Riga`

**Expected Result:**

- All dropdowns populate correctly
- No validation errors appear
- "37 partner universities" message shows (or similar number)

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**Notes**: ********************\_\_\_\_********************

---

### **Test 1.3: Auto-Save Functionality** ⏱️ 30 seconds

**Steps:**

1. After filling the form, **wait 15 seconds** without clicking anything
2. Watch top-right corner of page
3. Look for "Auto-saving..." then "✓ Auto-saved" indicator

**Expected Result:**

- Small indicator appears saying "Auto-saving..."
- Changes to "✓ Auto-saved" after completion
- No errors in browser console

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**Notes**: ********************\_\_\_\_********************

---

### **Test 1.4: Manual Save Draft** ⏱️ 1 minute

**Steps:**

1. Click "Save Draft" button at bottom of form
2. Wait for response
3. Look for success message

**Expected Result:**

- Green success alert appears: "Draft saved successfully!"
- Alert disappears after 3 seconds
- No errors in browser console

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**Notes**: ********************\_\_\_\_********************

---

### **Test 1.5: Submit Form** ⏱️ 1 minute

**Steps:**

1. Ensure all required fields are filled
2. Click "Continue to Course Matching" button
3. Observe what happens

**Expected Result:**

- Page redirects to `/course-matching`
- No errors in browser console
- Data is saved (we'll verify in next test)

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**If FAIL, error message**: ********************\_\_\_\_********************

---

### **Test 1.6: Verify Data in Database** ⏱️ 3 minutes

**Steps:**

1. Open new terminal
2. Run: `npx prisma studio`
3. Browser opens Prisma Studio (http://localhost:5555)
4. Click on **"erasmus_experiences"** table
5. Find your record (should be newest one)
6. Click on the record to expand it

**Expected Result:**

- Record exists with your userId
- `basicInfo` field contains JSON with all your data:
  ```json
  {
    "firstName": "Anastasios",
    "lastName": "Andreou",
    "hostCity": "Riga",
    "hostCountry": "Latvia",
    "hostUniversity": "Latvian Academy of Culture - Riga",
    "exchangePeriod": "semester1",
    ...
  }
  ```
- `hostCity` field (top-level): `"Riga"`
- `hostCountry` field (top-level): `"Latvia"`
- `status`: `"DRAFT"` (if saved) or `"SUBMITTED"` (if you clicked Continue)

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**Screenshot or Notes**: ********************\_\_\_\_********************

---

## 📋 **PHASE 2: Dashboard Display Testing**

### **Test 2.1: Student Dashboard - My Submissions** ⏱️ 2 minutes

**Steps:**

1. Navigate to `http://localhost:3000/my-submissions`
2. Check if your submission appears
3. Look at the submission card

**Expected Result:**

- You see a card with your submission
- Title: "Anastasios Andreou's Experience in Riga" (or similar)
- Status badge shows "Draft" or "Under Review"
- Location: "Riga, Latvia"
- University shows correctly

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**If FAIL**: ********************\_\_\_\_********************

---

### **Test 2.2: Edit Button Works** ⏱️ 1 minute

**Steps:**

1. On `/my-submissions` page
2. Click "Continue Editing" or "Edit" button on your submission
3. Observe redirect

**Expected Result:**

- Redirects back to `/basic-information`
- Form is pre-filled with your previous data
- All fields show correct values

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**Notes**: ********************\_\_\_\_********************

---

### **Test 2.3: Stats Cards Display** ⏱️ 1 minute

**Steps:**

1. On `/my-submissions` page
2. Look at the top stats cards

**Expected Result:**

- **Total**: Shows "1" (or number of your submissions)
- **Approved**: Shows "0" (if not approved yet)
- **Under Review**: Shows "1" (if status is SUBMITTED)
- **Avg Review Time**: Shows "N/A" or a number

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

**Notes**: ********************\_\_\_\_********************

---

## 📋 **PHASE 3: Admin Review Testing** (Optional - if you have admin access)

### **Test 3.1: Check Admin Access** ⏱️ 2 minutes

**Steps:**

1. Open Prisma Studio: `npx prisma studio`
2. Go to **"users"** table
3. Find your user (email: `ana@gmail.com` or `test@erasmus.local`)
4. Check the `role` field

**Current Role**: ****\_\_\_\_****

**Action Needed:**

- If role is `"USER"`, change to `"ADMIN"` to test admin features
- Click on the cell → Type `ADMIN` → Press Enter → Save

**✅ Role Updated to ADMIN** / **⏭️ Skip Admin Tests**: ****\_\_\_\_****

---

### **Test 3.2: Access Admin Dashboard** ⏱️ 1 minute

**Steps:**

1. Navigate to `http://localhost:3000/admin/unified-dashboard`
2. Check if page loads

**Expected Result:**

- Dashboard loads with multiple cards
- "Review Submissions" card shows with orange color
- Badge shows number of pending submissions

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

---

### **Test 3.3: Review Submissions Page** ⏱️ 2 minutes

**Steps:**

1. Click on "Review Submissions" card
2. Should go to `/admin/review-submissions`
3. Check if your submission appears

**Expected Result:**

- List of submissions with status "SUBMITTED"
- Your submission shows: Name, Location (Riga, Latvia), Semester
- "Review" button is visible

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

---

### **Test 3.4: Review a Submission** ⏱️ 3 minutes

**Steps:**

1. On `/admin/review-submissions` page
2. Click "Review" button on a submission
3. Check the detail view

**Expected Result:**

- Shows all submission details:
  - Student info panel (name, email, location)
  - Basic Information section with all fields
  - Exchange Preferences section
- Three action buttons appear:
  - Approve (green)
  - Request Revision (orange)
  - Reject (red)

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

---

### **Test 3.5: Approve Submission** ⏱️ 2 minutes

**Steps:**

1. In review detail view
2. Optionally add feedback in textarea
3. Click "Approve" button
4. Wait for response

**Expected Result:**

- Green success message appears
- Returns to list view
- Submission disappears from SUBMITTED list (now APPROVED)

**✅ PASS** / **❌ FAIL**: ****\_\_\_\_****

---

## 📋 **PHASE 4: Full Workflow Test**

### **Test 4.1: Complete Submission Flow** ⏱️ 10 minutes

**End-to-End Test:**

1. **Submit**: Fill form → Click "Continue to Course Matching"
2. **View**: Go to `/my-submissions` → See submission with "Under Review" status
3. **Admin Review**: Go to `/admin/review-submissions` → Click "Review"
4. **Approve**: Click "Approve" button
5. **Verify Student View**: Go back to `/my-submissions` → Status shows "Approved ✓"
6. **Check Database**: Prisma Studio → status = "APPROVED", reviewedAt has timestamp

**✅ COMPLETE FLOW WORKS** / **❌ FAIL AT STEP**: ****\_\_\_\_****

---

## 🐛 **Common Issues & Solutions**

### Issue 1: Form validation errors

**Solution**:

- Check all required fields are filled
- Verify no old validation rules for removed fields
- Check browser console for specific error

### Issue 2: Data not saving

**Solution**:

- Check Prisma Studio to see if `erasmus_experiences` record exists
- Verify `userId` matches a user in `users` table
- Check terminal for API errors

### Issue 3: Dashboard shows nothing

**Solution**:

- Verify submission status is correct in database
- Check if `hostCity` and `hostCountry` are populated at top level
- Refresh page with Ctrl+Shift+R (hard refresh)

### Issue 4: Admin can't see submissions

**Solution**:

- Verify user role is "ADMIN" in database
- Check submission status is "SUBMITTED" (not "DRAFT")
- Check `/api/admin/erasmus-experiences?status=SUBMITTED` endpoint

---

## 📊 **Test Results Summary**

**Date Tested**: ****\_\_\_\_****  
**Tester**: ****\_\_\_\_****

| Phase                    | Tests Passed  | Tests Failed  | Notes            |
| ------------------------ | ------------- | ------------- | ---------------- |
| Phase 1: Form Submission | \_\_ / 6      | \_\_ / 6      | ****\_\_\_\_**** |
| Phase 2: Dashboard       | \_\_ / 3      | \_\_ / 3      | ****\_\_\_\_**** |
| Phase 3: Admin Review    | \_\_ / 5      | \_\_ / 5      | ****\_\_\_\_**** |
| Phase 4: Full Workflow   | \_\_ / 1      | \_\_ / 1      | ****\_\_\_\_**** |
| **TOTAL**                | **\_\_ / 15** | **\_\_ / 15** | ****\_\_\_\_**** |

---

## 🎯 **Next Steps After Testing**

Once all tests pass:

### **Priority 1: Course Matching Form**

- [ ] Design course mapping interface
- [ ] Create API endpoint for course data
- [ ] Build form validation
- [ ] Test course submission

### **Priority 2: Accommodation Form**

- [ ] Build accommodation details form
- [ ] Add photo upload capability
- [ ] Test accommodation submission

### **Priority 3: Living Expenses Form**

- [ ] Create expense breakdown form
- [ ] Add budget calculator
- [ ] Test expense submission

### **Priority 4: Final Reflection Form**

- [ ] Build tips for future students section
- [ ] Add rating system
- [ ] Test final submission

### **Priority 5: Public Pages**

- [ ] City statistics pages
- [ ] Student story pages
- [ ] Search and filter functionality

---

## 📝 **Notes & Observations**

Use this space to document any issues, suggestions, or observations:

---

---

---

---

---

## ✅ **Sign Off**

**Testing Completed**: ☐ YES / ☐ NO  
**Ready for Next Phase**: ☐ YES / ☐ NO  
**Blocker Issues**: ********************\_\_\_\_********************

**Signature**: ****\_\_\_\_****  
**Date**: ****\_\_\_\_****
