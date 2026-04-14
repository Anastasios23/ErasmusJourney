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
  MapPin,
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
import {
  getPublicWordingEditorState,
  type PublicWordingEditorState,
} from "../../src/lib/experienceModeration";
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
type NarrativeWordingField = Exclude<
  keyof PublicWordingEditorState,
  "courseNotes"
>;

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

export default function ReviewSubmissions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Experience[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Experience | null>(null);
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
      void fetchSubmissions();
    }
  }, [status, session]);

  const fetchSubmissions = async (): Promise<Experience[]> => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/admin/erasmus-experiences?status=SUBMITTED",
      );

      if (!response.ok) {
        setError("Failed to load submissions");
        return [];
      }

      const nextSubmissions = (await response.json()) as Experience[];
      setSubmissions(nextSubmissions);
      return nextSubmissions;
    } catch (fetchError) {
      console.error("Error fetching submissions:", fetchError);
      setError("Failed to load submissions");
      return [];
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
      const nextSubmissions = await fetchSubmissions();

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

          {selectedSubmission ? (
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
                          Public impact preview unavailable for this submission.
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Courses", selectedSummary?.courseSummary],
                      ["Accommodation", selectedSummary?.accommodationSummary],
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
                        source data stays unchanged, and every save is logged in
                        the moderation audit trail.
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
                          onChange={(event) => setFeedback(event.target.value)}
                          placeholder="Add concise moderation notes or requested-change guidance."
                          rows={5}
                          className="w-full"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => handleReview(REVIEW_ACTION.APPROVED)}
                          disabled={
                            reviewing || selectedReadiness?.status === "blocked"
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
                        variant={queueFilter === filter ? "default" : "outline"}
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
                  <Card key={submission.id} className="border border-gray-200">
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
                            <p className="font-medium text-gray-900">{label}</p>
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
            </div>
          )}
        </main>
      </div>
    </>
  );
}
