/*
  Warnings:

  - You are about to drop the column `agreementId` on the `applications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."programs" DROP CONSTRAINT "programs_departmentId_fkey";

-- DropIndex
DROP INDEX "public"."erasmus_experiences_userId_semester_key";

-- AlterTable
ALTER TABLE "public"."applications" DROP COLUMN "agreementId";
