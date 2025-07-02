import { PrismaClient } from "@prisma/client";
import { CYPRUS_UNIVERSITIES } from "../src/data/universities";
import { ALL_UNIVERSITY_AGREEMENTS as UNIVERSITY_AGREEMENTS } from "../src/data/universityAgreements";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting data migration...");

  try {
    // Clear existing data in correct order (respecting foreign keys)
    console.log("🧹 Clearing existing data...");
    await prisma.application.deleteMany();
    await prisma.story.deleteMany();
    await prisma.agreement.deleteMany();
    await prisma.program.deleteMany();
    await prisma.department.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.university.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Existing data cleared");

    // Migrate Universities
    console.log("🏫 Migrating universities...");
    const universityMap = new Map<string, string>(); // old code -> new id

    for (const uni of CYPRUS_UNIVERSITIES) {
      const university = await prisma.university.create({
        data: {
          code: uni.id.toUpperCase(),
          name: uni.name,
          shortName: uni.shortName,
          type: uni.type === "public" ? "PUBLIC" : "PRIVATE",
          country: "Cyprus",
          city: uni.faculties[0] ? "Nicosia" : "Cyprus", // Default to Nicosia
        },
      });

      universityMap.set(uni.id, university.id);
      console.log(`  ✓ Created university: ${uni.name}`);

      // Migrate Faculties
      for (const faculty of uni.faculties) {
        const createdFaculty = await prisma.faculty.create({
          data: {
            name: faculty.name,
            universityId: university.id,
          },
        });

        // Migrate Departments
        for (const department of faculty.departments) {
          const createdDepartment = await prisma.department.create({
            data: {
              name: department.name,
              facultyId: createdFaculty.id,
            },
          });

          // Migrate Programs
          for (const program of department.programs) {
            await prisma.program.create({
              data: {
                name: program.name,
                level: program.level.toUpperCase() as any,
                duration: program.duration,
                type: program.type
                  ? (program.type.toUpperCase().replace("-", "_") as any)
                  : null,
                ects: program.ects,
                departmentId: createdDepartment.id,
              },
            });
          }
        }
      }
    }

    console.log(`✅ Migrated ${CYPRUS_UNIVERSITIES.length} universities`);

    // Migrate University Agreements
    console.log("🤝 Migrating university agreements...");
    let agreementsCount = 0;

    // Get all departments for mapping
    const allDepartments = await prisma.department.findMany({
      include: {
        faculty: {
          include: {
            university: true,
          },
        },
      },
    });

    const allUniversities = await prisma.university.findMany();

    for (const agreement of UNIVERSITY_AGREEMENTS) {
      try {
        // Find home university and department
        const homeUniversity = allUniversities.find(
          (u) =>
            u.name === agreement.homeUniversity ||
            u.shortName === agreement.homeUniversity,
        );

        if (!homeUniversity) {
          console.warn(
            `  ⚠️  Home university not found: ${agreement.homeUniversity}`,
          );
          continue;
        }

        const homeDepartment = allDepartments.find(
          (d) =>
            d.faculty.university.id === homeUniversity.id &&
            (d.name
              .toLowerCase()
              .includes(agreement.homeDepartment.toLowerCase()) ||
              agreement.homeDepartment
                .toLowerCase()
                .includes(d.name.toLowerCase())),
        );

        if (!homeDepartment) {
          console.warn(
            `  ⚠️  Home department not found: ${agreement.homeDepartment} at ${agreement.homeUniversity}`,
          );
          continue;
        }

        // Find or create partner university
        let partnerUniversity = allUniversities.find(
          (u) => u.name === agreement.partnerUniversity,
        );

        if (!partnerUniversity) {
          // Create partner university if it doesn't exist
          partnerUniversity = await prisma.university.create({
            data: {
              code: `PARTNER_${agreementsCount}`,
              name: agreement.partnerUniversity,
              shortName: agreement.partnerUniversity.substring(0, 10),
              type: "PUBLIC", // Default for partner universities
              country: agreement.partnerCountry,
              city: agreement.partnerCity,
            },
          });
        }

        // Create agreement
        await prisma.agreement.create({
          data: {
            homeUniversityId: homeUniversity.id,
            homeDepartmentId: homeDepartment.id,
            partnerUniversityId: partnerUniversity.id,
            partnerCity: agreement.partnerCity,
            partnerCountry: agreement.partnerCountry,
            agreementType: agreement.agreementType
              ? (agreement.agreementType.toUpperCase() as any)
              : "BOTH",
            notes: agreement.notes,
            isActive: true,
          },
        });

        agreementsCount++;
      } catch (error) {
        console.error(`  ❌ Error creating agreement: ${error}`);
      }
    }

    console.log(`✅ Migrated ${agreementsCount} university agreements`);

    // Create sample users
    console.log("👤 Creating sample users...");
    const bcrypt = await import("bcryptjs");

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: "admin@erasmus.cy",
        firstName: "Admin",
        lastName: "User",
        password: hashedAdminPassword,
        role: "ADMIN",
        nationality: "Cyprus",
        homeCountry: "Cyprus",
        homeCity: "Nicosia",
      },
    });

    // Create demo user
    const hashedDemoPassword = await bcrypt.hash("demo", 12);
    await prisma.user.create({
      data: {
        email: "demo",
        firstName: "Demo",
        lastName: "User",
        password: hashedDemoPassword,
        role: "USER",
        nationality: "Cyprus",
        homeCountry: "Cyprus",
        homeCity: "Nicosia",
      },
    });

    console.log("✅ Sample users created:");
    console.log("   - Admin: admin@erasmus.cy / admin123");
    console.log("   - Demo: demo / demo");

    console.log("🎉 Data migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
