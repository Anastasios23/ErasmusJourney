/**
 * Migration Script: Legacy Data → Unified StudentSubmission Model
 *
 * This script migrates data from:
 * - ErasmusExperience
 * - FormSubmission
 *
 * To the new unified StudentSubmission model
 *
 * Run: npx tsx scripts/migrate-to-unified-model.ts
 */

import { PrismaClient, SubmissionStatus, SubmissionType } from "@prisma/client";

const prisma = new PrismaClient();

// Status mapping from old to new
function mapStatus(oldStatus: string): SubmissionStatus {
  const mapping: Record<string, SubmissionStatus> = {
    DRAFT: SubmissionStatus.DRAFT,
    IN_PROGRESS: SubmissionStatus.DRAFT,
    SUBMITTED: SubmissionStatus.PENDING,
    PUBLISHED: SubmissionStatus.APPROVED,
    APPROVED: SubmissionStatus.APPROVED,
    REJECTED: SubmissionStatus.REJECTED,
    ARCHIVED: SubmissionStatus.ARCHIVED,
  };

  return mapping[oldStatus] || SubmissionStatus.PENDING;
}

// Generate a title from submission data
function generateTitle(data: any, type: SubmissionType): string {
  if (type === "FULL_EXPERIENCE") {
    const basicInfo = data.basicInfo || {};
    const name =
      `${basicInfo.firstName || ""} ${basicInfo.lastName || ""}`.trim();
    const city = basicInfo.hostCity || "Unknown City";
    return name ? `${name}'s Experience in ${city}` : `Experience in ${city}`;
  }

  if (type === "ACCOMMODATION") {
    const city = data.hostCity || data.city || "Unknown";
    const type = data.type || "Accommodation";
    return `${type} in ${city}`;
  }

  if (type === "COURSE_EXCHANGE") {
    const university = data.hostUniversity || "Unknown University";
    return `Course Exchange at ${university}`;
  }

  return "Student Submission";
}

