# Erasmus Journey MVP

A web application helping future Erasmus students from Cyprus plan their exchange experience by learning from past students.

## Core Features (MVP)

### For Past Erasmus Students

- **5-Step Experience Form** (`/share-experience`) - Share your Erasmus experience:
  1. Basic Information (university, destination, study period)
  2. Course Matching (courses taken abroad and equivalences)
  3. Accommodation (housing type, rent, neighborhood)
  4. Living Expenses (monthly costs breakdown)
  5. Tips & Advice (help future students)

### For Future Erasmus Students

- **Destinations** (`/destinations`) - Browse cities with aggregated student data
- **Course Matching** (`/course-matching-experiences`) - See what courses students took
- **Destination Details** (`/destinations/[city]`) - Detailed city info with costs, accommodation tips

### User Features

- **Dashboard** (`/dashboard`) - Track form progress
- **My Submissions** (`/my-submissions`) - View submitted experiences

### Admin

- **Review Submissions** (`/admin/review-submissions`) - Approve student submissions

## Tech Stack

- **Framework**: Next.js 15 with Pages Router
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS + Radix UI
- **State**: React Query

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and auth secrets

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Page Structure (MVP)

```
pages/
├── index.tsx                  # Homepage
├── share-experience.tsx       # 5-step form (main entry point)
├── dashboard.tsx              # User dashboard
├── my-submissions.tsx         # User's submissions
├── destinations/
│   ├── index.tsx             # All destinations
│   └── [slug].tsx            # Destination detail
├── course-matching-experiences.tsx  # Course exchange data
├── login.tsx                  # Login
├── register.tsx               # Register
├── admin/
│   ├── index.tsx             # Redirect to review
│   └── review-submissions.tsx # Admin review page
└── accommodation/
    └── [id].tsx              # Accommodation detail
```

## Data Flow

1. Past students fill out the 5-step form at `/share-experience`
2. Admin reviews and approves submissions at `/admin/review-submissions`
3. Approved data is aggregated and displayed on:
   - `/destinations` - City listings with stats
   - `/destinations/[city]` - Detailed city pages
   - `/course-matching-experiences` - Course information

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```
