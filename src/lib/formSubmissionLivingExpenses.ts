import {
  calculateLivingExpensesTotal,
  sanitizeLivingExpensesStepData,
  type LivingExpensesStepData,
} from "./livingExpenses";

export interface FormSubmissionLivingExpensesData
  extends LivingExpensesStepData {
  spendingHabit?: string;
  budgetTips?: string;
  cheapGroceryPlaces?: string;
  cheapEatingPlaces?: string;
  transportationTips?: string;
  socialLifeTips?: string;
  travelTips?: string;
  overallBudgetAdvice?: string;
  monthlyIncomeAmount?: number | null;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as UnknownRecord;
}

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

function firstDefinedNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const parsed = toNullableNumber(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function sumDefinedNumbers(...values: unknown[]): number | null {
  const parsedValues = values
    .map((value) => toNullableNumber(value))
    .filter((value): value is number => value !== null);

  if (parsedValues.length === 0) {
    return null;
  }

  return parsedValues.reduce((sum, value) => sum + value, 0);
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

export function sanitizeFormSubmissionLivingExpensesData(
  value: unknown,
): FormSubmissionLivingExpensesData {
  const rawValue = asRecord(value);
  const nestedExpenses = asRecord(rawValue.expenses);

  const canonical = sanitizeLivingExpensesStepData({
    currency: rawValue.currency,
    rent: firstDefinedNumber(
      rawValue.rent,
      rawValue.monthlyRent,
      nestedExpenses.rent,
      nestedExpenses.accommodation,
    ),
    food:
      firstDefinedNumber(
        rawValue.food,
        rawValue.monthlyFood,
        rawValue.groceries,
        nestedExpenses.food,
        nestedExpenses.groceries,
      ) ?? null,
    transport:
      firstDefinedNumber(
        rawValue.transport,
        rawValue.monthlyTransport,
        rawValue.transportation,
        nestedExpenses.transport,
      ) ?? null,
    social:
      firstDefinedNumber(rawValue.social) ??
      sumDefinedNumbers(
        rawValue.monthlyEntertainment,
        rawValue.eatingOut,
        rawValue.entertainment,
        nestedExpenses.social,
        nestedExpenses.eatingOut,
        nestedExpenses.entertainment,
      ),
    travel:
      firstDefinedNumber(rawValue.travel, nestedExpenses.travel) ?? null,
    other:
      firstDefinedNumber(rawValue.other) ??
      sumDefinedNumbers(
        rawValue.monthlyUtilities,
        rawValue.monthlyOther,
        rawValue.bills,
        nestedExpenses.bills,
        nestedExpenses.other,
      ),
  });

  return {
    ...canonical,
    spendingHabit: toOptionalString(rawValue.spendingHabit),
    budgetTips: toOptionalString(rawValue.budgetTips),
    cheapGroceryPlaces: toOptionalString(rawValue.cheapGroceryPlaces),
    cheapEatingPlaces: toOptionalString(rawValue.cheapEatingPlaces),
    transportationTips: toOptionalString(rawValue.transportationTips),
    socialLifeTips: toOptionalString(rawValue.socialLifeTips),
    travelTips: toOptionalString(rawValue.travelTips),
    overallBudgetAdvice: toOptionalString(rawValue.overallBudgetAdvice),
    monthlyIncomeAmount: toNullableNumber(rawValue.monthlyIncomeAmount),
  };
}

export function calculateFormSubmissionLivingExpensesTotal(
  value: unknown,
): number {
  return calculateLivingExpensesTotal(
    sanitizeFormSubmissionLivingExpensesData(value),
  );
}
