import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AccommodationStep from "../../components/forms/steps/AccommodationStep";
import CourseMatchingStep from "../../components/forms/steps/CourseMatchingStep";
import ExperienceStep from "../../components/forms/steps/ExperienceStep";
import LivingExpensesStep from "../../components/forms/steps/LivingExpensesStep";

vi.mock("../../src/components/ui/photo-upload", () => ({
  PhotoUpload: () => <div data-testid="photo-upload" />,
}));

describe("remaining form steps autosave behavior", () => {
  it("does not auto-save on course matching field changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <CourseMatchingStep
        data={{ courses: [] }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getAllByLabelText(/course name \*/i)[0], {
      target: { value: "Algorithms" },
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("still saves course matching explicitly on save draft", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <CourseMatchingStep
        data={{ courses: [] }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("keeps course matching local edits when unrelated parent data changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();
    const stableCourses: any[] = [];

    const { rerender } = render(
      <CourseMatchingStep
        data={{ courses: stableCourses, accommodation: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getAllByLabelText(/course name \*/i)[0], {
      target: { value: "Algorithms" },
    });

    rerender(
      <CourseMatchingStep
        data={{
          courses: stableCourses,
          accommodation: { areaOrNeighborhood: "Near campus" },
        }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    expect(screen.getAllByLabelText(/course name \*/i)[0]).toHaveValue(
      "Algorithms",
    );
  });

  it("does not auto-save on accommodation field changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <AccommodationStep
        data={{ accommodation: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/area or neighborhood/i), {
      target: { value: "Near campus" },
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("still saves accommodation explicitly on save draft", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <AccommodationStep
        data={{ accommodation: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("keeps accommodation local edits when unrelated parent data changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();
    const stableAccommodation = {};

    const { rerender } = render(
      <AccommodationStep
        data={{ accommodation: stableAccommodation, experience: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/area or neighborhood/i), {
      target: { value: "Near campus" },
    });

    rerender(
      <AccommodationStep
        data={{
          accommodation: stableAccommodation,
          experience: { generalTips: "Bring adapters" },
        }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByLabelText(/area or neighborhood/i)).toHaveValue(
      "Near campus",
    );
  });

  it("does not auto-save on living expenses field changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <LivingExpensesStep
        data={{ livingExpenses: {}, accommodation: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^accommodation$/i), {
      target: { value: "500" },
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("still saves living expenses explicitly on save draft", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <LivingExpensesStep
        data={{ livingExpenses: {}, accommodation: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("keeps living expenses local edits when unrelated parent data changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();
    const stableLivingExpenses = {};
    const stableAccommodation = {};

    const { rerender } = render(
      <LivingExpensesStep
        data={{
          livingExpenses: stableLivingExpenses,
          accommodation: stableAccommodation,
          experience: {},
        }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/groceries & food/i), {
      target: { value: "250" },
    });

    rerender(
      <LivingExpensesStep
        data={{
          livingExpenses: stableLivingExpenses,
          accommodation: stableAccommodation,
          experience: { generalTips: "Bring adapters" },
        }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByLabelText(/groceries & food/i)).toHaveValue(250);
  });

  it("does not auto-save on experience field changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <ExperienceStep
        data={{ experience: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/top tips for future students/i), {
      target: { value: "Pack early" },
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("still saves experience explicitly on save draft", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <ExperienceStep
        data={{ experience: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("keeps experience local edits when unrelated parent data changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();
    const stableExperience = {};

    const { rerender } = render(
      <ExperienceStep
        data={{ experience: stableExperience, accommodation: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/top tips for future students/i), {
      target: { value: "Pack early" },
    });

    rerender(
      <ExperienceStep
        data={{
          experience: stableExperience,
          accommodation: { areaOrNeighborhood: "Near campus" },
        }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByLabelText(/top tips for future students/i)).toHaveValue(
      "Pack early",
    );
  });
});
