import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
  Pencil,
  Undo2,
  User,
  XCircle,
} from "lucide-react";

import Header from "../../components/Header";
import PublicImpactPreview from "../../src/components/admin/PublicImpactPreview";
import { Alert, AlertDescription } from "../../src/components/ui/alert";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Textarea } from "../../src/components/ui/textarea";
import {
  formatSubmissionTimestamp,
  getApprovalReadiness,
  getRevisionStatusMeta,
  getSubmissionModerationSummary,
  getSubmissionQueueCategory,
  type AdminReviewSubmissionLike,
} from "../../src/lib/adminReview";
import { buildLoginRedirectUrl } from "../../src/lib/authRedirect";
import { sanitizeAccommodationStepData } from "../../src/lib/accommodation";
import {
  getPublicWordingEditorState,
  getExperiencePublicWordingEdits,
  type PublicWordingEditorState,
} from "../../src/lib/experienceModeration";
import { sanitizeCourseMappingsData } from "../../src/lib/courseMatching";
import { buildPublicDestinationRoute } from "../../src/lib/publicRoutes";
import {
  REVIEW_ACTION,
  type ErasmusExperienceStatus,
  type ReviewActionType,
} from "../../src/lib/canonicalWorkflow";
import type {
  AdminPublicImpactPreview,
  AdminPublicImpactPreviewUnavailable,
} from "../../src/types/adminPublicImpactPreview";

interface Experience extends AdminReviewSubmissionLike {
  id: string;
  status: ErasmusExperienceStatus;
  revisionCount: number;
  submittedAt: string | null;
  reviewFeedback: string | null;
  adminNotes: string | null;
  publicWordingOverrides: unknown | null;
  basicInfo: any;
  courses: any;
  accommodation: any;
  livingExpenses: any;
  experience: any;
  hostCity: string | null;
  hostCountry: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  publicImpactPreview?: AdminPublicImpactPreview | null;
  publicImpactPreviewUnavailableReason?: AdminPublicImpactPreviewUnavailable | null;
}

type QueueFilter = "all" | "ready" | "blocked" | "needs_revision";
type SortOrder = "newest" | "oldest";
type AdminView = "moderation" | "live_destinations";
type NarrativeWordingField = Exclude<
  keyof PublicWordingEditorState,
  "courseNotes"
>;

interface LiveDestinationRow {
  slug: string;
  city: string;
  country: string;
  submissionCount: number;
  averageRent: number | null;
  updatedAt: string;
}

interface ApprovedWordingEditState {
  experienceSummary: string;
  accommodationComment: string;
  courseNotes: Record<string, string>;
}

const FEEDBACK_PRESETS = [
  {
    label: "Missing destination info",
    text: "Missing destination info. Add the host university, host city, host country, home university, and home department so this can publish safely.",
  },
  {
    label: "Housing info too vague",
    text: "Housing info is still too vague. Keep it anonymous, but add clearer accommodation type, rent, recommendation, and rating details.",
  },
  {
    label: "Course mappings incomplete",
    text: "Course mappings are incomplete. Add at least one clear home-to-host match with ECTS and recognition type.",
  },
  {
    label: "Contains private information",
    text: "This includes private or identifying information. Remove exact addresses, phone numbers, social handles, or other personal details before resubmitting.",
  },
  {
    label: "Needs more useful advice",
    text: "The final advice needs to be more useful for future students. Add practical tips or clearer examples from your experience.",
  },
] as const;

function getFilterLabel(filter: QueueFilter): string {
  switch (filter) {
    case "ready":
      return "Ready to approve";
    case "blocked":
      return "Blocked";
    case "needs_revision":
      return "Changes requested";
    case "all":
    default:
      return "All submissions";
  }
}

