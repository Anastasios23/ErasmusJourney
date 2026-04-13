import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFetch,
  mockRouterReplace,
  mockRouterPush,
  mockSession,
  mockRouterState,
} = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockRouterPush: vi.fn(),
  mockSession: {
    status: "authenticated" as
      | "authenticated"
      | "loading"
      | "unauthenticated",
    data: {
      user: {
        id: "student-1",
        email: "student@example.com",
      },
    } as any,
  },
  mockRouterState: {
    pathname: "/my-submissions",
    asPath: "/my-submissions",
    query: {} as Record<string, unknown>,
    isReady: true,
  },
}));

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: mockSession.data,
    status: mockSession.status,
  }),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({
    ...mockRouterState,
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
}));

vi.mock("../../components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/ui/hero-section", () => ({
  HeroSection: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("../../src/components/admin/PublicImpactPreview", () => ({
  default: () => <div data-testid="public-impact-preview" />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@iconify/react", () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock("lucide-react", () => {
  const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />;

  return {
    AlertCircle: Icon,
    ArrowLeft: Icon,
    Calendar: Icon,
    CheckCircle: Icon,
    ChevronRight: Icon,
    Clock: Icon,
    MapPin: Icon,
    User: Icon,
    XCircle: Icon,
  };
});

vi.mock("../../src/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: string;
    size?: string;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("../../src/components/ui/card", () => ({
  Card: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  CardContent: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

vi.mock("../../src/components/ui/badge", () => ({
  Badge: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement> & { children: React.ReactNode }) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock("../../src/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("../../src/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <button type="button">{children}</button>,
  SelectValue: ({
    placeholder,
  }: {
    placeholder?: string;
  }) => <span>{placeholder}</span>,
}));

vi.mock("../../src/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("../../src/components/ui/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../src/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

import MySubmissions from "../../pages/my-submissions";
import ReviewSubmissions from "../../pages/admin/review-submissions";

function setRouter(path: string) {
  mockRouterState.pathname = path.split("?")[0] || path;
  mockRouterState.asPath = path;
  mockRouterState.query = {};
  mockRouterState.isReady = true;
}

describe("protected page access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockFetch);

    mockSession.status = "authenticated";
    mockSession.data = {
      user: {
        id: "student-1",
        email: "student@example.com",
      },
    };
    setRouter("/my-submissions");

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("redirects unauthenticated users away from /my-submissions", async () => {
    mockSession.status = "unauthenticated";
    mockSession.data = null;
    setRouter("/my-submissions");

    render(<MySubmissions />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith(
        "/login?callbackUrl=%2Fmy-submissions",
      );
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users away from /admin/review-submissions", async () => {
    mockSession.status = "unauthenticated";
    mockSession.data = null;
    setRouter("/admin/review-submissions");

    render(<ReviewSubmissions />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith(
        "/login?callbackUrl=%2Fadmin%2Freview-submissions",
      );
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("links approved submissions to the canonical destination slug", async () => {
    setRouter("/my-submissions");
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "exp-approved-1",
          status: "APPROVED",
          hostCity: "Amsterdam",
          hostCountry: "Netherlands",
          basicInfo: {
            hostUniversity: "University of Amsterdam",
            exchangePeriod: "Fall",
            exchangeAcademicYear: "2026/2027",
          },
          reviewFeedback: null,
          reviewedBy: null,
          reviewedAt: null,
          submittedAt: "2026-02-18T00:00:00.000Z",
          createdAt: "2026-01-12T00:00:00.000Z",
          updatedAt: "2026-02-20T00:00:00.000Z",
          lastSavedAt: "2026-02-20T00:00:00.000Z",
          revisionCount: 0,
          isComplete: true,
        },
      ],
    });

    render(<MySubmissions />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/erasmus-experiences");
    });

    const viewDestinationButton = await screen.findByText("View Destination");
    const destinationLink = viewDestinationButton.closest("a");

    expect(destinationLink).not.toBeNull();
    expect(destinationLink).toHaveAttribute(
      "href",
      "/destinations/amsterdam-netherlands",
    );
  });
});
