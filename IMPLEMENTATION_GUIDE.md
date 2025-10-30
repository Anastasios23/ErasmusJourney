# Erasmus Journey - Submission System Implementation Guide

## 📊 **System Overview**

**Goal:** Create a complete submission workflow where:

1. Students fill out a 5-step form (ONE complete submission)
2. Admin reviews the entire submission
3. Public pages show aggregated statistics (privacy-preserving)

---

## 🗄️ **Phase 1: Database Migration** ✅ READY

### Run Migration

```bash
# Generate Prisma client with new models
npx prisma generate

# Create migration
npx prisma migrate dev --name add_submission_workflow

# Verify schema
npx prisma studio
```

### What Changed:

**erasmus_experiences table - ADDED:**

- `semester` - "2024-FALL" | "2024-SPRING" | "2024-SUMMER" | "2024-FULL"
- `hostCity`, `hostCountry` - Where student went
- `hostUniversityId`, `homeUniversityId` - University references
- `reviewedAt`, `reviewedBy`, `reviewFeedback` - Admin review data
- `revisionCount` - Track revision attempts (max 1)

**NEW TABLES:**

- `review_actions` - Audit log of all admin actions
- `city_statistics` - Pre-calculated stats for public pages

**Status Flow:**

```
DRAFT → SUBMITTED → [APPROVED | REJECTED | REVISION_NEEDED]
                           ↓
                      (back to DRAFT if revision allowed)
```

---

## 🎯 **Phase 2: Update Form Flow**

### Current vs New Flow

**BEFORE:**

```typescript
// Each step saves independently
PUT /api/erasmus-experiences
{
  basicInfo: {...}  // Step 1
}

PUT /api/erasmus-experiences
{
  courses: [...]    // Step 2
}
// etc...
```

**AFTER:**

```typescript
// 0. Initialize submission (NEW - at start of form)
POST /api/erasmus-experiences/init
{
  semester: "2024-FALL",
  hostCity: "Barcelona",
  hostCountry: "Spain",
  hostUniversityId: "ub-barcelona",
  homeUniversityId: "athens-uni"
}
→ Returns experienceId, status="DRAFT"

// 1-5. Save each step (keep existing)
PUT /api/erasmus-experiences/{id}
{
  basicInfo: {...}          // Step 1
  completedSteps: ["step1"] // Mark complete
}

// Users can go BACK and edit any step while status=DRAFT

// 6. Final submit (NEW - on last step)
POST /api/erasmus-experiences/{id}/submit
→ Validates all 5 steps complete
→ Changes status: DRAFT → SUBMITTED
→ Locks form (no more edits unless revision requested)
```

### Update Existing Forms

**Files to modify:**

1. `pages/basic-information.tsx` - Add semester/university selection
2. `pages/course-matching.tsx` - Keep as-is
3. `pages/accommodation.tsx` - Keep as-is
4. `pages/living-expenses.tsx` - Keep as-is
5. `pages/help-future-students.tsx` - Add final submit button

---

## 👨‍💼 **Phase 3: Admin Review System**

### Admin Dashboard Updates

**File:** `pages/admin/unified-dashboard.tsx`

**Add Tabs:**

```typescript
<Tabs>
  <Tab value="pending">
    Pending Review ({pendingCount})
  </Tab>
  <Tab value="approved">
    Approved ({approvedCount})
  </Tab>
  <Tab value="rejected">
    Rejected ({rejectedCount})
  </Tab>
</Tabs>
```

**Submission List:**

```typescript
{submissions.map(sub => (
  <Card>
    <h3>{sub.user.name} - {sub.hostCity}, {sub.hostCountry}</h3>
    <p>Semester: {sub.semester}</p>
    <p>Submitted: {formatDate(sub.submittedAt)}</p>
    <Badge>{sub.status}</Badge>
    <Button onClick={() => reviewSubmission(sub.id)}>
      Review Full Submission
    </Button>
  </Card>
))}
```

### Review Modal/Page

**Show ALL 5 steps together:**

