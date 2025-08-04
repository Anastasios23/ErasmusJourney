-- AlterTable
ALTER TABLE "destinations" ADD COLUMN "generalInfo" JSONB;
ALTER TABLE "destinations" ADD COLUMN "photos" JSONB;

-- AlterTable
ALTER TABLE "form_submissions" ADD COLUMN "adminNotes" TEXT;

-- CreateTable
CREATE TABLE "erasmus_experiences" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "lastSavedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "publishedAt" DATETIME,
    "adminNotes" TEXT,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "erasmus_experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_destinations" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "lastDataUpdate" DATETIME,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "university_exchanges" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "erasmus_experiences_userId_key" ON "erasmus_experiences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_destinations_city_country_key" ON "admin_destinations"("city", "country");
