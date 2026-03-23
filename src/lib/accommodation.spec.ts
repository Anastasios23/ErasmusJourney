import { describe, expect, it } from "vitest";
import {
  createEmptyAccommodationStepData,
  isAccommodationStepComplete,
  sanitizeAccommodationStepData,
} from "./accommodation";

describe("accommodation step contract", () => {
  it("maps legacy accommodation fields into the normalized step contract", () => {
    const sanitized = sanitizeAccommodationStepData({
      type: "Dormitory",
      rent: "450",
      currency: "eur",
      billsIncluded: "partial",
      neighborhood: "Gracia",
      distanceToUniversity: "15",
      howFoundAccommodation: "facebook",
      easyToFind: "difficult",
      rating: "4",
      wouldRecommend: "yes",
      review: "Good value and safe area.",
      address: "123 Main Street",
    });

    expect(sanitized).toEqual({
      accommodationType: "student_residence",
      monthlyRent: 450,
      currency: "EUR",
      billsIncluded: "partially",
      areaOrNeighborhood: "Gracia",
      minutesToUniversity: 15,
      howFoundAccommodation: "facebook_group",
      difficultyFindingAccommodation: "difficult",
      accommodationRating: 4,
      wouldRecommend: true,
      accommodationReview: "Good value and safe area.",
    });
    expect(Object.prototype.hasOwnProperty.call(sanitized, "address")).toBe(
      false,
    );
  });

  it("does not coerce free-text distance into minutes", () => {
    const sanitized = sanitizeAccommodationStepData({
      distanceToUniversity: "20 minute walk",
    });

    expect(sanitized.minutesToUniversity).toBeUndefined();
  });

  it("treats the new required accommodation fields as the completion gate", () => {
    expect(createEmptyAccommodationStepData()).toEqual({ currency: "EUR" });

    expect(
      isAccommodationStepComplete({
        accommodationType: "shared_apartment",
        monthlyRent: 650,
        currency: "EUR",
        billsIncluded: "yes",
        accommodationRating: 5,
        wouldRecommend: false,
      }),
    ).toBe(true);

    expect(
      isAccommodationStepComplete({
        accommodationType: "shared_apartment",
        monthlyRent: 650,
        currency: "EUR",
        billsIncluded: "yes",
        accommodationRating: 5,
      }),
    ).toBe(false);
  });
});