```typescript
// GET /api/admin/erasmus-experiences/{id}
{
  id: "exp123",
  status: "SUBMITTED",
  semester: "2024-FALL",
  user: { name: "John Doe", email: "john@example.com" },
  hostUniversity: { name: "University of Barcelona" },
  homeUniversity: { name: "Athens University" },

  // All 5 steps
  basicInfo: { ... },
  courses: [ ... ],
  accommodation: { ... },
  livingExpenses: { ... },
  experience: { ... }
}
```

**Admin Actions:**

```typescript
// Approve
POST /api/admin/erasmus-experiences/{id}/review
{
  action: "APPROVED",
  feedback: "Great submission!"
}
→ status: SUBMITTED → APPROVED
→ Trigger stats recalculation for Barcelona
→ Show on public pages

// Reject
POST /api/admin/erasmus-experiences/{id}/review
{
  action: "REJECTED",
  feedback: "Please provide more detail about accommodation costs"
}
→ status: SUBMITTED → REJECTED
→ User sees feedback but CANNOT edit (your rule)

// Request Revision (ONE chance only)
POST /api/admin/erasmus-experiences/{id}/review
{
  action: "REVISION_REQUESTED",
  feedback: "Please update the course ECTS to match official records"
}
→ status: SUBMITTED → REVISION_NEEDED
→ revisionCount: 0 → 1
→ User can edit and resubmit
→ If rejected again: FINAL rejection (no more chances)
```

---

## 📈 **Phase 4: Statistics System**

### Auto-Calculate After Approval

**File:** `pages/api/admin/erasmus-experiences/[id]/review.ts`

```typescript
if (action === "APPROVED") {
  // 1. Update submission status
  await prisma.erasmus_experiences.update({
    where: { id },
    data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: adminId },
  });

  // 2. Trigger stats recalculation
  await recalculateStatsForCity({
    city: experience.hostCity,
    country: experience.hostCountry,
    semester: experience.semester,
  });
}
```

### Stats Calculation Service

**File:** `src/services/cityStatsCalculator.ts`

```typescript
export async function recalculateStatsForCity({
  city,
  country,
  semester, // or "ALL"
}: {
  city: string;
  country: string;
  semester: string;
}) {
  // 1. Get all APPROVED experiences for this city
  const experiences = await prisma.erasmus_experiences.findMany({
    where: {
      status: "APPROVED",
      hostCity: city,
      hostCountry: country,
      ...(semester !== "ALL" && { semester }),
    },
  });

  // 2. Extract accommodation data
  const rents = experiences
    .map((e) => e.accommodation?.monthlyRent)
    .filter((r) => r != null && r > 0)
    .map((r) => Math.round(r * 100)); // Convert to cents

  // 3. Calculate statistics (remove outliers)
  const rentStats = calculateStats(rents);

  // 4. Extract living expenses
  const expensesData = experiences.map((e) => e.livingExpenses).filter(Boolean);
  const expenseStats = calculateExpenseAverages(expensesData);

  // 5. Save to city_statistics table
  await prisma.cityStatistics.upsert({
    where: {
      city_country_semester: { city, country, semester },
    },
    create: {
      city,
      country,
      semester,
      ...rentStats,
      ...expenseStats,
      lastCalculated: new Date(),
    },
    update: {
      ...rentStats,
      ...expenseStats,
      lastCalculated: new Date(),
    },
  });
}

function calculateStats(values: number[]) {
  if (values.length < 5) return null; // Privacy: need at least 5 samples

  // Remove outliers (top/bottom 5%)
  const sorted = values.sort((a, b) => a - b);
  const trim = Math.floor(values.length * 0.05);
  const trimmed = sorted.slice(trim, sorted.length - trim);

  return {
    avgMonthlyRentCents: Math.round(avg(trimmed)),
    medianRentCents: median(trimmed),
    minRentCents: Math.min(...trimmed),
    maxRentCents: Math.max(...trimmed),
    rentSampleSize: values.length,
  };
}
```

---

## 🌍 **Phase 5: Public City Pages**

### API Endpoint

**File:** `pages/api/public/cities/[slug]/stats.ts`

