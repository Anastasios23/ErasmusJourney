import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import {
  StoriesListMetaTags,
  StoryMetaTags,
} from "../../src/utils/seoUtils";

describe("seoUtils", () => {
  it("points story metadata at the canonical destination page", () => {
    const { container } = render(
      <StoryMetaTags
        story={{
          id: "story-1",
          studentName: "Maria K.",
          university: "University of Cyprus",
          city: "Amsterdam",
          country: "Netherlands",
          department: "Computer Science",
          levelOfStudy: "Bachelor",
          exchangePeriod: "Spring 2026",
          story: "A useful and practical Erasmus semester.",
          tips: [],
          helpTopics: ["courses", "housing"],
          contactMethod: null,
          contactInfo: null,
          accommodationTips: null,
          budgetTips: null,
          createdAt: "2026-03-26T10:00:00.000Z",
        }}
      />,
    );

    expect(
      container.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://erasmusjourney.com/destinations/amsterdam-netherlands");
    expect(
      container
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content"),
    ).toBe("https://erasmusjourney.com/destinations/amsterdam-netherlands");
  });

  it("points list metadata at the canonical destinations page", () => {
    const { container } = render(<StoriesListMetaTags totalStories={24} />);

    expect(
      container.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://erasmusjourney.com/destinations");
    expect(
      container
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content"),
    ).toBe("https://erasmusjourney.com/destinations");
  });
});
