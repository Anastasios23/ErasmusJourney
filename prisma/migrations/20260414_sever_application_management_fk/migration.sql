-- No table drops. Only constraint removal.
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_agreementId_fkey";
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_homeUniversityId_fkey";
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_programId_fkey";
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_userId_fkey";
