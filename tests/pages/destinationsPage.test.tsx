import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("../../src/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

import DestinationsPage from "../../pages/destinations";

describe("destinations page", () => {
  it("filters destinations by search query and surfaces signal strength", () => {
    render(
      <DestinationsPage
        destinations={[
          {
            slug: "amsterdam-netherlands",
            city: "Amsterdam",
            country: "Netherlands",
            hostUniversityCount: 2,
            submissionCount: 4,
            averageRent: 650,
            averageMonthlyCost: 1150,
          },
          {
            slug: "copenhagen-denmark",
            city: "Copenhagen",
            country: "Denmark",
            hostUniversityCount: 1,
            submissionCount: 2,
            averageRent: 700,
            averageMonthlyCost: 1300,
          },
        ]}
      />,
    );

    expect(screen.getByText("Growing sample")).toBeInTheDocument();
    expect(screen.getByText("Early signal")).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("Search by city, country, or slug"),
      {
        target: { value: "copen" },
      },
    );

    expect(
      screen.getByRole("heading", { name: "Copenhagen, Denmark" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Amsterdam, Netherlands" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 / 2")).toBeInTheDocument();
  });

  it("renders a clear empty state when search removes all matches", () => {
    render(
      <DestinationsPage
        destinations={[
          {
            slug: "amsterdam-netherlands",
            city: "Amsterdam",
            country: "Netherlands",
            hostUniversityCount: 2,
            submissionCount: 4,
            averageRent: 650,
            averageMonthlyCost: 1150,
          },
        ]}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Search by city, country, or slug"),
      {
        target: { value: "zurich" },
      },
    );

    expect(
      screen.getByText(
        "No destinations match the current search and filter selection.",
      ),
    ).toBeInTheDocument();
  });

  it("explains the destination-first flow when accommodation is the entry focus", () => {
    render(
      <DestinationsPage
        focus="accommodation"
        destinations={[
          {
            slug: "amsterdam-netherlands",
            city: "Amsterdam",
            country: "Netherlands",
            hostUniversityCount: 2,
            submissionCount: 4,
            averageRent: 650,
            averageMonthlyCost: 1150,
          },
        ]}
      />,
    );

    expect(screen.getByText("Accommodation Flow")).toBeInTheDocument();
    expect(
      screen.getByText("Housing insights live inside each destination page."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /open a city first, then use its accommodation tab/i,
      ),
    ).toBeInTheDocument();
  });
});
