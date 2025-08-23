-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT,
    "nationality" TEXT,
    "homeCity" TEXT,
    "homeCountry" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."universities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "facultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "type" TEXT,
    "ects" INTEGER,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agreements" (
    "id" TEXT NOT NULL,
    "homeUniversityId" TEXT NOT NULL,
    "homeDepartmentId" TEXT NOT NULL,
    "partnerUniversityId" TEXT NOT NULL,
    "partnerCity" TEXT NOT NULL,
    "partnerCountry" TEXT NOT NULL,
    "agreementType" TEXT NOT NULL DEFAULT 'BOTH',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "homeUniversityId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "semester" TEXT,
    "academicYear" TEXT,
    "duration" TEXT,
    "motivation" TEXT,
    "languageSkills" JSONB,
    "grades" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "universityId" TEXT,
    "country" TEXT,
    "city" TEXT,
    "category" TEXT NOT NULL DEFAULT 'EXPERIENCE',
    "tags" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."story_engagements" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "lastViewed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accommodations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pricePerMonth" DECIMAL(65,30),
    "currency" TEXT,
    "imageUrl" TEXT,
    "amenities" JSONB,
    "contactInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'published',
    "source" TEXT NOT NULL DEFAULT 'admin_created',
    "climate" TEXT,
    "costOfLiving" JSONB,
    "highlights" TEXT,
    "photos" JSONB,
    "generalInfo" JSONB,
    "aggregatedData" JSONB,
    "adminOverrides" JSONB,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "lastDataUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."form_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "adminNotes" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "qualityScore" DOUBLE PRECISION,
    "tags" TEXT,
    "location" TEXT,
    "submissionSource" TEXT NOT NULL DEFAULT 'form',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."destination_submissions" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "contributionType" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."erasmus_experiences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" TEXT NOT NULL DEFAULT '[]',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "basicInfo" JSONB,
    "courses" JSONB,
    "accommodation" JSONB,
    "livingExpenses" JSONB,
    "experience" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "erasmus_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_destinations" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "climate" TEXT,
    "highlights" JSONB,
    "officialUniversities" JSONB,
    "generalInfo" JSONB,
    "studentDataCache" JSONB,
    "hasStudentData" BOOLEAN NOT NULL DEFAULT false,
    "lastDataUpdate" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."university_exchanges" (
    "id" TEXT NOT NULL,
    "hostUniversity" TEXT NOT NULL,
    "hostCountry" TEXT NOT NULL,
    "hostCity" TEXT NOT NULL,
    "studyLevel" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "highlights" TEXT,
    "requirements" TEXT,
    "applicationDeadline" TEXT,
    "totalEcts" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'English',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_destinations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "averageMonthlyCost" DOUBLE PRECISION,
    "averageAccommodationCost" DOUBLE PRECISION,
    "topNeighborhoods" JSONB,
    "commonPros" JSONB,
    "commonCons" JSONB,
    "budgetBreakdown" JSONB,
    "adminTitle" TEXT,
    "adminDescription" TEXT,
    "adminImageUrl" TEXT,
    "adminHighlights" JSONB,
    "adminGeneralInfo" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_accommodations" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "sourceExperienceId" TEXT NOT NULL,
    "studentName" TEXT,
    "accommodationType" TEXT NOT NULL,
    "neighborhood" TEXT,
    "monthlyRent" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pros" JSONB,
    "cons" JSONB,
    "tips" JSONB,
    "bookingAdvice" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_course_exchanges" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "sourceExperienceId" TEXT NOT NULL,
    "studentName" TEXT,
    "hostUniversity" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "studyLevel" TEXT,
    "semester" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "courseQuality" INTEGER,
    "professorQuality" INTEGER,
    "facilityQuality" INTEGER,
    "coursesEnrolled" JSONB,
    "creditsEarned" INTEGER,
    "language" TEXT,
    "academicChallenges" TEXT,
    "academicHighlights" TEXT,
    "tips" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_course_exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partnership_tracking" (
    "id" TEXT NOT NULL,
    "homeUniversityName" TEXT NOT NULL,
    "partnerUniversityName" TEXT NOT NULL,
    "partnerCity" TEXT NOT NULL,
    "partnerCountry" TEXT NOT NULL,
    "agreementType" TEXT,
    "fieldOfStudy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "averageAcademicRating" DOUBLE PRECISION,
    "lastSubmissionDate" TIMESTAMP(3),
    "submissionsByYear" JSONB,
    "ratingTrend" JSONB,
    "adminNotes" TEXT,
    "needsAttention" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnership_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "universities_code_key" ON "public"."universities"("code");

-- CreateIndex
CREATE INDEX "stories_city_country_idx" ON "public"."stories"("city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "story_engagements_storyId_userId_key" ON "public"."story_engagements"("storyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_city_country_key" ON "public"."destinations"("city", "country");

-- CreateIndex
CREATE INDEX "form_submissions_location_status_idx" ON "public"."form_submissions"("location", "status");

-- CreateIndex
CREATE INDEX "form_submissions_type_status_idx" ON "public"."form_submissions"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "destination_submissions_destinationId_submissionId_key" ON "public"."destination_submissions"("destinationId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "erasmus_experiences_userId_key" ON "public"."erasmus_experiences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_destinations_destinationId_key" ON "public"."custom_destinations"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_destinations_city_country_key" ON "public"."admin_destinations"("city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "generated_destinations_slug_key" ON "public"."generated_destinations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "generated_destinations_city_country_key" ON "public"."generated_destinations"("city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "partnership_tracking_homeUniversityName_partnerUniversityNa_key" ON "public"."partnership_tracking"("homeUniversityName", "partnerUniversityName", "partnerCity");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faculties" ADD CONSTRAINT "faculties_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."programs" ADD CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agreements" ADD CONSTRAINT "agreements_homeUniversityId_fkey" FOREIGN KEY ("homeUniversityId") REFERENCES "public"."universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agreements" ADD CONSTRAINT "agreements_homeDepartmentId_fkey" FOREIGN KEY ("homeDepartmentId") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agreements" ADD CONSTRAINT "agreements_partnerUniversityId_fkey" FOREIGN KEY ("partnerUniversityId") REFERENCES "public"."universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_homeUniversityId_fkey" FOREIGN KEY ("homeUniversityId") REFERENCES "public"."universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "public"."agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stories" ADD CONSTRAINT "stories_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stories" ADD CONSTRAINT "stories_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."story_engagements" ADD CONSTRAINT "story_engagements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."story_engagements" ADD CONSTRAINT "story_engagements_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."form_submissions" ADD CONSTRAINT "form_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."destination_submissions" ADD CONSTRAINT "destination_submissions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."destination_submissions" ADD CONSTRAINT "destination_submissions_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."erasmus_experiences" ADD CONSTRAINT "erasmus_experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_accommodations" ADD CONSTRAINT "generated_accommodations_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."generated_destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_course_exchanges" ADD CONSTRAINT "generated_course_exchanges_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."generated_destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
