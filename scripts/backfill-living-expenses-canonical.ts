import { prisma } from "../lib/prisma";

type JsonRecord = Record<string, unknown>;

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toCurrency(value: unknown): string {
  if (typeof value !== "string") {
    return "EUR";
  }

  const normalized = value.trim();
  return normalized || "EUR";
}

function isObject(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function canonicalizeLivingExpenses(
  livingExpenses: unknown,
  fallbackRent?: unknown,
) {
  const raw = isObject(livingExpenses) ? livingExpenses : {};
  const nestedExpenses = isObject(raw.expenses) ? raw.expenses : {};

  const directRent = toNullableNumber(raw.rent);
  const resolvedFallbackRent = toNullableNumber(fallbackRent);

  return {
    currency: toCurrency(raw.currency),
    rent: directRent ?? resolvedFallbackRent,
    food:
      toNullableNumber(raw.food) ?? toNullableNumber(nestedExpenses.groceries),
    transport:
      toNullableNumber(raw.transport) ??
      toNullableNumber(nestedExpenses.transportation),
    social:
      toNullableNumber(raw.social) ??
      toNullableNumber(nestedExpenses.socialLife),
    travel:
      toNullableNumber(raw.travel) ?? toNullableNumber(nestedExpenses.travel),
    other:
      toNullableNumber(raw.other) ??
      toNullableNumber(nestedExpenses.otherExpenses),
  };
}

function buildNextLivingExpenses(
  livingExpenses: unknown,
  fallbackRent?: unknown,
): JsonRecord {
  const raw = isObject(livingExpenses) ? livingExpenses : {};
  const canonical = canonicalizeLivingExpenses(raw, fallbackRent);

  const next: JsonRecord = {
    ...raw,
    ...canonical,
  };

  delete next.expenses;

  return next;
}

function hasLegacyNestedExpenses(value: unknown): boolean {
  return (
    isObject(value) && Object.prototype.hasOwnProperty.call(value, "expenses")
  );
}

async function backfillLivingExpensesCanonical() {
  const isApplyMode = process.argv.includes("--apply");

  const summary = {
    found: 0,
    changed: 0,
    skipped: 0,
    failed: 0,
  };

  const experiences = await prisma.erasmusExperience.findMany({
    select: {
      id: true,
      livingExpenses: true,
      accommodation: true,
    },
  });

  const candidates = experiences.filter((experience) =>
    hasLegacyNestedExpenses(experience.livingExpenses),
  );

  summary.found = candidates.length;

  console.log(
    `[living-expenses-backfill] Found ${summary.found} record(s) with legacy nested expenses shape.`,
  );

  for (const experience of candidates) {
    try {
      if (!isObject(experience.livingExpenses)) {
        summary.skipped++;
        continue;
      }

      const accommodation = isObject(experience.accommodation)
        ? experience.accommodation
        : {};
      const nextLivingExpenses = buildNextLivingExpenses(
        experience.livingExpenses,
        accommodation.monthlyRent,
      );

      const hasChanged =
        JSON.stringify(experience.livingExpenses) !==
        JSON.stringify(nextLivingExpenses);

      if (!hasChanged) {
        summary.skipped++;
        continue;
      }

      summary.changed++;

      if (isApplyMode) {
        await prisma.erasmusExperience.update({
          where: { id: experience.id },
          data: {
            livingExpenses: nextLivingExpenses,
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      summary.failed++;
      console.error(
        `[living-expenses-backfill] Failed for record ${experience.id}:`,
        error,
      );
    }
  }

  if (!isApplyMode) {
    console.log(
      "[living-expenses-backfill] Dry run only. Re-run with --apply to persist changes.",
    );
  }

  console.log(
    `[living-expenses-backfill] Summary: found=${summary.found}, changed=${summary.changed}, skipped=${summary.skipped}, failed=${summary.failed}, mode=${isApplyMode ? "apply" : "dry-run"}.`,
  );

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

backfillLivingExpensesCanonical()
  .catch((error) => {
    console.error("[living-expenses-backfill] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
