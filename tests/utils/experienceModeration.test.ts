import { describe, expect, it } from "vitest";

import {
  buildStoredPublicWordingEdits,
  getPublicWordingEditorState,
  summarizePublicWordingChanges,
} from "../../src/lib/experienceModeration";

const baseSource = {
  accommodation: {
    accommodationReview: "Original housing wording.",
  },
  experience: {
    generalTips: "Original general tip.",
    academicAdvice: "Original academic advice.",
    socialAdvice: "Original social advice.",
    bestExperience: "Original best experience.",
  },
  courses: [
    {
      id: "course-1",
      homeCourseName: "Algorithms",
      homeECTS: 6,
      hostCourseName: "Advanced Algorithms",
      hostECTS: 6,
      recognitionType: "full_equivalence",
      notes: "Original course note.",
    },
  ],
  publicWordingOverrides: null,
};

describe("experienceModeration helpers", () => {
  it("hydrates editor state from stored wording overrides", () => {
    const state = getPublicWordingEditorState({
      ...baseSource,
      publicWordingOverrides: {
        generalTips: "Moderated public tip.",
        courseNotes: {
          "course-1": "Moderated public course note.",
        },
      },
    });

    expect(state.generalTips).toBe("Moderated public tip.");
    expect(state.courseNotes[0]?.value).toBe("Moderated public course note.");
  });

  it("stores only wording differences from the student source", () => {
    const wordingEdits = buildStoredPublicWordingEdits(baseSource, {
      accommodationReview: "Original housing wording.",
      generalTips: "Moderated public tip.",
      academicAdvice: "Original academic advice.",
      socialAdvice: "",
      bestExperience: "Original best experience.",
      courseNotes: [
        {
          id: "course-1",
          label: "Algorithms -> Advanced Algorithms",
          value: "",
        },
      ],
    });

    expect(wordingEdits).toEqual({
      generalTips: "Moderated public tip.",
      socialAdvice: null,
      courseNotes: {
        "course-1": null,
      },
    });
  });

  it("ignores adminNotes-shaped JSON because wording overrides no longer live there", () => {
    const state = getPublicWordingEditorState({
      ...baseSource,
      adminNotes: JSON.stringify({
        publicWordingEdits: {
          generalTips: "Wrong storage path.",
        },
      }),
      publicWordingOverrides: null,
    } as any);

    expect(state.generalTips).toBe("Original general tip.");
  });

  it("summarizes updated and cleared wording fields for the audit trail", () => {
    const changes = summarizePublicWordingChanges(baseSource, {
      accommodationReview: "",
      generalTips: "Moderated public tip.",
      academicAdvice: "Original academic advice.",
      socialAdvice: "Original social advice.",
      bestExperience: "Original best experience.",
      courseNotes: [
        {
          id: "course-1",
          label: "Algorithms -> Advanced Algorithms",
          value: "Moderated public course note.",
        },
      ],
    });

    expect(changes).toEqual([
      {
        label: "Accommodation review wording",
        mode: "cleared",
      },
      {
        label: "General tips wording",
        mode: "updated",
      },
      {
        label: "Course note wording: Algorithms -> Advanced Algorithms",
        mode: "updated",
      },
    ]);
  });
});