// Migrate ErasmusExperience records
async function migrateErasmusExperiences() {
  console.log("\n📦 Migrating ErasmusExperience records...");

  const experiences = await prisma.erasmus_experiences.findMany({
    include: {
      users: true,
    },
  });

  console.log(`Found ${experiences.length} experiences to migrate`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const exp of experiences) {
    try {
      // Check if already migrated
      const existing = await prisma.student_submissions.findFirst({
        where: {
          userId: exp.userId,
          submissionType: "FULL_EXPERIENCE",
          data: {
            path: ["_sourceId"],
            equals: exp.id,
          },
        },
      });

      if (existing) {
        console.log(`  ⏭️  Skipping ${exp.id} (already migrated)`);
        skipped++;
        continue;
      }

      // Extract location info
      const basicInfo = (exp.basicInfo as any) || {};
      const hostCity = basicInfo.hostCity;
      const hostCountry = basicInfo.hostCountry;
      const hostUniversity = basicInfo.hostUniversity;

      // Create unified submission
      await prisma.student_submissions.create({
        data: {
          userId: exp.userId,
          submissionType: "FULL_EXPERIENCE",
          data: {
            basicInfo: exp.basicInfo,
            courses: exp.courses,
            accommodation: exp.accommodation,
            livingExpenses: exp.livingExpenses,
            experience: exp.experience,
            _sourceId: exp.id,
            _sourceType: "ErasmusExperience",
            _migratedAt: new Date().toISOString(),
          },
          title: generateTitle({ basicInfo }, "FULL_EXPERIENCE"),
          hostCity,
          hostCountry,
          hostUniversity,
          status: mapStatus(exp.status),
          isPublic: exp.isPublic || false,
          publishedAt: exp.publishedAt,
          submittedAt: exp.submittedAt,
          createdAt: exp.createdAt,
          updatedAt: exp.updatedAt,
        },
      });

      migrated++;
      console.log(`  ✅ Migrated experience ${exp.id} for user ${exp.userId}`);
    } catch (error) {
      console.error(`  ❌ Error migrating ${exp.id}:`, error);
      errors++;
    }
  }

  console.log(`\n✨ ErasmusExperience Migration Complete:`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

// Migrate FormSubmission records
async function migrateFormSubmissions() {
  console.log("\n📦 Migrating FormSubmission records...");

  const submissions = await prisma.form_submissions.findMany({
    include: {
      users: true,
    },
  });

  console.log(`Found ${submissions.length} form submissions to migrate`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const sub of submissions) {
    try {
      // Check if already migrated
      const existing = await prisma.student_submissions.findFirst({
        where: {
          userId: sub.userId,
          data: {
            path: ["_sourceId"],
            equals: sub.id,
          },
        },
      });

      if (existing) {
        console.log(`  ⏭️  Skipping ${sub.id} (already migrated)`);
        skipped++;
        continue;
      }

      // Determine submission type
      let submissionType: SubmissionType = "QUICK_TIP";
      if (sub.type === "accommodation" || sub.type === "ACCOMMODATION") {
        submissionType = "ACCOMMODATION";
      } else if (sub.type === "course" || sub.type === "COURSE_EXCHANGE") {
        submissionType = "COURSE_EXCHANGE";
      } else if (sub.type === "destination") {
        submissionType = "DESTINATION_INFO";
      }

      // Create unified submission
      await prisma.student_submissions.create({
        data: {
          userId: sub.userId,
          submissionType,
          data: {
            ...sub.data,
            _sourceId: sub.id,
            _sourceType: "FormSubmission",
            _migratedAt: new Date().toISOString(),
          },
          title: sub.title || generateTitle(sub.data, submissionType),
          hostCity: sub.hostCity,
          hostCountry: sub.hostCountry,
          status: mapStatus(sub.status),
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        },
      });

      migrated++;
      console.log(
        `  ✅ Migrated submission ${sub.id} (${sub.type}) for user ${sub.userId}`,
      );
    } catch (error) {
      console.error(`  ❌ Error migrating ${sub.id}:`, error);
      errors++;
    }
  }

  console.log(`\n✨ FormSubmission Migration Complete:`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

// Generate denormalized views for approved submissions
async function generateDenormalizedViews() {
  console.log("\n🔄 Generating denormalized views for approved submissions...");

  const approved = await prisma.student_submissions.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      author: true,
    },
  });

  console.log(`Found ${approved.length} approved submissions`);

  let accommodationCount = 0;
  let courseCount = 0;

  for (const submission of approved) {
    try {
      const data = submission.data as any;

      // Create accommodation views
      if (data.accommodation || submission.submissionType === "ACCOMMODATION") {
        const accData = data.accommodation || data;

        // Check if view already exists
        const existing = await prisma.accommodation_views.findFirst({
          where: { sourceSubmissionId: submission.id },
        });

        if (!existing && accData.type && accData.name) {
          await prisma.accommodation_views.create({
            data: {
              sourceSubmissionId: submission.id,
              type: accData.type,
              name: accData.name,
              city: submission.hostCity || "",
              country: submission.hostCountry || "",
              pricePerMonth: accData.pricePerMonth,
              neighborhood: accData.neighborhood,
              description: accData.description,
              pros: accData.pros || [],
              cons: accData.cons || [],
              status: submission.status,
              isPublic: submission.isPublic,
              isFeatured: submission.isFeatured,
              studentName:
                `${submission.author?.firstName || ""} ${submission.author?.lastName || ""}`.trim(),
              submittedAt: submission.submittedAt,
            },
          });
          accommodationCount++;
        }
      }

      // Create course exchange views
      if (data.courses && Array.isArray(data.courses)) {
        for (const course of data.courses) {
          // Check if view already exists
          const existing = await prisma.course_exchange_views.findFirst({
            where: {
              sourceSubmissionId: submission.id,
              homeCourse: course.homeCourse,
              hostCourse: course.hostCourse,
            },
          });

          if (!existing) {
            await prisma.course_exchange_views.create({
              data: {
                sourceSubmissionId: submission.id,
                homeCourse: course.homeCourse,
                hostCourse: course.hostCourse,
                hostUniversity: submission.hostUniversity || "",
                city: submission.hostCity || "",
                country: submission.hostCountry || "",
                ects: course.ects,
                semester: course.semester,
                studyLevel: course.studyLevel,
                fieldOfStudy: course.fieldOfStudy,
                courseQuality: course.courseQuality,
                description: course.description,
                status: submission.status,
                isPublic: submission.isPublic,
                studentName:
                  `${submission.author?.firstName || ""} ${submission.author?.lastName || ""}`.trim(),
                submittedAt: submission.submittedAt,
              },
            });
            courseCount++;
          }
        }
      }
    } catch (error) {
      console.error(`  ❌ Error creating views for ${submission.id}:`, error);
    }
  }

  console.log(`\n✨ Denormalized Views Created:`);
  console.log(`   Accommodation Views: ${accommodationCount}`);
  console.log(`   Course Exchange Views: ${courseCount}`);
}

// Main migration function
async function main() {
  console.log("🚀 Starting Unified Data Model Migration...\n");
  console.log("This will migrate data from legacy tables to StudentSubmission");
  console.log(
    "Legacy tables will be preserved (renamed with _legacy suffix)\n",
  );

  try {
    await migrateErasmusExperiences();
    await migrateFormSubmissions();
    await generateDenormalizedViews();

    console.log("\n✅ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Verify data in Prisma Studio: npx prisma studio");
    console.log("2. Test the new API endpoints");
    console.log("3. Update frontend to use new endpoints");
    console.log("4. Once verified, legacy tables can be dropped\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main();
