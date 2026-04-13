import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

function createDestination(overrides: Record<string, unknown> = {}) {
  return {
    slug: "amsterdam-netherlands",
    city: "Amsterdam",
    country: "Netherlands",
    hostUniversityCount: 2,
    submissionCount: 4,
    latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
    averageRent: 650,
    averageMonthlyCost: 1150,
    ...overrides,
  };
}

describe("destinations page", () => {
  it("renders public destination cards with approved public signals without authentication", () => {
    render(
      <DestinationsPage
        destinations={[
          createDestination(),
          createDestination({
            slug: "copenhagen-denmark",
            city: "Copenhagen",
            country: "Denmark",
            hostUniversityCount: 1,
            submissionCount: 2,
            latestReportSubmittedAt: "2026-01-09T00:00:00.000Z",
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    const amsterdamCard = screen
      .getByRole("heading", { name: "Amsterdam, Netherlands" })
      .closest("a");

    expect(amsterdamCard).not.toBeNull();
    expect(amsterdamCard).toHaveAttribute(
      "href",
      "/destinations/amsterdam-netherlands",
    );
    expect(
      within(amsterdamCard as HTMLElement).getByText(
        "Based on 4 approved submissions",
      ),
    ).toBeInTheDocument();
    expect(
      within(amsterdamCard as HTMLElement).getByText(
        "A useful amount of student data is available.",
      ),
    ).toBeInTheDocument();
    expect(
      within(amsterdamCard as HTMLElement).getByText(
        "Latest approved report: Feb 18, 2026",
      ),
    ).toBeInTheDocument();
    expect(
      within(amsterdamCard as HTMLElement).getByText("Avg rent"),
    ).toBeInTheDocument();
    expect(amsterdamCard).toHaveTextContent("650");
    expect(
      within(amsterdamCard as HTMLElement).getByText("Avg monthly budget"),
    ).toBeInTheDocument();
    expect(amsterdamCard).toHaveTextContent("1,150");
  });

  it("filters destinations by search query", () => {
    render(
      <DestinationsPage
        destinations={[
          createDestination(),
          createDestination({
            slug: "copenhagen-denmark",
            city: "Copenhagen",
            country: "Denmark",
            hostUniversityCount: 1,
            submissionCount: 2,
            latestReportSubmittedAt: "2026-01-09T00:00:00.000Z",
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Search by city or country"),
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
    expect(
      screen.getByText('Showing 1 of 2 destinations for "copen".'),
    ).toBeInTheDocument();
  });

  it("filters destinations by country", () => {
    render(
      <DestinationsPage
        destinations={[
          createDestination(),
          createDestination({
            slug: "copenhagen-denmark",
            city: "Copenhagen",
            country: "Denmark",
            hostUniversityCount: 1,
            submissionCount: 2,
            latestReportSubmittedAt: "2026-01-09T00:00:00.000Z",
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Denmark"));

    expect(
      screen.queryByRole("heading", { name: "Amsterdam, Netherlands" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Copenhagen, Denmark" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 destinations.")).toBeInTheDocument();
  });

  it("renders an empty state when there are no approved destinations", () => {
    render(<DestinationsPage destinations={[]} />);

    expect(
      screen.getByText("No approved destination data available yet."),
    ).toBeInTheDocument();
  });

  it("renders a clear no-match state when search and country filter remove all matches", () => {
    render(
      <DestinationsPage
        destinations={[
          createDestination(),
          createDestination({
            slug: "copenhagen-denmark",
            city: "Copenhagen",
            country: "Denmark",
            hostUniversityCount: 1,
            submissionCount: 2,
            latestReportSubmittedAt: "2026-01-09T00:00:00.000Z",
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Denmark"));

    fireEvent.change(
      screen.getByPlaceholderText("Search by city or country"),
      {
        target: { value: "amsterdam" },
      },
    );

    expect(
      screen.getByText(
        "No destinations match the current search and filter selection.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the country filter available for narrowing the list", () => {
    render(
      <DestinationsPage
        destinations={[
          createDestination(),
        ]}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("All countries");
    expect(screen.getByText("Showing 1 of 1 destinations.")).toBeInTheDocument();
  });
});
