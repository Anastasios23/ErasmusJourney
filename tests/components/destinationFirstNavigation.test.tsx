import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Footer from "../../src/components/Footer";
import LoginPrompt from "../../src/components/LoginPrompt";
import { QuickStartGuide } from "../../src/components/ui/user-guidance";

describe("destination-first navigation helpers", () => {
  it("keeps footer quick links on canonical destination routes", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Destinations" })).toHaveAttribute(
      "href",
      "/destinations",
    );
    expect(
      screen.getByRole("link", { name: "Housing Insights" }),
    ).toHaveAttribute("href", "/destinations?focus=accommodation");
    expect(
      screen.getByRole("link", { name: "Course Examples" }),
    ).toHaveAttribute("href", "/course-matching-experiences");
  });

  it("lets logged-out users browse destinations, housing, and courses from the login prompt", () => {
    render(<LoginPrompt />);

    expect(screen.getByRole("link", { name: "Destinations" })).toHaveAttribute(
      "href",
      "/destinations",
    );
    expect(screen.getByRole("link", { name: "Housing" })).toHaveAttribute(
      "href",
      "/destinations?focus=accommodation",
    );
    expect(screen.getByRole("link", { name: "Course Examples" })).toHaveAttribute(
      "href",
      "/destinations?focus=courses",
    );
  });

  it("surfaces canonical public discovery routes in the quick-start guide", () => {
    render(<QuickStartGuide userType="explorer" />);

    expect(
      screen.getByRole("link", { name: "Browse destination hubs" }),
    ).toHaveAttribute("href", "/destinations");
    expect(
      screen.getByRole("link", { name: "Review course examples" }),
    ).toHaveAttribute("href", "/destinations?focus=courses");
    expect(
      screen.getByRole("link", { name: "Check housing costs" }),
    ).toHaveAttribute("href", "/destinations?focus=accommodation");
  });
});
