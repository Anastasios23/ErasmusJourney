# 🧪 Testing Guide for Admin Systems

## Overview

We've created 3 admin systems that need testing:

1. **Destinations Admin** (`/admin/destinations-enhanced`)
2. **University Exchanges Admin** (`/admin/university-exchanges`)
3. **Student Accommodations Admin** (`/admin/student-accommodations`)

## Test Data Required

### 1. For Destinations Admin Testing

**Form Type**: Basic Information forms
**Sample Data Needed**:

```json
{
  "type": "basic-information",
  "data": {
    "universityInCyprus": "University of Cyprus",
    "hostUniversity": "University of Barcelona",
    "hostCity": "Barcelona",
    "hostCountry": "Spain",
    "studyLevel": "BACHELOR",
    "fieldOfStudy": "Computer Science",
    "studyPeriod": "Fall 2024",
    "overallExperience": "Amazing experience!",
    "culturalHighlights": ["Sagrada Familia", "Park Güell"],
    "challenges": ["Language barrier"],
    "recommendations": "Learn Spanish first",
    "costOfLiving": { "accommodation": 400, "food": 250 }
  },
  "status": "SUBMITTED"
}
```

### 2. For University Exchanges Admin Testing

**Form Type**: Course Matching forms
**Sample Data Needed**:

```json
{
  "type": "course-matching",
  "data": {
    "hostUniversity": "Sorbonne University",
    "hostCity": "Paris",
    "hostCountry": "France",
    "courseMatching": {
      "availableCourses": [
        {
          "courseName": "French Literature",
          "courseCode": "FLIT301",
          "ects": 6,
          "difficultyLevel": "MEDIUM",
          "examType": "WRITTEN"
        }
      ],
      "totalEcts": 14,
      "language": "French"
    }
  },
  "status": "SUBMITTED"
}
```

### 3. For Student Accommodations Admin Testing

**Form Type**: Accommodation forms  
**Sample Data Needed**:

```json
{
  "type": "accommodation",
  "data": {
    "hostCity": "Barcelona",
    "hostCountry": "Spain",
    "housingType": "DORMITORY",
    "monthlyRent": 450,
    "roomType": "SINGLE",
    "amenities": ["WiFi", "Kitchen"],
    "overallRating": 4,
    "experienceDescription": "Great dorm!",
    "pros": ["Good location"],
    "cons": ["Noisy"]
  },
  "status": "SUBMITTED"
}
```

## Testing Steps

### Step 1: Insert Test Data

1. Run the test data script: `npx ts-node scripts/quick-test-data.ts`
2. Or manually insert via database/API

### Step 2: Test Admin Destinations

1. Navigate to `/admin/destinations-enhanced`
2. Should see pending submissions from basic-information forms
3. Click "Review & Add Content" on a submission
4. Add admin content (description, photos, highlights)
5. Click "Approve & Publish"
6. Check "Live Destinations" tab to see published content

### Step 3: Test Admin University Exchanges

1. Navigate to `/admin/university-exchanges`
2. Should see pending submissions with course data
3. Review course details (ECTS, difficulty, exam types)
4. Click "Review & Add Admin Content"
5. Add photos, descriptions, partnership info
6. Approve to create university exchange listing

### Step 4: Test Admin Student Accommodations

1. Navigate to `/admin/student-accommodations`
2. Should see pending accommodation submissions
3. Review student ratings, experience, pros/cons
4. Click "Review & Add Content"
5. Add admin photos (student photos removed per requirements)
6. Add verified contact info and professional descriptions
7. Approve to create accommodation listing

## Expected Admin Features

### ✅ What Should Work:

- **Submission fetching** from FormSubmission table
- **Review dialogs** with student data display
- **Admin content forms** for adding professional content
- **Photo upload** (admin-only for accommodations)
- **Approval/rejection** workflow
- **Status tracking** (SUBMITTED → APPROVED/REJECTED)

### 🎯 Key Test Points:

- **Data separation**: No study level, application process, or student photos in accommodations
- **Admin photo control**: Only admins can add accommodation photos
- **Form type filtering**: Each admin page shows correct form types
- **Review process**: Full workflow from submission to published content

## Troubleshooting

### If No Submissions Appear:

1. Check database for FormSubmission records
2. Verify form types match API filters
3. Check API endpoints are working
4. Ensure admin authentication is working

### If Approval Fails:

1. Check API endpoint responses
2. Verify data structure matches expectations
3. Check database models and relationships
4. Review error logs in browser console

### Manual Data Insertion (if script fails):

You can manually insert via Prisma Studio or database tool:

```sql
INSERT INTO FormSubmission (userId, type, title, data, status)
VALUES ('user-id', 'basic-information', 'Test Submission', '{"hostCity": "Barcelona"}', 'SUBMITTED');
```

## Success Indicators

- ✅ Admin pages load without errors
- ✅ Submissions appear in pending tabs
- ✅ Review dialogs open with correct data
- ✅ Admin can add content and photos
- ✅ Approval creates published listings
- ✅ Live tabs show approved content
