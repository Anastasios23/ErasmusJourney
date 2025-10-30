/*
  Warnings:

  - A unique constraint covering the columns `[userId,semester]` on the table `erasmus_experiences` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."erasmus_experiences" ADD COLUMN     "homeUniversityId" TEXT,
ADD COLUMN     "hostCity" TEXT,
ADD COLUMN     "hostCountry" TEXT,
ADD COLUMN     "hostUniversityId" TEXT,
ADD COLUMN     "reviewFeedback" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "revisionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "semester" TEXT;

-- CreateTable
CREATE TABLE "public"."review_actions" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."city_statistics" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "avgMonthlyRentCents" INTEGER,
    "medianRentCents" INTEGER,
    "minRentCents" INTEGER,
    "maxRentCents" INTEGER,
    "rentSampleSize" INTEGER NOT NULL DEFAULT 0,
    "avgGroceriesCents" INTEGER,
    "avgTransportCents" INTEGER,
    "avgEatingOutCents" INTEGER,
    "avgSocialLifeCents" INTEGER,
    "avgTotalExpensesCents" INTEGER,
    "expenseSampleSize" INTEGER NOT NULL DEFAULT 0,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_actions_experienceId_idx" ON "public"."review_actions"("experienceId");

-- CreateIndex
CREATE INDEX "review_actions_adminId_idx" ON "public"."review_actions"("adminId");

-- CreateIndex
CREATE INDEX "city_statistics_city_country_idx" ON "public"."city_statistics"("city", "country");

-- CreateIndex
CREATE INDEX "city_statistics_semester_idx" ON "public"."city_statistics"("semester");

-- CreateIndex
CREATE UNIQUE INDEX "city_statistics_city_country_semester_key" ON "public"."city_statistics"("city", "country", "semester");

-- CreateIndex
CREATE INDEX "erasmus_experiences_status_hostCity_hostCountry_idx" ON "public"."erasmus_experiences"("status", "hostCity", "hostCountry");

-- CreateIndex
CREATE INDEX "erasmus_experiences_semester_idx" ON "public"."erasmus_experiences"("semester");

-- CreateIndex
CREATE INDEX "erasmus_experiences_hostUniversityId_homeUniversityId_idx" ON "public"."erasmus_experiences"("hostUniversityId", "homeUniversityId");

-- CreateIndex
CREATE UNIQUE INDEX "erasmus_experiences_userId_semester_key" ON "public"."erasmus_experiences"("userId", "semester");

-- CreateIndex
CREATE INDEX "partnership_tracking_partnerCountry_partnerCity_idx" ON "public"."partnership_tracking"("partnerCountry", "partnerCity");

-- CreateIndex
CREATE INDEX "partnership_tracking_needsAttention_isActive_idx" ON "public"."partnership_tracking"("needsAttention", "isActive");

-- CreateIndex
CREATE INDEX "stories_isPublic_isPinned_idx" ON "public"."stories"("isPublic", "isPinned");

-- CreateIndex
CREATE INDEX "stories_createdAt_isPublic_idx" ON "public"."stories"("createdAt", "isPublic");

-- CreateIndex
CREATE INDEX "student_submissions_createdAt_idx" ON "public"."student_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "student_submissions_qualityScore_status_idx" ON "public"."student_submissions"("qualityScore", "status");

-- CreateIndex
CREATE INDEX "student_submissions_isFeatured_status_isPublic_idx" ON "public"."student_submissions"("isFeatured", "status", "isPublic");

-- AddForeignKey
ALTER TABLE "public"."erasmus_experiences" ADD CONSTRAINT "erasmus_experiences_hostUniversityId_fkey" FOREIGN KEY ("hostUniversityId") REFERENCES "public"."universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."erasmus_experiences" ADD CONSTRAINT "erasmus_experiences_homeUniversityId_fkey" FOREIGN KEY ("homeUniversityId") REFERENCES "public"."universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_actions" ADD CONSTRAINT "review_actions_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "public"."erasmus_experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_actions" ADD CONSTRAINT "review_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
