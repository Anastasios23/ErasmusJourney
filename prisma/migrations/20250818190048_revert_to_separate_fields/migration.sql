/*
  Warnings:

  - Added the required column `city` to the `destinations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "destination_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "destinationId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "contributionType" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "destination_submissions_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "destination_submissions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "form_submissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "generated_destinations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL,
    "averageMonthlyCost" REAL,
    "averageAccommodationCost" REAL,
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
    "lastCalculated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "generated_accommodations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "destinationId" TEXT NOT NULL,
    "sourceExperienceId" TEXT NOT NULL,
    "studentName" TEXT,
    "accommodationType" TEXT NOT NULL,
    "neighborhood" TEXT,
    "monthlyRent" REAL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "generated_accommodations_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "generated_destinations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "generated_course_exchanges" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "generated_course_exchanges_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "generated_destinations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "partnership_tracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeUniversityName" TEXT NOT NULL,
    "partnerUniversityName" TEXT NOT NULL,
    "partnerCity" TEXT NOT NULL,
    "partnerCountry" TEXT NOT NULL,
    "agreementType" TEXT,
    "fieldOfStudy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL,
    "averageAcademicRating" REAL,
    "lastSubmissionDate" DATETIME,
    "submissionsByYear" JSONB,
    "ratingTrend" JSONB,
    "adminNotes" TEXT,
    "needsAttention" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_destinations" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "lastDataUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_destinations" ("climate", "costOfLiving", "country", "createdAt", "description", "featured", "generalInfo", "highlights", "id", "imageUrl", "name", "photos", "updatedAt") SELECT "climate", "costOfLiving", "country", "createdAt", "description", "featured", "generalInfo", "highlights", "id", "imageUrl", "name", "photos", "updatedAt" FROM "destinations";
DROP TABLE "destinations";
ALTER TABLE "new_destinations" RENAME TO "destinations";
CREATE UNIQUE INDEX "destinations_city_country_key" ON "destinations"("city", "country");
CREATE TABLE "new_form_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "adminNotes" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "qualityScore" REAL,
    "tags" TEXT,
    "location" TEXT,
    "submissionSource" TEXT NOT NULL DEFAULT 'form',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "form_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_form_submissions" ("adminNotes", "createdAt", "data", "id", "status", "title", "type", "updatedAt", "userId") SELECT "adminNotes", "createdAt", "data", "id", "status", "title", "type", "updatedAt", "userId" FROM "form_submissions";
DROP TABLE "form_submissions";
ALTER TABLE "new_form_submissions" RENAME TO "form_submissions";
CREATE INDEX "form_submissions_location_status_idx" ON "form_submissions"("location", "status");
CREATE INDEX "form_submissions_type_status_idx" ON "form_submissions"("type", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "destination_submissions_destinationId_submissionId_key" ON "destination_submissions"("destinationId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "generated_destinations_slug_key" ON "generated_destinations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "generated_destinations_city_country_key" ON "generated_destinations"("city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "partnership_tracking_homeUniversityName_partnerUniversityName_partnerCity_key" ON "partnership_tracking"("homeUniversityName", "partnerUniversityName", "partnerCity");
