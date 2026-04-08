-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_NEEDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SubmissionType" AS ENUM ('FULL_EXPERIENCE', 'ACCOMMODATION', 'COURSE_EXCHANGE', 'QUICK_TIP', 'DESTINATION_INFO');

-- CreateTable
CREATE TABLE "public"."student_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionType" "public"."SubmissionType" NOT NULL,
    "formStep" TEXT,
    "data" JSONB NOT NULL,
    "title" TEXT,
    "hostCity" TEXT,
    "hostCountry" TEXT,
    "hostUniversity" TEXT,
    "semester" TEXT,
    "academicYear" TEXT,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "revisionNotes" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "student_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accommodation_views" (
    "id" TEXT NOT NULL,
    "sourceSubmissionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pricePerMonth" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "neighborhood" TEXT,
    "description" TEXT,
    "pros" TEXT[],
    "cons" TEXT[],
    "status" "public"."SubmissionStatus" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "studentName" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodation_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_exchange_views" (
    "id" TEXT NOT NULL,
    "sourceSubmissionId" TEXT NOT NULL,
    "homeCourse" TEXT NOT NULL,
    "hostCourse" TEXT NOT NULL,
    "hostUniversity" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "ects" INTEGER,
    "semester" TEXT,
    "studyLevel" TEXT,
    "fieldOfStudy" TEXT,
    "courseQuality" INTEGER,
    "description" TEXT,
    "status" "public"."SubmissionStatus" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "studentName" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_exchange_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_submissions_userId_status_idx" ON "public"."student_submissions"("userId", "status");

-- CreateIndex
CREATE INDEX "student_submissions_status_submittedAt_idx" ON "public"."student_submissions"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "student_submissions_hostCity_hostCountry_status_idx" ON "public"."student_submissions"("hostCity", "hostCountry", "status");

-- CreateIndex
CREATE INDEX "student_submissions_submissionType_status_idx" ON "public"."student_submissions"("submissionType", "status");

-- CreateIndex
CREATE INDEX "student_submissions_reviewedBy_status_idx" ON "public"."student_submissions"("reviewedBy", "status");

-- CreateIndex
CREATE INDEX "accommodation_views_city_country_status_idx" ON "public"."accommodation_views"("city", "country", "status");

-- CreateIndex
CREATE INDEX "accommodation_views_status_isFeatured_idx" ON "public"."accommodation_views"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "course_exchange_views_hostUniversity_status_idx" ON "public"."course_exchange_views"("hostUniversity", "status");

-- CreateIndex
CREATE INDEX "course_exchange_views_city_country_status_idx" ON "public"."course_exchange_views"("city", "country", "status");

-- AddForeignKey
ALTER TABLE "public"."student_submissions" ADD CONSTRAINT "student_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_submissions" ADD CONSTRAINT "student_submissions_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_submissions" ADD CONSTRAINT "student_submissions_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "public"."student_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accommodation_views" ADD CONSTRAINT "accommodation_views_sourceSubmissionId_fkey" FOREIGN KEY ("sourceSubmissionId") REFERENCES "public"."student_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_exchange_views" ADD CONSTRAINT "course_exchange_views_sourceSubmissionId_fkey" FOREIGN KEY ("sourceSubmissionId") REFERENCES "public"."student_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
