export interface LivingExpensesStepData {
  currency: string;
  rent: number | null;
  food: number | null;
  transport: number | null;
  social: number | null;
  travel: number | null;
  other: number | null;
}

interface LegacyLivingExpensesShape {
  currency?: unknown;
  rent?: unknown;
  food?: unknown;
  transport?: unknown;
  social?: unknown;
  travel?: unknown;
  other?: unknown;
  expenses?: {
    groceries?: unknown;
    transportation?: unknown;
    socialLife?: unknown;
    travel?: unknown;
    otherExpenses?: unknown;
  };
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

function toCurrency(value: unknown): string {
  if (typeof value !== "string") {
    return "EUR";
  }

  const normalized = value.trim();
  return normalized || "EUR";
}

export function createEmptyLivingExpensesStepData(): LivingExpensesStepData {
  return {
    currency: "EUR",
    rent: null,
    food: null,
    transport: null,
    social: null,
    travel: null,
    other: null,
  };
}

export function sanitizeLivingExpensesStepData(
  value?: Partial<LegacyLivingExpensesShape> | null,
  options?: { fallbackRent?: number | null },
): LivingExpensesStepData {
  const legacyExpenses = value?.expenses;
  const fallbackRent =
    typeof options?.fallbackRent === "number" ? options.fallbackRent : null;

  const rent = toNullableNumber(value?.rent);

  return {
    currency: toCurrency(value?.currency),
    rent: rent ?? fallbackRent,
    food:
      toNullableNumber(value?.food) ??
      toNullableNumber(legacyExpenses?.groceries),
    transport:
      toNullableNumber(value?.transport) ??
      toNullableNumber(legacyExpenses?.transportation),
    social:
      toNullableNumber(value?.social) ??
      toNullableNumber(legacyExpenses?.socialLife),
    travel:
      toNullableNumber(value?.travel) ??
      toNullableNumber(legacyExpenses?.travel),
    other:
      toNullableNumber(value?.other) ??
      toNullableNumber(legacyExpenses?.otherExpenses),
  };
}

export function hasRequiredLivingExpenses(
  value?: Partial<LivingExpensesStepData> | null,
): boolean {
  if (!value) {
    return false;
  }

  return (
    value.food !== null &&
    value.food !== undefined &&
    value.transport !== null &&
    value.transport !== undefined &&
    value.social !== null &&
    value.social !== undefined &&
    value.travel !== null &&
    value.travel !== undefined
  );
}
