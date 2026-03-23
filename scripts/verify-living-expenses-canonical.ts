import { prisma } from "../lib/prisma";

type JsonRecord = Record<string, unknown>;

function isObject(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasLegacyNestedExpenses(value: unknown): boolean {
  return (
    isObject(value) && Object.prototype.hasOwnProperty.call(value, "expenses")
  );
}

async function main(): Promise<void> {
  const experiences = await prisma.erasmusExperience.findMany({
    select: {
      id: true,
      livingExpenses: true,
    },
  });

  const legacyRecords = experiences.filter((experience) =>
    hasLegacyNestedExpenses(experience.livingExpenses),
  );

  if (legacyRecords.length > 0) {
    console.error(
      `[living-expenses-verify] Found ${legacyRecords.length} legacy livingExpenses.expenses record(s).`,
    );
    console.error(
      `[living-expenses-verify] Example IDs: ${legacyRecords
        .slice(0, 10)
        .map((experience) => experience.id)
        .join(", ")}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "[living-expenses-verify] Verified 0 legacy livingExpenses.expenses records.",
  );
}

main()
  .catch((error) => {
    console.error("[living-expenses-verify] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
