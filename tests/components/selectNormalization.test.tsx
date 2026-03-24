import React from "react";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "../../src/components/ui/enhanced-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";

function expectNoControlledStateWarning(
  calls: Array<Array<unknown>>,
  context: string,
) {
  const combinedOutput = calls.flat().join(" ");
  expect(
    combinedOutput,
    `${context} should not emit uncontrolled/controlled warnings`,
  ).not.toContain("changing from uncontrolled to controlled");
}

describe("Select normalization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps EnhancedSelect controlled when rerendering from undefined to a value", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { rerender } = render(
      <EnhancedSelect value={undefined} onValueChange={() => undefined}>
        <EnhancedSelectTrigger>
          <EnhancedSelectValue placeholder="Select one" />
        </EnhancedSelectTrigger>
        <EnhancedSelectContent>
          <EnhancedSelectItem value="bachelor">Bachelor</EnhancedSelectItem>
        </EnhancedSelectContent>
      </EnhancedSelect>,
    );

    rerender(
      <EnhancedSelect value="bachelor" onValueChange={() => undefined}>
        <EnhancedSelectTrigger>
          <EnhancedSelectValue placeholder="Select one" />
        </EnhancedSelectTrigger>
        <EnhancedSelectContent>
          <EnhancedSelectItem value="bachelor">Bachelor</EnhancedSelectItem>
        </EnhancedSelectContent>
      </EnhancedSelect>,
    );

    expectNoControlledStateWarning(consoleErrorSpy.mock.calls, "EnhancedSelect");
  });

  it("keeps Select controlled when rerendering from undefined to a value", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { rerender } = render(
      <Select value={undefined} onValueChange={() => undefined}>
        <SelectTrigger>
          <SelectValue placeholder="Select one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="spring">Spring</SelectItem>
        </SelectContent>
      </Select>,
    );

    rerender(
      <Select value="spring" onValueChange={() => undefined}>
        <SelectTrigger>
          <SelectValue placeholder="Select one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="spring">Spring</SelectItem>
        </SelectContent>
      </Select>,
    );

    expectNoControlledStateWarning(consoleErrorSpy.mock.calls, "Select");
  });
});
