-- CreateEnum
CREATE TYPE "public"."ErasmusExperienceStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'REVISION_NEEDED'
);

-- CreateEnum
CREATE TYPE "public"."ReviewActionType" AS ENUM (
  'APPROVED',
  'REJECTED',
  'REQUEST_CHANGES',
  'WORDING_EDITED'
);

-- Normalize legacy canonical workflow values before converting the columns.
UPDATE "public"."erasmus_experiences"
SET "status" = CASE
  WHEN "status" = 'IN_PROGRESS' THEN 'DRAFT'
  WHEN "status" = 'PENDING' THEN 'SUBMITTED'
  WHEN "status" = 'COMPLETED' THEN 'SUBMITTED'
  WHEN "status" = 'PUBLISHED' THEN 'APPROVED'
  ELSE "status"
END
WHERE "status" IN ('IN_PROGRESS', 'PENDING', 'COMPLETED', 'PUBLISHED');

UPDATE "public"."review_actions"
SET "action" = 'REQUEST_CHANGES'
WHERE "action" = 'REVISION_REQUESTED';

-- AlterTable
ALTER TABLE "public"."erasmus_experiences"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "public"."ErasmusExperienceStatus"
USING ("status"::"public"."ErasmusExperienceStatus"),
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "public"."review_actions"
ALTER COLUMN "action" TYPE "public"."ReviewActionType"
USING ("action"::"public"."ReviewActionType");
