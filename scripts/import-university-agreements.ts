import { PrismaClient } from "@prisma/client";
import {
  ALL_UNIVERSITY_AGREEMENTS,
  CYPRUS_UNIVERSITIES,
} from "../src/data/universityAgreements";

const prisma = new PrismaClient();

async function importUniversityAgreements() {
  console.log("Starting comprehensive import of university agreements...");

  try {
    // Step 1: Create/Update all Cyprus Universities
    console.log("Creating Cyprus universities...");
    const createdUniversities = new Map();

    for (const uni of CYPRUS_UNIVERSITIES) {
      const university = await prisma.university.upsert({
        where: { code: uni.code },
        update: {
          name: uni.name,
          shortName: uni.shortName,
          country: uni.country,
          city: uni.city,
        },
        create: {
          code: uni.code,
          name: uni.name,
          shortName: uni.shortName,
          type: uni.code === "UCY" || uni.code === "CUT" ? "PUBLIC" : "PRIVATE",
          country: uni.country,
          city: uni.city,
        },
      });

      createdUniversities.set(uni.code, university);

      // Create faculties and departments for this university
      const faculty = await prisma.faculty.upsert({
        where: { id: `faculty-${uni.code}` },
        update: {},
        create: {
          id: `faculty-${uni.code}`,
          name: "General Faculty",
          universityId: university.id,
        },
      });

      // Create departments for this university
      for (const deptName of uni.departments) {
        await prisma.department.upsert({
          where: {
            id: `${uni.code}-${deptName.replace(/\s+/g, "-").toLowerCase()}`,
          },
          update: {},
          create: {
            id: `${uni.code}-${deptName.replace(/\s+/g, "-").toLowerCase()}`,
            name: deptName,
            facultyId: faculty.id,
          },
        });
      }

      console.log(`✓ Created university: ${university.name}`);
    }

    // Step 2: Extract unique partner universities from agreements
    console.log("Creating partner universities...");
    const partnerUniversities = new Map();
    const uniquePartners = new Set();

    for (const agreement of ALL_UNIVERSITY_AGREEMENTS) {
      const key = `${agreement.partnerUniversity}-${agreement.partnerCountry}-${agreement.partnerCity}`;
      if (!uniquePartners.has(key)) {
        uniquePartners.add(key);
        const partner = await prisma.university.upsert({
          where: {
            code: agreement.partnerUniversity
              .replace(/\s+/g, "-")
              .toUpperCase()
              .substring(0, 10),
          },
          update: {},
          create: {
            code: agreement.partnerUniversity
              .replace(/\s+/g, "-")
              .toUpperCase()
              .substring(0, 10),
            name: agreement.partnerUniversity,
            shortName: agreement.partnerUniversity.substring(0, 20),
            type: "PUBLIC", // Default type for partner universities
            country: agreement.partnerCountry,
            city: agreement.partnerCity,
          },
        });

        partnerUniversities.set(agreement.partnerUniversity, partner);
        console.log(`✓ Created partner: ${partner.name}`);
      }
    }

    // Step 3: Create all agreements
    console.log("Creating agreements...");
    let agreementCount = 0;

    for (const agreement of ALL_UNIVERSITY_AGREEMENTS) {
      try {
        // Find home university
        const homeUni = createdUniversities.get(agreement.homeUniversity);
        if (!homeUni) {
          console.warn(
            `⚠️ Home university not found: ${agreement.homeUniversity}`,
          );
          continue;
        }

        // Find home department
        const homeDept = await prisma.department.findFirst({
          where: {
            name: agreement.homeDepartment.trim(),
            faculty: {
              universityId: homeUni.id,
            },
          },
        });

        if (!homeDept) {
          console.warn(
            `⚠️ Department not found: ${agreement.homeDepartment} at ${agreement.homeUniversity}`,
          );
          continue;
        }

        // Find partner university
        const partnerUni = partnerUniversities.get(agreement.partnerUniversity);
        if (!partnerUni) {
          console.warn(
            `⚠️ Partner university not found: ${agreement.partnerUniversity}`,
          );
          continue;
        }

        // Create agreement
        await prisma.agreement.upsert({
          where: {
            id: `${homeUni.id}-${homeDept.id}-${partnerUni.id}-${agreementCount}`,
          },
          update: {},
          create: {
            id: `${homeUni.id}-${homeDept.id}-${partnerUni.id}-${agreementCount}`,
            homeUniversityId: homeUni.id,
            homeDepartmentId: homeDept.id,
            partnerUniversityId: partnerUni.id,
            partnerCity: agreement.partnerCity,
            partnerCountry: agreement.partnerCountry,
            agreementType:
              agreement.agreementType === "student" ? "STUDENT" : "BOTH",
            isActive: true,
          },
        });

        agreementCount++;

        if (agreementCount % 100 === 0) {
          console.log(`✓ Created ${agreementCount} agreements...`);
        }
      } catch (error) {
        console.error(`❌ Error creating agreement:`, error);
      }
    }

    console.log(`✅ Successfully imported ${agreementCount} agreements!`);
    console.log(
      `✅ Total universities: ${createdUniversities.size + partnerUniversities.size}`,
    );
    console.log("Database import completed successfully!");
  } catch (error) {
    console.error("❌ Error during import:", error);
    throw error;
  }
}

importUniversityAgreements()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