function sortSubmissions(entries: Experience[], sortOrder: SortOrder) {
  return [...entries].sort((left, right) => {
    const leftTime = left.submittedAt
      ? new Date(left.submittedAt).getTime()
      : 0;
    const rightTime = right.submittedAt
      ? new Date(right.submittedAt).getTime()
      : 0;

    return sortOrder === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });
}

function createEmptyWordingEdits(): PublicWordingEditorState {
  return {
    accommodationReview: "",
    generalTips: "",
    academicAdvice: "",
    socialAdvice: "",
    bestExperience: "",
    courseNotes: [],
  };
}

function buildWordingEditsPayload(wordingEdits: PublicWordingEditorState) {
  return {
    accommodationReview: wordingEdits.accommodationReview,
    generalTips: wordingEdits.generalTips,
    academicAdvice: wordingEdits.academicAdvice,
    socialAdvice: wordingEdits.socialAdvice,
    bestExperience: wordingEdits.bestExperience,
    courseNotes: Object.fromEntries(
      wordingEdits.courseNotes.map((courseNote) => [
        courseNote.id,
        courseNote.value,
      ]),
    ),
  };
}

const PUBLIC_WORDING_FIELDS: Array<{
  label: string;
  field: NarrativeWordingField;
  placeholder: string;
}> = [
  {
    label: "Accommodation review",
    field: "accommodationReview",
    placeholder: "Optional public-facing housing comment.",
  },
  {
    label: "General tips",
    field: "generalTips",
    placeholder: "Optional destination-level practical tip.",
  },
  {
    label: "Academic advice",
    field: "academicAdvice",
    placeholder: "Optional course and workload guidance.",
  },
  {
    label: "Social advice",
    field: "socialAdvice",
    placeholder: "Optional social and settling-in guidance.",
  },
  {
    label: "Best experience",
    field: "bestExperience",
    placeholder: "Optional highlight shown in public practical tips.",
  },
];

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getOriginalExperienceSummary(submission: Experience): string {
  const experience = toRecord(submission.experience);
  return asTrimmedString(experience?.bestExperience);
}

function getOriginalAccommodationComment(submission: Experience): string {
  const accommodation = sanitizeAccommodationStepData(
    toRecord(submission.accommodation),
  );
  return asTrimmedString(accommodation.accommodationReview);
}

function getCourseNoteRows(submission: Experience): Array<{
  id: string;
  label: string;
  originalValue: string;
}> {
  return sanitizeCourseMappingsData(submission.courses).map((mapping) => ({
    id: mapping.id,
    label: `${mapping.homeCourseName || "Home course"} -> ${
      mapping.hostCourseName || "Host course"
    }`,
    originalValue: asTrimmedString(mapping.notes),
  }));
}

function buildApprovedWordingEditState(
  submission: Experience,
): ApprovedWordingEditState {
  const wordingOverrides = getExperiencePublicWordingEdits(
    submission.publicWordingOverrides,
  );

  const originalSummary = getOriginalExperienceSummary(submission);
  const originalAccommodationComment =
    getOriginalAccommodationComment(submission);
  const courseNoteRows = getCourseNoteRows(submission);

  return {
    experienceSummary:
      wordingOverrides.bestExperience === null
        ? ""
        : wordingOverrides.bestExperience || originalSummary,
    accommodationComment:
      wordingOverrides.accommodationReview === null
        ? ""
        : wordingOverrides.accommodationReview || originalAccommodationComment,
    courseNotes: Object.fromEntries(
      courseNoteRows.map((courseNote) => {
        const overrideValue = wordingOverrides.courseNotes?.[courseNote.id];
        const value =
          overrideValue === null
            ? ""
            : overrideValue || courseNote.originalValue;

        return [courseNote.id, value];
      }),
    ),
  };
}

