import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import { Textarea } from "../../src/components/ui/textarea";
import { Alert, AlertDescription } from "../../src/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  User,
  Calendar,
  MapPin,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Experience {
  id: string;
  userId: string;
  status: string;
  semester: string | null;
  hostCity: string | null;
  hostCountry: string | null;
  revisionCount: number;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewFeedback: string | null;
  basicInfo: any;
  courses: any;
  accommodation: any;
  livingExpenses: any;
  experience: any;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function ReviewSubmissions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Experience[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch pending submissions
  useEffect(() => {
    if (status === "authenticated") {
      fetchSubmissions();
    }
  }, [status]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/admin/erasmus-experiences?status=SUBMITTED",
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        setError("Failed to load submissions");
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    action: "APPROVED" | "REJECTED" | "REVISION_REQUESTED",
  ) => {
    if (!selectedSubmission) return;

    if (
      (action === "REJECTED" || action === "REVISION_REQUESTED") &&
      !feedback.trim()
    ) {
      setError("Feedback is required for rejection or revision requests");
      return;
    }

    try {
      setReviewing(true);
      setError(null);

      const response = await fetch(
        `/api/admin/erasmus-experiences/${selectedSubmission.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, feedback }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        setFeedback("");
        setSelectedSubmission(null);

        // Refresh submissions list
        await fetchSubmissions();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to review submission");
      }
    } catch (err) {
      console.error("Error reviewing submission:", err);
      setError("Failed to review submission");
    } finally {
      setReviewing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

        <main className="container mx-auto px-4 py-8 pt-20">
          <div className="mb-6">
            <Link href="/admin/unified-dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Review Submissions
            </h1>
            <p className="text-gray-600">
              Review and approve student Erasmus experience submissions
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {selectedSubmission ? (
            // Detail View
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Submission Details</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(null);
                        setFeedback("");
                        setError(null);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Student</div>
                        <div className="font-medium">
                          {selectedSubmission.user.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedSubmission.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Submitted</div>
                        <div className="font-medium">
                          {selectedSubmission.submittedAt
                            ? new Date(
                                selectedSubmission.submittedAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium">
                          {selectedSubmission.hostCity},{" "}
                          {selectedSubmission.hostCountry}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Semester</div>
                        <div className="font-medium">
                          {selectedSubmission.semester || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedSubmission.basicInfo &&
                        Object.entries(selectedSubmission.basicInfo).map(
                          ([key, value]) =>
                            value && (
                              <div key={key}>
                                <div className="text-gray-500 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </div>
                                <div className="font-medium">
                                  {String(value)}
                                </div>
                              </div>
                            ),
                        )}
                    </div>
                  </div>

                  {/* Courses */}
                  {selectedSubmission.courses &&
                    Array.isArray(selectedSubmission.courses) &&
                    selectedSubmission.courses.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Course Mappings
                        </h3>
                        <div className="space-y-3">
                          {selectedSubmission.courses.map(
                            (course: any, idx: number) => (
                              <div key={idx} className="p-3 border rounded-lg">
                                <div className="font-medium">
                                  {course.hostCourseName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {course.hostCourseCode} (
                                  {course.hostCourseCredits} ECTS)
                                </div>
                                <div className="text-sm mt-1">
                                  → {course.cyprusCourseName} (
                                  {course.cyprusCourseCredits} ECTS)
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Accommodation */}
                  {selectedSubmission.accommodation && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Accommodation
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Type</div>
                          <div className="font-medium">
                            {selectedSubmission.accommodation.accommodationType}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Monthly Rent</div>
                          <div className="font-medium">
                            €{selectedSubmission.accommodation.monthlyRent}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Neighborhood</div>
                          <div className="font-medium">
                            {selectedSubmission.accommodation.neighborhood}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Rating</div>
                          <div className="font-medium">
                            {
                              selectedSubmission.accommodation
                                .accommodationRating
                            }
                            /5
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Living Expenses */}
                  {selectedSubmission.livingExpenses?.expenses && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Living Expenses
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(
                          selectedSubmission.livingExpenses.expenses,
                        ).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-gray-500 capitalize">
                              {key}
                            </div>
                            <div className="font-medium">€{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Review Decision
                    </h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback{" "}
                        {selectedSubmission.revisionCount >= 1 &&
                          "(Optional for approval)"}
                      </label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter feedback for the student..."
                        rows={4}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReview("APPROVED")}
                        disabled={reviewing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>

                      {selectedSubmission.revisionCount < 1 && (
                        <Button
                          onClick={() => handleReview("REVISION_REQUESTED")}
                          disabled={reviewing}
                          variant="outline"
                          className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Request Revision
                        </Button>
                      )}

                      <Button
                        onClick={() => handleReview("REJECTED")}
                        disabled={reviewing}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>

                    {selectedSubmission.revisionCount >= 1 && (
                      <div className="mt-3 text-sm text-amber-600">
                        ⚠️ Maximum revision limit reached. Please approve or
                        reject.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No pending submissions to review
                    </p>
                  </CardContent>
                </Card>
              ) : (
                submissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {submission.user.name || "Anonymous"}
                            </h3>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {submission.revisionCount > 0
                                ? `Revision ${submission.revisionCount}`
                                : "New"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {submission.hostCity}, {submission.hostCountry}
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              {submission.semester || "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {submission.submittedAt
                                ? new Date(
                                    submission.submittedAt,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedSubmission(submission)}
                          variant="outline"
                        >
                          Review
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
