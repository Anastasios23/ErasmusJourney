export interface LivingExpensesStepData {
  currency: string;
  rent: number | null;
  food: number | null;
  transport: number | null;
  social: number | null;
  travel: number | null;
  other: number | null;
}

type LivingExpensesInput = Partial<
  Record<keyof LivingExpensesStepData, unknown>
>;

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
  value?: LivingExpensesInput | null,
  options?: { fallbackRent?: number | null },
): LivingExpensesStepData {
  const rawValue = (value || {}) as LivingExpensesInput;
  const fallbackRent =
    typeof options?.fallbackRent === "number" ? options.fallbackRent : null;

  const rent = toNullableNumber(rawValue.rent);

  return {
    currency: toCurrency(rawValue.currency),
    rent: rent ?? fallbackRent,
    food: toNullableNumber(rawValue.food),
    transport: toNullableNumber(rawValue.transport),
    social: toNullableNumber(rawValue.social),
    travel: toNullableNumber(rawValue.travel),
    other: toNullableNumber(rawValue.other),
  };
}

export function hasLegacyLivingExpensesShape(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(value, "expenses");
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