export default function ReviewSubmissions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Experience[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<Experience[]>(
    [],
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<Experience | null>(null);
  const [activeView, setActiveView] = useState<AdminView>("moderation");
  const [liveDestinations, setLiveDestinations] = useState<
    LiveDestinationRow[]
  >([]);
  const [editingApprovedSubmissionId, setEditingApprovedSubmissionId] =
    useState<string | null>(null);
  const [approvedWordingEdits, setApprovedWordingEdits] =
    useState<ApprovedWordingEditState | null>(null);
  const [processingApprovedSubmissionId, setProcessingApprovedSubmissionId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [wordingEdits, setWordingEdits] = useState<PublicWordingEditorState>(
    createEmptyWordingEdits,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.replace(
        buildLoginRedirectUrl(router.asPath, "/admin/review-submissions"),
      );
      return;
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "ADMIN"
    ) {
      void router.replace("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as any)?.role === "ADMIN"
    ) {
      void loadAdminData();
    }
  }, [status, session]);

  const loadAdminData = async (): Promise<{
    submitted: Experience[];
    approved: Experience[];
    live: LiveDestinationRow[];
  }> => {
    const fallback = {
      submitted: [] as Experience[],
      approved: [] as Experience[],
      live: [] as LiveDestinationRow[],
    };

    try {
      setLoading(true);
      const [submittedResponse, approvedResponse, liveResponse] =
        await Promise.all([
          fetch("/api/admin/erasmus-experiences?status=SUBMITTED"),
          fetch("/api/admin/erasmus-experiences?status=APPROVED"),
          fetch("/api/admin/destinations/live"),
        ]);

      if (!submittedResponse.ok || !approvedResponse.ok || !liveResponse.ok) {
        setError("Failed to load submissions");
        return fallback;
      }

      const [nextSubmittedSubmissions, nextApprovedSubmissions, nextLiveRows] =
        (await Promise.all([
          submittedResponse.json(),
          approvedResponse.json(),
          liveResponse.json(),
        ])) as [Experience[], Experience[], LiveDestinationRow[]];

      const sortedLiveRows = [...nextLiveRows].sort((left, right) => {
        if (right.submissionCount !== left.submissionCount) {
          return right.submissionCount - left.submissionCount;
        }

        return (
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime()
        );
      });

      setSubmissions(nextSubmittedSubmissions);
      setApprovedSubmissions(nextApprovedSubmissions);
      setLiveDestinations(sortedLiveRows);
      setError(null);

      return {
        submitted: nextSubmittedSubmissions,
        approved: nextApprovedSubmissions,
        live: sortedLiveRows,
      };
    } catch (fetchError) {
      console.error("Error fetching admin review data:", fetchError);
      setError("Failed to load submissions");
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action: ReviewActionType) => {
    if (!selectedSubmission) {
      return;
    }

    if (
      (action === REVIEW_ACTION.REJECTED ||
        action === REVIEW_ACTION.REQUEST_CHANGES) &&
      !feedback.trim()
    ) {
      setError("Feedback is required for rejection or change requests");
      return;
    }

    try {
      setReviewing(true);
      setError(null);
      setWarning(null);

      const response = await fetch(
        `/api/admin/erasmus-experiences/${selectedSubmission.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            feedback,
            wordingEdits: buildWordingEditsPayload(wordingEdits),
          }),
        },
      );

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error || "Failed to review submission");
        return;
      }

      const result = await response.json();
      const { submitted: nextSubmissions } = await loadAdminData();

      if (
        result.notification &&
        result.notification.status &&
        result.notification.status !== "sent"
      ) {
        setWarning(result.message);
        setSuccess(null);
      } else {
        setSuccess(result.message);
        setWarning(null);
      }

      if (action === REVIEW_ACTION.WORDING_EDITED) {
        const refreshedSelection =
          nextSubmissions.find(
            (submission) => submission.id === selectedSubmission.id,
          ) || null;
        setSelectedSubmission(refreshedSelection);
        if (refreshedSelection) {
          setWordingEdits(getPublicWordingEditorState(refreshedSelection));
          setFeedback(refreshedSelection.reviewFeedback || feedback);
        }
      } else {
        setFeedback("");
        setWordingEdits(createEmptyWordingEdits());
        setSelectedSubmission(null);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (reviewError) {
      console.error("Error reviewing submission:", reviewError);
      setError("Failed to review submission");
    } finally {
      setReviewing(false);
    }
  };

  const applyFeedbackPreset = (presetText: string) => {
    setFeedback((current) => {
      const trimmed = current.trim();
      if (!trimmed) {
        return presetText;
      }
      if (trimmed.includes(presetText)) {
        return trimmed;
      }
      return `${trimmed}\n\n${presetText}`;
    });
  };

  const updateNarrativeWordingField = (
    field: NarrativeWordingField,
    value: string,
  ) => {
    setWordingEdits((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const beginApprovedWordingEdit = (submission: Experience) => {
    setEditingApprovedSubmissionId(submission.id);
    setApprovedWordingEdits(buildApprovedWordingEditState(submission));
    setError(null);
    setWarning(null);
    setSuccess(null);
  };

  const cancelApprovedWordingEdit = () => {
    setEditingApprovedSubmissionId(null);
    setApprovedWordingEdits(null);
  };

  const handleApprovedCourseNoteChange = (courseId: string, value: string) => {
    setApprovedWordingEdits((current) =>
      current
        ? {
            ...current,
            courseNotes: {
              ...current.courseNotes,
              [courseId]: value,
            },
          }
        : current,
    );
  };

  const handleSaveApprovedWordingOverrides = async (submission: Experience) => {
    if (!approvedWordingEdits) {
      return;
    }

    try {
      setProcessingApprovedSubmissionId(submission.id);
      setError(null);
      setWarning(null);

      const response = await fetch(
        `/api/admin/erasmus-experiences/${submission.id}/wording-override`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            overrides: {
              experienceSummary: approvedWordingEdits.experienceSummary,
              accommodationComment: approvedWordingEdits.accommodationComment,
              courseNotes: approvedWordingEdits.courseNotes,
            },
          }),
        },
      );

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error || "Failed to save approved wording overrides");
        return;
      }

      const result = await response.json();
      await loadAdminData();
      setSuccess(
        result.message || "Approved submission wording overrides saved.",
      );
      cancelApprovedWordingEdit();
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      console.error("Error saving approved wording overrides:", saveError);
      setError("Failed to save approved wording overrides");
    } finally {
      setProcessingApprovedSubmissionId(null);
    }
  };

  const handleUnpublishApprovedSubmission = async (submission: Experience) => {
    try {
      setProcessingApprovedSubmissionId(submission.id);
      setError(null);
      setWarning(null);

      const response = await fetch(
        `/api/admin/erasmus-experiences/${submission.id}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UNPUBLISH",
          }),
        },
      );

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error || "Failed to unpublish submission");
        return;
      }

      const result = await response.json();
      await loadAdminData();
      setSuccess(
        result.message ||
          "Submission unpublished and returned to moderation queue.",
      );

      if (editingApprovedSubmissionId === submission.id) {
        cancelApprovedWordingEdit();
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (unpublishError) {
      console.error("Error unpublishing approved submission:", unpublishError);
      setError("Failed to unpublish submission");
    } finally {
      setProcessingApprovedSubmissionId(null);
    }
  };

  const queueCounts = useMemo(
    () =>
      submissions.reduce(
        (counts, submission) => {
          const category = getSubmissionQueueCategory(submission);
          counts.all += 1;
          counts[category] += 1;
          return counts;
        },
        { all: 0, ready: 0, blocked: 0, needs_revision: 0 },
      ),
    [submissions],
  );

  const filteredSubmissions = useMemo(() => {
    const filtered =
      queueFilter === "all"
        ? submissions
        : submissions.filter(
            (submission) =>
              getSubmissionQueueCategory(submission) === queueFilter,
          );

    return sortSubmissions(filtered, sortOrder);
  }, [queueFilter, sortOrder, submissions]);

  const selectedReadiness = useMemo(
    () =>
      selectedSubmission ? getApprovalReadiness(selectedSubmission) : null,
    [selectedSubmission],
  );
  const selectedSummary = useMemo(
    () =>
      selectedSubmission
        ? getSubmissionModerationSummary(selectedSubmission)
        : null,
    [selectedSubmission],
  );
  const selectedRevision = useMemo(
    () =>
      selectedSubmission
        ? getRevisionStatusMeta(selectedSubmission.revisionCount)
        : null,
    [selectedSubmission],
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-slate-900" />
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Review Submissions - Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 pt-20">
          <div className="mb-6">
            <Link href="/admin/unified-dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <section className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Review Submissions
            </h1>
            <p className="max-w-3xl text-gray-600">
              Review publishability, adjust public wording without changing the
              student source, and decide whether to approve, request changes, or
              reject.
            </p>
          </section>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          ) : null}

          {warning ? (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-900">
                {warning}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="mb-5 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={activeView === "moderation" ? "default" : "outline"}
              onClick={() => setActiveView("moderation")}
            >
              Moderation Queue
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                activeView === "live_destinations" ? "default" : "outline"
              }
              onClick={() => {
                setActiveView("live_destinations");
                setSelectedSubmission(null);
                setFeedback("");
                setWordingEdits(createEmptyWordingEdits());
                cancelApprovedWordingEdit();
              }}
            >
              Live Destinations
            </Button>
          </div>

          {activeView === "moderation" ? (
            selectedSubmission ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <CardTitle>Moderation review</CardTitle>
                      <p className="text-sm text-gray-600">
                        Is this publishable, what does it add, what is missing,
                        and what should happen next?
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(null);
                        setFeedback("");
                        setWordingEdits(createEmptyWordingEdits());
                        setError(null);
                        setWarning(null);
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to queue
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                      <Card className="border border-gray-200 shadow-none">
                        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <User className="h-4 w-4" />
                              Student
                            </div>
                            <p className="mt-1 font-medium text-gray-900">
                              {selectedSubmission.user?.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedSubmission.user?.email || "No email"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              Submitted
                            </div>
                            <p className="mt-1 font-medium text-gray-900">
                              {formatSubmissionTimestamp(
                                selectedSubmission.submittedAt,
                              )}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              Destination identity
                            </div>
                            <p className="mt-1 font-medium text-gray-900">
                              {selectedSummary?.destinationIdentity}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              Revision status
                            </div>
                            {selectedRevision ? (
                              <Badge variant={selectedRevision.variant}>
                                {selectedRevision.label}
                              </Badge>
                            ) : null}
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">
                              Public sections
                            </div>
                            <p className="mt-1 font-medium text-gray-900">
                              {selectedSummary?.publishableSections.length
                                ? selectedSummary.publishableSections.join(", ")
                                : "None yet"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 shadow-none">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Approval readiness
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedReadiness ? (
                            <>
                              <Badge variant={selectedReadiness.variant}>
                                {selectedReadiness.label}
                              </Badge>
                              <p className="text-sm text-gray-600">
                                {selectedReadiness.description}
                              </p>
                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                                <p className="font-medium text-gray-900">
                                  Missing fields
                                </p>
                                <p className="mt-2 text-gray-600">
                                  {selectedReadiness.missingFields.length
                                    ? selectedReadiness.missingFields.join(", ")
                                    : "None"}
                                </p>
                              </div>
                            </>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Public impact preview
                      </h2>
                      {selectedSubmission.publicImpactPreviewUnavailableReason ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {
                              selectedSubmission
                                .publicImpactPreviewUnavailableReason.message
                            }
                          </AlertDescription>
                        </Alert>
                      ) : selectedSubmission.publicImpactPreview ? (
                        <PublicImpactPreview
                          preview={selectedSubmission.publicImpactPreview}
                        />
                      ) : (
                        <Card>
                          <CardContent className="py-6 text-sm text-gray-600">
                            Public impact preview unavailable for this
                            submission.
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Courses", selectedSummary?.courseSummary],
                        [
                          "Accommodation",
                          selectedSummary?.accommodationSummary,
                        ],
                        ["Living costs", selectedSummary?.budgetSummary],
                        ["Tips", selectedSummary?.tipsSummary],
                      ].map(([label, value]) => (
                        <Card
                          key={label}
                          className="border border-gray-200 shadow-none"
                        >
                          <CardContent className="space-y-2 p-4">
                            <p className="text-sm font-medium text-gray-900">
                              {label}
                            </p>
                            <p className="text-sm text-gray-600">{value}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="border border-gray-200 shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Public wording edits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                          These overrides affect only public phrasing. Student
                          source data stays unchanged, and every save is logged
                          in the moderation audit trail.
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                          {PUBLIC_WORDING_FIELDS.map((fieldConfig) => (
                            <div key={fieldConfig.field} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-900">
                                {fieldConfig.label}
                              </label>
                              <Textarea
                                value={wordingEdits[fieldConfig.field]}
                                onChange={(event) =>
                                  updateNarrativeWordingField(
                                    fieldConfig.field,
                                    event.target.value,
                                  )
                                }
                                placeholder={fieldConfig.placeholder}
                                rows={4}
                                className="w-full"
                              />
                            </div>
                          ))}
                        </div>

                        {wordingEdits.courseNotes.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-900">
                              Course note wording
                            </p>
                            <div className="space-y-4">
                              {wordingEdits.courseNotes.map((courseNote) => (
                                <div key={courseNote.id} className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    {courseNote.label}
                                  </label>
                                  <Textarea
                                    value={courseNote.value}
                                    onChange={(event) =>
                                      setWordingEdits((current) => ({
                                        ...current,
                                        courseNotes: current.courseNotes.map(
                                          (item) =>
                                            item.id === courseNote.id
                                              ? {
                                                  ...item,
                                                  value: event.target.value,
                                                }
                                              : item,
                                        ),
                                      }))
                                    }
                                    placeholder="Optional public-facing course note."
                                    rows={3}
                                    className="w-full"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              handleReview(REVIEW_ACTION.WORDING_EDITED)
                            }
                            disabled={reviewing}
                          >
                            Save wording edits
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Review decision
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-900">
                            Quick feedback presets
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {FEEDBACK_PRESETS.map((preset) => (
                              <Button
                                key={preset.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => applyFeedbackPreset(preset.text)}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Reviewer feedback
                          </label>
                          <Textarea
                            value={feedback}
                            onChange={(event) =>
                              setFeedback(event.target.value)
                            }
                            placeholder="Add concise moderation notes or requested-change guidance."
                            rows={5}
                            className="w-full"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => handleReview(REVIEW_ACTION.APPROVED)}
                            disabled={
                              reviewing ||
                              selectedReadiness?.status === "blocked"
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          {selectedSubmission.revisionCount < 1 ? (
                            <Button
                              onClick={() =>
                                handleReview(REVIEW_ACTION.REQUEST_CHANGES)
                              }
                              disabled={reviewing}
                              variant="outline"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Request changes
                            </Button>
                          ) : null}
                          <Button
                            onClick={() => handleReview(REVIEW_ACTION.REJECTED)}
                            disabled={reviewing}
                            variant="destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    ["Pending", queueCounts.all],
                    ["Ready", queueCounts.ready],
                    ["Blocked", queueCounts.blocked],
                    ["Changes requested", queueCounts.needs_revision],
                  ].map(([label, value]) => (
                    <Card
                      key={label}
                      className="border border-gray-200 shadow-none"
                    >
                      <CardContent className="space-y-1 p-4">
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {value}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          "all",
                          "ready",
                          "blocked",
                          "needs_revision",
                        ] as QueueFilter[]
                      ).map((filter) => (
                        <Button
                          key={filter}
                          type="button"
                          size="sm"
                          variant={
                            queueFilter === filter ? "default" : "outline"
                          }
                          onClick={() => setQueueFilter(filter)}
                        >
                          {getFilterLabel(filter)}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={sortOrder === "newest" ? "default" : "outline"}
                        onClick={() => setSortOrder("newest")}
                      >
                        Newest first
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={sortOrder === "oldest" ? "default" : "outline"}
                        onClick={() => setSortOrder("oldest")}
                      >
                        Oldest first
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {filteredSubmissions.map((submission) => {
                  const readiness = getApprovalReadiness(submission);
                  const revision = getRevisionStatusMeta(
                    submission.revisionCount,
                  );
                  const summary = getSubmissionModerationSummary(submission);

                  return (
                    <Card
                      key={submission.id}
                      className="border border-gray-200"
                    >
                      <CardContent className="space-y-4 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-semibold text-gray-900">
                                {submission.user?.name || "Anonymous"}
                              </h2>
                              <Badge variant={revision.variant}>
                                {revision.label}
                              </Badge>
                              <Badge variant={readiness.variant}>
                                {readiness.label}
                              </Badge>
                            </div>
                            <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {summary.destinationIdentity}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatSubmissionTimestamp(
                                  submission.submittedAt,
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {submission.user?.email || "No email"}
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setFeedback(submission.reviewFeedback || "");
                              setWordingEdits(
                                getPublicWordingEditorState(submission),
                              );
                              setError(null);
                              setWarning(null);
                            }}
                          >
                            Review
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-5">
                          {[
                            [
                              "Public sections",
                              summary.publishableSections.join(", ") ||
                                "None yet",
                            ],
                            ["Courses", summary.courseSummary],
                            ["Accommodation", summary.accommodationSummary],
                            ["Living costs", summary.budgetSummary],
                            ["Tips", summary.tipsSummary],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                            >
                              <p className="font-medium text-gray-900">
                                {label}
                              </p>
                              <p className="mt-1 text-gray-600">{value}</p>
                            </div>
                          ))}
                        </div>

                        {readiness.missingFields.length > 0 ? (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            Missing fields: {readiness.missingFields.join(", ")}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}

                <Card>
                  <CardHeader>
                    <CardTitle>Approved Submissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {approvedSubmissions.length === 0 ? (
                      <p className="text-sm text-gray-600">
                        No approved submissions available.
                      </p>
                    ) : (
                      approvedSubmissions.map((submission) => {
                        const isEditing =
                          editingApprovedSubmissionId === submission.id &&
                          approvedWordingEdits !== null;
                        const isProcessingCurrent =
                          processingApprovedSubmissionId === submission.id;
                        const originalCourseNotes =
                          getCourseNoteRows(submission);

                        return (
                          <Card
                            key={submission.id}
                            className="border border-gray-200 shadow-none"
                          >
                            <CardContent className="space-y-4 p-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-base font-semibold text-gray-900">
                                      {submission.user?.name || "Anonymous"}
                                    </p>
                                    <Badge variant="default">Approved</Badge>
                                  </div>
                                  <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {submission.hostCity &&
                                      submission.hostCountry
                                        ? `${submission.hostCity}, ${submission.hostCountry}`
                                        : "No destination"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      {formatSubmissionTimestamp(
                                        submission.submittedAt,
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      {submission.user?.email || "No email"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      beginApprovedWordingEdit(submission)
                                    }
                                    disabled={isProcessingCurrent}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit wording
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      handleUnpublishApprovedSubmission(
                                        submission,
                                      )
                                    }
                                    disabled={isProcessingCurrent}
                                  >
                                    <Undo2 className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </Button>
                                </div>
                              </div>

                              {isEditing ? (
                                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      Experience summary
                                    </p>
                                    <p className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700">
                                      {getOriginalExperienceSummary(
                                        submission,
                                      ) || "No student summary available."}
                                    </p>
                                    <Textarea
                                      value={
                                        approvedWordingEdits.experienceSummary
                                      }
                                      onChange={(event) =>
                                        setApprovedWordingEdits((current) =>
                                          current
                                            ? {
                                                ...current,
                                                experienceSummary:
                                                  event.target.value,
                                              }
                                            : current,
                                        )
                                      }
                                      placeholder="Override public experience summary"
                                      rows={3}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      Accommodation comment
                                    </p>
                                    <p className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700">
                                      {getOriginalAccommodationComment(
                                        submission,
                                      ) ||
                                        "No student accommodation comment available."}
                                    </p>
                                    <Textarea
                                      value={
                                        approvedWordingEdits.accommodationComment
                                      }
                                      onChange={(event) =>
                                        setApprovedWordingEdits((current) =>
                                          current
                                            ? {
                                                ...current,
                                                accommodationComment:
                                                  event.target.value,
                                              }
                                            : current,
                                        )
                                      }
                                      placeholder="Override public accommodation comment"
                                      rows={3}
                                    />
                                  </div>

                                  <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-900">
                                      Course notes
                                    </p>
                                    {originalCourseNotes.length === 0 ? (
                                      <p className="text-sm text-gray-600">
                                        No course notes available for this
                                        submission.
                                      </p>
                                    ) : (
                                      originalCourseNotes.map((courseNote) => (
                                        <div
                                          key={courseNote.id}
                                          className="space-y-2"
                                        >
                                          <p className="text-sm font-medium text-gray-700">
                                            {courseNote.label}
                                          </p>
                                          <p className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700">
                                            {courseNote.originalValue ||
                                              "No student course note provided."}
                                          </p>
                                          <Textarea
                                            value={
                                              approvedWordingEdits.courseNotes[
                                                courseNote.id
                                              ] || ""
                                            }
                                            onChange={(event) =>
                                              handleApprovedCourseNoteChange(
                                                courseNote.id,
                                                event.target.value,
                                              )
                                            }
                                            placeholder="Override public course note"
                                            rows={3}
                                          />
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        handleSaveApprovedWordingOverrides(
                                          submission,
                                        )
                                      }
                                      disabled={isProcessingCurrent}
                                    >
                                      Save wording
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={cancelApprovedWordingEdit}
                                      disabled={isProcessingCurrent}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : null}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Live Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                {liveDestinations.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No live destination rows are currently available.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4 font-medium">City</th>
                          <th className="py-2 pr-4 font-medium">Country</th>
                          <th className="py-2 pr-4 font-medium">
                            Submission count
                          </th>
                          <th className="py-2 pr-4 font-medium">
                            Average rent
                          </th>
                          <th className="py-2 pr-4 font-medium">Updated</th>
                          <th className="py-2 pr-4 font-medium">Live</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-800">
                        {liveDestinations.map((destination) => (
                          <tr key={destination.slug}>
                            <td className="py-2 pr-4">{destination.city}</td>
                            <td className="py-2 pr-4">{destination.country}</td>
                            <td className="py-2 pr-4">
                              {destination.submissionCount}
                            </td>
                            <td className="py-2 pr-4">
                              {typeof destination.averageRent === "number"
                                ? `${destination.averageRent.toFixed(2)} EUR`
                                : "-"}
                            </td>
                            <td className="py-2 pr-4">
                              {formatSubmissionTimestamp(destination.updatedAt)}
                            </td>
                            <td className="py-2 pr-4">
                              <Link
                                href={buildPublicDestinationRoute({
                                  city: destination.city,
                                  country: destination.country,
                                })}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Globe className="h-4 w-4" />
                                View live
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}
