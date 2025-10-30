/*
  Warnings:

  - You are about to drop the `accommodation_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course_exchange_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_submissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."accommodation_views" DROP CONSTRAINT "accommodation_views_sourceSubmissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_exchange_views" DROP CONSTRAINT "course_exchange_views_sourceSubmissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_submissions" DROP CONSTRAINT "student_submissions_previousVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_submissions" DROP CONSTRAINT "student_submissions_reviewedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_submissions" DROP CONSTRAINT "student_submissions_userId_fkey";

-- DropTable
DROP TABLE "public"."accommodation_views";

-- DropTable
DROP TABLE "public"."course_exchange_views";

-- DropTable
DROP TABLE "public"."student_submissions";

-- DropEnum
DROP TYPE "public"."SubmissionStatus";

-- DropEnum
DROP TYPE "public"."SubmissionType";
