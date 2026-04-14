import { prisma } from "../lib/prisma";
import { EXPERIENCE_STATUS } from "../src/lib/erasmusWorkflow";

async function backfillStatuses() {
  const updates: Array<{ from: string; to: string }> = [
    { from: "PUBLISHED", to: EXPERIENCE_STATUS.APPROVED },
    { from: "COMPLETED", to: EXPERIENCE_STATUS.SUBMITTED },
    { from: "IN_PROGRESS", to: EXPERIENCE_STATUS.DRAFT },
  ];

  for (const mapping of updates) {
    const result = await prisma.erasmusExperience.updateMany({
      where: { status: mapping.from },
      data: {
        status: mapping.to,
        updatedAt: new Date(),
      },
    });

    console.log(
      `Mapped status ${mapping.from} -> ${mapping.to}: ${result.count} records`,
    );
  }

  console.log("Status backfill completed.");
}

backfillStatuses()
  .catch((error) => {
    console.error("Failed to backfill statuses:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