```typescript
export default async function handler(req, res) {
  const { slug } = req.query; // "barcelona-spain"
  const [city, country] = slug.split("-");
  const { semester = "ALL" } = req.query;

  // Get cached statistics
  const stats = await prisma.cityStatistics.findUnique({
    where: {
      city_country_semester: {
        city: decodeURIComponent(city),
        country: decodeURIComponent(country),
        semester,
      },
    },
  });

  if (!stats || stats.rentSampleSize < 5) {
    return res.json({
      message: "Not enough data yet (minimum 5 submissions required)",
    });
  }

  return res.json({
    city: { name: city, country },
    semester,
    accommodation: {
      avgMonthlyRent: stats.avgMonthlyRentCents / 100,
      medianRent: stats.medianRentCents / 100,
      minRent: stats.minRentCents / 100,
      maxRent: stats.maxRentCents / 100,
      sampleSize: stats.rentSampleSize,
    },
    livingExpenses: {
      avgGroceries: stats.avgGroceriesCents / 100,
      avgTransport: stats.avgTransportCents / 100,
      avgEatingOut: stats.avgEatingOutCents / 100,
      avgSocialLife: stats.avgSocialLifeCents / 100,
      avgTotal: stats.avgTotalExpensesCents / 100,
      sampleSize: stats.expenseSampleSize,
    },
    lastUpdated: stats.lastCalculated,
  });
}
```

### Public Page

**File:** `pages/cities/[slug].tsx`

```typescript
export default function CityPage() {
  const router = useRouter();
  const { slug } = router.query; // "barcelona-spain"
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`/api/public/cities/${slug}/stats?semester=ALL`)
      .then(res => res.json())
      .then(setStats);
  }, [slug]);

  if (!stats) return <Loading />;

  return (
    <div>
      <h1>{stats.city.name}, {stats.city.country}</h1>

      <Section title="Accommodation Costs">
        <StatCard label="Average Rent" value={`€${stats.accommodation.avgMonthlyRent}/month`} />
        <StatCard label="Typical Range" value={`€${stats.accommodation.minRent} - €${stats.accommodation.maxRent}`} />
        <p className="text-sm text-gray-500">
          Based on {stats.accommodation.sampleSize} student experiences
        </p>
      </Section>

      <Section title="Monthly Living Expenses">
        <BarChart data={stats.livingExpenses} />
      </Section>
    </div>
  );
}
```

---

## 🔒 **Privacy & Data Rules**

1. **Minimum Sample Size:** Only show stats if ≥ 5 submissions
2. **Outlier Removal:** Trim top/bottom 5% before averaging
3. **Aggregation Only:** NEVER show individual submissions publicly
4. **Admin Access:** Full data visible only to admins in review dashboard

---

## 📅 **Implementation Timeline**

### Week 1: Database & Core APIs

- ✅ Day 1: Run Prisma migration
- ✅ Day 2: Create `/api/erasmus-experiences/init` endpoint
- ✅ Day 3: Create `/api/erasmus-experiences/[id]/submit` endpoint
- ✅ Day 4: Update existing save APIs to handle new fields
- ✅ Day 5: Test full form flow end-to-end

### Week 2: Admin System

- ✅ Day 1-2: Build admin review page UI
- ✅ Day 3: Create review API endpoints
- ✅ Day 4: Implement approve/reject/revision workflow
- ✅ Day 5: Test admin flow with sample data

### Week 3: Statistics & Public Pages

- ✅ Day 1-2: Build stats calculation service
- ✅ Day 3: Create public stats API
- ✅ Day 4: Build city statistics page
- ✅ Day 5: End-to-end testing & polish

---

## 🚀 **Next Steps**

**Ready to start? Here's what we do NOW:**

1. **Run the migration:**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name add_submission_workflow
   ```

2. **Verify in Prisma Studio:**

   ```bash
   npx prisma studio
   ```

   Check that new fields exist

3. **Start Phase 2:** Update the first form page

**Should I proceed with step 1 (migration)?** Type "yes" and I'll guide you through it! 🎯
