import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import BasicInformationStep from "../../components/forms/steps/BasicInformationStep";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
  }),
}));

describe("BasicInformationStep", () => {
  it("does not auto-save on regular field changes", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <BasicInformationStep
        data={{ basicInfo: {} }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/exchange academic year/i), {
      target: { value: "2026/2027" },
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("still saves when the user explicitly clicks save draft", () => {
    const onSave = vi.fn();
    const onComplete = vi.fn();

    render(
      <BasicInformationStep
        data={{
          basicInfo: {
            exchangeAcademicYear: "2026/2027",
          },
        }}
        onSave={onSave}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /save draft/i,
      }),
    );

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      basicInfo: expect.objectContaining({
        exchangeAcademicYear: "2026/2027",
      }),
    });
  });
});
