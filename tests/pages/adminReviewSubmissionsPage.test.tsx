import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ReviewSubmissions from "../../pages/admin/review-submissions";

const mockFetch = vi.fn();
const mockRouterReplace = vi.fn();

let mockSessionStatus: "authenticated" | "unauthenticated" | "loading" =
  "authenticated";
let mockSessionData: any = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
  },
};
let mockRouter = {
  asPath: "/admin/review-submissions",
  replace: mockRouterReplace,
};

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: mockSessionData,
    status: mockSessionStatus,
  }),
}));

vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("../../components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("../../src/components/admin/PublicImpactPreview", () => ({
  default: ({ preview }: { preview: { slug: string } }) => (
    <div data-testid="public-impact-preview">{preview.slug}</div>
  ),
}));

vi.mock("../../src/components/ui/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../src/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("../../src/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("../../src/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../src/components/ui/textarea", () => ({
  Textarea: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
  }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

describe("admin review submissions page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Admin access required",
      }),
    });

    mockSessionStatus = "authenticated";
    mockSessionData = {
      user: {
        id: "admin-1",
        email: "admin@example.com",
        role: "ADMIN",
      },
    };
    mockRouter = {
      asPath: "/admin/review-submissions",
      replace: mockRouterReplace,
    };
  });

  it("opens a submitted queue item and shows moderation readiness", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "experience-1",
          status: "SUBMITTED",
          revisionCount: 0,
          submittedAt: "2026-02-03T00:00:00.000Z",
          reviewFeedback: null,
          adminNotes: null,
          publicWordingOverrides: null,
          basicInfo: {
            homeUniversity: "University of Cyprus",
            hostUniversity: "University of Amsterdam",
            hostCity: "Amsterdam",
            hostCountry: null,
          },
          courses: [],
          accommodation: {},
          livingExpenses: {
            currency: "EUR",
          },
          experience: {
            generalTips: "Pack for the rain.",
          },
          hostCity: "Amsterdam",
          hostCountry: null,
          user: {
            id: "student-1",
            name: "Ada Student",
            email: "ada@example.com",
          },
          publicImpactPreview: null,
          publicImpactPreviewUnavailableReason: {
            code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
            message:
              "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
            missingFields: [
              "hostCountry",
              "accommodationType",
              "monthlyRent",
              "courseMappings",
            ],
          },
        },
      ],
    });

    render(<ReviewSubmissions />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/erasmus-experiences?status=SUBMITTED",
      );
    });

    expect(await screen.findByText("Ada Student")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /review/i }));

    expect(await screen.findByText("Approval readiness")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Complete the MVP minimum public contract before approving this submission.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Host country, Accommodation type, Monthly rent, At least 1 complete course mapping",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
      ),
    ).toBeInTheDocument();
  });

  it("blocks non-admin users from loading the admin review page", async () => {
    mockSessionData = {
      user: {
        id: "student-1",
        email: "student@example.com",
        role: "USER",
      },
    };

    render(<ReviewSubmissions />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalled();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
