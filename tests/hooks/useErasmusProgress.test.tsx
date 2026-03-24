import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useErasmusProgress } from "../../src/hooks/useErasmusProgress";
import {
  ERASMUS_PROGRESS_SYNC_STORAGE_KEY,
  publishErasmusProgressSync,
} from "../../src/lib/erasmusProgressSync";

function createResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

function ProgressHarness() {
  const { completedCount, progressPercentage, currentStep, loading } =
    useErasmusProgress();

  return (
    <div>
      <div data-testid="loading">{loading ? "yes" : "no"}</div>
      <div data-testid="completed-count">{completedCount}</div>
      <div data-testid="progress">{progressPercentage}</div>
      <div data-testid="current-step">{currentStep}</div>
    </div>
  );
}

describe("useErasmusProgress", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("refreshes progress when the form publishes a sync event", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse([
          {
            id: "experience-1",
            basicInfo: {},
            courses: [],
            accommodation: {},
            livingExpenses: {},
            experience: {},
          },
        ]),
      )
      .mockResolvedValueOnce(
        createResponse([
          {
            id: "experience-1",
            basicInfo: {
              homeUniversity: "University of Nicosia (UNIC)",
              homeDepartment: "Computer Science",
              levelOfStudy: "Bachelor",
              hostUniversity: "University of Amsterdam",
              exchangeAcademicYear: "2026/2027",
              exchangePeriod: "Fall",
            },
            courses: [],
            accommodation: {},
            livingExpenses: {},
            experience: {},
          },
        ]),
      ) as typeof fetch;

    render(<ProgressHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("completed-count")).toHaveTextContent("0");
      expect(screen.getByTestId("current-step")).toHaveTextContent("1");
    });

    act(() => {
      publishErasmusProgressSync({
        userId: "student-1",
        experienceId: "experience-1",
        action: "save",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("completed-count")).toHaveTextContent("1");
      expect(screen.getByTestId("progress")).toHaveTextContent("20");
      expect(screen.getByTestId("current-step")).toHaveTextContent("2");
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
  });

  it("refreshes silently on focus and storage sync", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse([
          {
            id: "experience-1",
            basicInfo: {
              homeUniversity: "University of Nicosia (UNIC)",
              homeDepartment: "Computer Science",
              levelOfStudy: "Bachelor",
              hostUniversity: "University of Amsterdam",
              exchangeAcademicYear: "2026/2027",
              exchangePeriod: "Fall",
            },
            courses: [],
            accommodation: {},
            livingExpenses: {},
            experience: {},
          },
        ]),
      )
      .mockResolvedValueOnce(
        createResponse([
          {
            id: "experience-1",
            basicInfo: {
              homeUniversity: "University of Nicosia (UNIC)",
              homeDepartment: "Computer Science",
              levelOfStudy: "Bachelor",
              hostUniversity: "University of Amsterdam",
              exchangeAcademicYear: "2026/2027",
              exchangePeriod: "Fall",
            },
            courses: [
              {
                id: "course-1",
                homeCourseName: "Algorithms",
                homeECTS: 6,
                hostCourseName: "Advanced Algorithms",
                hostECTS: 6,
                recognitionType: "full_equivalence",
              },
            ],
            accommodation: {},
            livingExpenses: {},
            experience: {},
          },
        ]),
      )
      .mockResolvedValueOnce(
        createResponse([
          {
            id: "experience-1",
            basicInfo: {
              homeUniversity: "University of Nicosia (UNIC)",
              homeDepartment: "Computer Science",
              levelOfStudy: "Bachelor",
              hostUniversity: "University of Amsterdam",
              exchangeAcademicYear: "2026/2027",
              exchangePeriod: "Fall",
            },
            courses: [
              {
                id: "course-1",
                homeCourseName: "Algorithms",
                homeECTS: 6,
                hostCourseName: "Advanced Algorithms",
                hostECTS: 6,
                recognitionType: "full_equivalence",
              },
            ],
            accommodation: {
              accommodationType: "shared_apartment",
              monthlyRent: 450,
              billsIncluded: "yes",
              accommodationRating: 4,
              wouldRecommend: true,
            },
            livingExpenses: {},
            experience: {},
          },
        ]),
      ) as typeof fetch;

    render(<ProgressHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("completed-count")).toHaveTextContent("1");
      expect(screen.getByTestId("current-step")).toHaveTextContent("2");
    });

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("completed-count")).toHaveTextContent("2");
      expect(screen.getByTestId("current-step")).toHaveTextContent("3");
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: ERASMUS_PROGRESS_SYNC_STORAGE_KEY,
          newValue: JSON.stringify({ action: "save", updatedAt: Date.now() }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("completed-count")).toHaveTextContent("3");
      expect(screen.getByTestId("current-step")).toHaveTextContent("4");
    });
  });
});
