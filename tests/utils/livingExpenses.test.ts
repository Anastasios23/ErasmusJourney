import { describe, expect, it } from "vitest";

import {
  createEmptyLivingExpensesStepData,
  hasRequiredLivingExpenses,
  sanitizeLivingExpensesStepData,
} from "../../src/lib/livingExpenses";

describe("living expenses sanitization", () => {
  it("creates the canonical empty shape", () => {
    expect(createEmptyLivingExpensesStepData()).toEqual({
      currency: "EUR",
      rent: null,
      food: null,
      transport: null,
      social: null,
      travel: null,
      other: null,
    });
  });

  it("sanitizes string input into numeric canonical values", () => {
    expect(
      sanitizeLivingExpensesStepData({
        currency: "EUR",
        rent: "500",
        food: "230",
        transport: "40",
        social: "120",
        travel: "80",
        other: "20",
      }),
    ).toEqual({
      currency: "EUR",
      rent: 500,
      food: 230,
      transport: 40,
      social: 120,
      travel: 80,
      other: 20,
    });
  });

  it("does not accept legacy nested expenses shape", () => {
    expect(
      sanitizeLivingExpensesStepData({
        currency: "EUR",
        expenses: {
          groceries: "300",
          transportation: "50",
          socialLife: "90",
          travel: "70",
          otherExpenses: "15",
        },
      } as any),
    ).toEqual({
      currency: "EUR",
      rent: null,
      food: null,
      transport: null,
      social: null,
      travel: null,
      other: null,
    });
  });

  it("checks required fields for submit validation", () => {
    expect(
      hasRequiredLivingExpenses({
        currency: "EUR",
        rent: null,
        food: 200,
        transport: 40,
        social: 90,
        travel: 70,
        other: null,
      }),
    ).toBe(true);

    expect(
      hasRequiredLivingExpenses({
        currency: "EUR",
        rent: null,
        food: null,
        transport: 40,
        social: 90,
        travel: 70,
        other: null,
      }),
    ).toBe(false);
  });
});
