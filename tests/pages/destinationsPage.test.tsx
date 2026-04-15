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
    submissionCount: 7,
    latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
    isLimitedData: false,
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
            isLimitedData: true,
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    const amsterdamHeading = screen.getByRole("heading", { name: "Amsterdam" });
    const amsterdamLink = within(amsterdamHeading).getByRole("link", {
      name: "Amsterdam",
    });
    const amsterdamCard = amsterdamHeading.closest(".rounded-lg");

    expect(amsterdamCard).not.toBeNull();
    expect(amsterdamLink).toHaveAttribute(
      "href",
      "/destinations/amsterdam-netherlands",
    );
    expect(
      within(amsterdamCard as HTMLElement).getByText("7 student reports"),
    ).toBeInTheDocument();
    expect(
      within(amsterdamCard as HTMLElement).getByText("Netherlands"),
    ).toBeInTheDocument();
    expect(
      within(amsterdamCard as HTMLElement).getByText(
        /Avg rent:\s*€650\/mo/,
      ),
    ).toBeInTheDocument();
    expect(
      within(amsterdamCard as HTMLElement).getByText(
        /Last report:\s*February 2026/,
      ),
    ).toBeInTheDocument();
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
            isLimitedData: true,
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    expect(
      screen.queryByPlaceholderText("Search by city or country"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Copenhagen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Amsterdam" }),
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
            isLimitedData: true,
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Denmark" }));

    expect(
      screen.queryByRole("heading", { name: "Amsterdam" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Copenhagen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox"),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Denmark");
  });

  it("renders an empty state when there are no approved destinations", () => {
    render(<DestinationsPage destinations={[]} />);

    expect(
      screen.getByText(
        /No destinations have been reported yet\.\s*Be the first to share your Erasmus experience\./,
      ),
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
            isLimitedData: true,
            averageRent: 700,
            averageMonthlyCost: 1300,
          }),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Denmark" }));

    expect(
      screen.queryByRole("heading", { name: "Amsterdam" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Copenhagen" }),
    ).toBeInTheDocument();
  });

  it("keeps the country filter available for narrowing the list", () => {
    render(<DestinationsPage destinations={[createDestination()]} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("All countries");
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Netherlands" }));
    expect(
      screen.getByRole("heading", { name: "Amsterdam" }),
    ).toBeInTheDocument();
  });
});
