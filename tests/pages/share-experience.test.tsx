import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ShareExperience from "../../pages/share-experience";

const mockSaveProgress = vi.fn();
const mockSubmitExperience = vi.fn();
const mockRefreshExperience = vi.fn();
const mockToast = vi.fn();
const mockRouterReplace = vi.fn();
const mockRouterPush = vi.fn();
const mockSetCurrentStep = vi.fn();
const mockMarkStepCompleted = vi.fn();

let mockExperienceState: {
  data: any;
  loading: boolean;
  error: string | null;
};

let mockRouter = {
  pathname: "/share-experience",
  query: { step: "1" },
  asPath: "/share-experience?step=1",
  isReady: true,
  replace: mockRouterReplace,
  push: mockRouterPush,
};

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        email: "student@ucy.ac.cy",
      },
    },
    status: "authenticated",
  }),
}));

vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("../../src/hooks/useErasmusExperience", () => ({
  useErasmusExperience: () => ({
    ...mockExperienceState,
    saveProgress: mockSaveProgress,
    submitExperience: mockSubmitExperience,
    refreshData: mockRefreshExperience,
  }),
}));

vi.mock("../../src/context/FormProgressContext", () => ({
  useFormProgress: () => ({
    currentStepNumber: 1,
    completedStepNumbers: [],
    setCurrentStep: mockSetCurrentStep,
    markStepCompleted: mockMarkStepCompleted,
    getStepName: (stepNumber: number) =>
      (
        [
          "basic-info",
          "course-matching",
          "accommodation",
          "living-expenses",
          "help-future-students",
        ] as const
      )[stepNumber - 1],
  }),
}));

vi.mock("../../components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/ui/hero-section", () => ({
  HeroSection: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("../../components/forms/FormProvider", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-provider">{children}</div>
  ),
}));

vi.mock("../../components/forms/FormProgressBar", () => ({
  FormProgressBar: () => <div data-testid="form-progress-bar" />,
}));

vi.mock("../../components/forms/StepNavigation", () => ({
  StepNavigation: () => <div data-testid="step-navigation" />,
}));

vi.mock("../../src/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("../../src/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../src/components/ui/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@iconify/react", () => ({
  Icon: () => <span data-testid="icon" />,
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("../../src/hooks/use-toast", () => ({
  toast: (...args: any[]) => mockToast(...args),
}));

vi.mock("../../components/forms/steps/BasicInformationStep", () => ({
  default: ({
    data,
    onSave,
  }: {
    data: any;
    onSave: (value: any) => Promise<void>;
  }) => (
    <div>
      <div data-testid="basic-year">
        {data.basicInfo?.exchangeAcademicYear || ""}
      </div>
      <button
        onClick={() =>
          void onSave({
            basicInfo: {
              exchangeAcademicYear: "2026/2027",
            },
          })
        }
      >
        Trigger Step Save
      </button>
    </div>
  ),
}));

vi.mock("../../components/forms/steps/CourseMatchingStep", () => ({
  default: () => <div>Course Matching Step</div>,
}));

vi.mock("../../components/forms/steps/AccommodationStep", () => ({
  default: () => <div>Accommodation Step</div>,
}));

vi.mock("../../components/forms/steps/LivingExpensesStep", () => ({
  default: () => <div>Living Expenses Step</div>,
}));

vi.mock("../../components/forms/steps/ExperienceStep", () => ({
  default: () => <div>Experience Step</div>,
}));

describe("ShareExperience page", () => {
  beforeEach(() => {
    mockSaveProgress.mockReset();
    mockSubmitExperience.mockReset();
    mockRefreshExperience.mockReset();
    mockToast.mockReset();
    mockRouterReplace.mockReset();
    mockRouterPush.mockReset();
    mockSetCurrentStep.mockReset();
    mockMarkStepCompleted.mockReset();

    mockSaveProgress.mockResolvedValue(true);
    mockSubmitExperience.mockResolvedValue(true);

    mockExperienceState = {
      data: {
        id: "experience-1",
        currentStep: 1,
        basicInfo: {
          exchangeAcademicYear: "2025/2026",
        },
        courses: [],
        accommodation: null,
        livingExpenses: null,
        experience: {},
      },
      loading: false,
      error: null,
    };

    mockRouter = {
      pathname: "/share-experience",
      query: { step: "1" },
      asPath: "/share-experience?step=1",
      isReady: true,
      replace: mockRouterReplace,
      push: mockRouterPush,
    };
  });

  it("does not rehydrate the form when the same experience id rerenders after save", async () => {
    const { rerender } = render(<ShareExperience />);

    expect(screen.getByTestId("basic-year")).toHaveTextContent("2025/2026");

    fireEvent.click(screen.getByRole("button", { name: /trigger step save/i }));

    await waitFor(() => {
      expect(mockSaveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          basicInfo: expect.objectContaining({
            exchangeAcademicYear: "2026/2027",
          }),
        }),
      );
    });

    expect(screen.getByTestId("basic-year")).toHaveTextContent("2026/2027");

    mockExperienceState = {
      ...mockExperienceState,
      data: {
        ...mockExperienceState.data,
        basicInfo: {
          exchangeAcademicYear: "2025/2026",
        },
      },
    };

    rerender(<ShareExperience />);

    expect(screen.getByTestId("basic-year")).toHaveTextContent("2026/2027");
  });

  it("rehydrates when a different experience id is loaded", () => {
    const { rerender } = render(<ShareExperience />);

    expect(screen.getByTestId("basic-year")).toHaveTextContent("2025/2026");

    mockExperienceState = {
      ...mockExperienceState,
      data: {
        ...mockExperienceState.data,
        id: "experience-2",
        basicInfo: {
          exchangeAcademicYear: "2027/2028",
        },
      },
    };

    rerender(<ShareExperience />);

    expect(screen.getByTestId("basic-year")).toHaveTextContent("2027/2028");
  });
});
