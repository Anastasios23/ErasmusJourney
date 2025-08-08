import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log("🧹 Cleaning up duplicate form submissions...\n");

  try {
    // Get all users who have submissions
    const users = await prisma.formSubmission.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });

    console.log(`👥 Found ${users.length} users with submissions\n`);

    for (const user of users) {
      console.log(`Processing user: ${user.userId}`);

      // Define the correct form types
      const formTypes = [
        "basic-info",
        "course-matching",
        "accommodation",
        "living-expenses",
        "help-future-students",
      ];

      for (const formType of formTypes) {
        // Find all submissions for this user and form type (including variants)
        const allSubmissions = await prisma.formSubmission.findMany({
          where: {
            userId: user.userId,
            OR: [
              { type: formType },
              { type: formType.toUpperCase().replace(/-/g, "_") }, // BASIC_INFO format
              { type: formType.toUpperCase() }, // BASIC-INFO format
              // Handle the EXPERIENCE -> help-future-students mapping
              ...(formType === "help-future-students"
                ? [{ type: "EXPERIENCE" }]
                : []),
            ],
          },
          orderBy: { updatedAt: "desc" },
        });

        if (allSubmissions.length > 1) {
          console.log(
            `  📝 Found ${allSubmissions.length} submissions for ${formType}`,
          );

          // Keep the most recent one, delete the rest
          const keepSubmission = allSubmissions[0];
          const deleteSubmissions = allSubmissions.slice(1);

          // Update the kept submission to use standardized naming
          await prisma.formSubmission.update({
            where: { id: keepSubmission.id },
            data: {
              type: formType, // Standardize to lowercase with hyphens
              status: "SUBMITTED", // Ensure it's marked as submitted
            },
          });

          // Delete duplicates
          for (const deleteMe of deleteSubmissions) {
            await prisma.formSubmission.delete({
              where: { id: deleteMe.id },
            });
            console.log(`    ❌ Deleted duplicate: ${deleteMe.id}`);
          }

          console.log(`    ✅ Kept and standardized: ${keepSubmission.id}`);
        } else if (allSubmissions.length === 1) {
          // Standardize the naming of single submissions too
          await prisma.formSubmission.update({
            where: { id: allSubmissions[0].id },
            data: {
              type: formType,
              status: "SUBMITTED",
            },
          });
          console.log(`    ✅ Standardized: ${allSubmissions[0].id}`);
        }
      }
      console.log("");
    }

    // Clean up any remaining orphaned submissions with old naming
    const orphanedSubmissions = await prisma.formSubmission.findMany({
      where: {
        type: {
          in: [
            "EXPERIENCE",
            "BASIC_INFO",
            "COURSE_MATCHING",
            "ACCOMMODATION",
            "LIVING_EXPENSES",
          ],
        },
      },
    });

    if (orphanedSubmissions.length > 0) {
      console.log(
        `🗑️  Removing ${orphanedSubmissions.length} orphaned submissions with old naming...`,
      );
      await prisma.formSubmission.deleteMany({
        where: {
          type: {
            in: [
              "EXPERIENCE",
              "BASIC_INFO",
              "COURSE_MATCHING",
              "ACCOMMODATION",
              "LIVING_EXPENSES",
            ],
          },
        },
      });
      console.log("✅ Orphaned submissions removed");
    }

    // Final count
    const finalCount = await prisma.formSubmission.count();
    console.log(`🎉 Cleanup complete! Final submission count: ${finalCount}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
