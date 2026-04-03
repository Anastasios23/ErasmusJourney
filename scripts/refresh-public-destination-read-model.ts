import "dotenv/config";

import { prisma } from "../lib/prisma";
import { refreshPublicDestinationReadModel } from "../src/server/publicDestinations";

async function main(): Promise<void> {
  console.log("Refreshing persisted public destination read model...");

  const approvedExperienceCount = await prisma.erasmusExperience.count({
    where: {
      status: "APPROVED",
      isComplete: true,
      hostCity: { not: null },
      hostCountry: { not: null },
    },
  });

  await refreshPublicDestinationReadModel();

  const destinationCount = await prisma.publicDestinationReadModel.count();

  console.log(
    `Persisted public destination read model refreshed. Approved public experiences: ${approvedExperienceCount}. Destination rows: ${destinationCount}.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to refresh persisted public destination read model:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
