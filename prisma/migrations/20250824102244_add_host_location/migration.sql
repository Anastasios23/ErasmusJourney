-- AlterTable
ALTER TABLE "public"."form_submissions" ADD COLUMN "hostCity" TEXT;
ALTER TABLE "public"."form_submissions" ADD COLUMN "hostCountry" TEXT;

-- CreateIndex
CREATE INDEX "form_submissions_hostCity_hostCountry_idx" ON "public"."form_submissions"("hostCity","hostCountry");