import { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../../../components/Header";
import { withAdminAuth } from "../../../lib/auth/adminGuard";
import { prisma } from "../../../lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import { Badge } from "../../../src/components/ui/badge";
import { Button } from "../../../src/components/ui/button";
import { Textarea } from "../../../src/components/ui/textarea";
import { Input } from "../../../src/components/ui/input";
import { Label } from "../../../src/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../src/components/ui/alert-dialog";
import {
  ArrowLeft,
  Check,
  X,
  Edit,
  MapPin,
  Calendar,
  User,
  Building,
  DollarSign,
  Star,
  Home,
  BookOpen,
} from "lucide-react";
import { formatPrice } from "../../../lib/validations/submission";

interface Submission {
  id: string;
  submissionType: string;
  status: string;
  data: any;
  title: string | null;
  hostCity: string | null;
  hostCountry: string | null;
  hostUniversity: string | null;
  semester: string | null;
  academicYear: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason: string | null;
  adminNotes: string | null;
  qualityScore: number | null;
  isFeatured: boolean;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

interface Props {
  submission: Submission;
  session: any;
}

export default function AdminReviewPage({ submission, session }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState(submission.adminNotes || "");
  const [qualityScore, setQualityScore] = useState(
    submission.qualityScore?.toString() || "3",
  );
  const [isFeatured, setIsFeatured] = useState(submission.isFeatured);
  const [rejectionReason, setRejectionReason] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/submissions/${submission.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminNotes,
            qualityScore: parseInt(qualityScore),
            isFeatured,
          }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to approve");
      }

      alert("✅ Submission approved successfully!");
      router.push("/admin/unified-dashboard");
    } catch (error) {
      console.error("Approval error:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/submissions/${submission.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rejectionReason,
            adminNotes,
          }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reject");
      }

      alert("❌ Submission rejected");
      router.push("/admin/unified-dashboard");
    } catch (error) {
      console.error("Rejection error:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRevise = async () => {
    if (!revisionNotes.trim()) {
      alert("Please provide revision notes");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/submissions/${submission.id}/revise`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revisionNotes,
            adminNotes,
          }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to request revision");
      }

      alert("📝 Revision requested");
      router.push("/admin/unified-dashboard");
    } catch (error) {
      console.error("Revision error:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      DRAFT: { className: "bg-gray-100 text-gray-800", label: "Draft" },
      PENDING: {
        className: "bg-yellow-100 text-yellow-800",
        label: "Pending Review",
      },
      APPROVED: { className: "bg-green-100 text-green-800", label: "Approved" },
      REJECTED: { className: "bg-red-100 text-red-800", label: "Rejected" },
      REVISION_NEEDED: {
        className: "bg-blue-100 text-blue-800",
        label: "Needs Revision",
      },
      ARCHIVED: { className: "bg-gray-200 text-gray-600", label: "Archived" },
    };

    const { className, label } = config[status] || config.PENDING;
    return <Badge className={className}>{label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_EXPERIENCE: "Full Experience",
      ACCOMMODATION: "Accommodation",
      COURSE_EXCHANGE: "Course Exchange",
      QUICK_TIP: "Quick Tip",
      DESTINATION_INFO: "Destination Info",
    };
    return labels[type] || type;
  };

  const renderSubmissionData = () => {
    const data = submission.data;

    if (submission.submissionType === "ACCOMMODATION") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Type</Label>
              <p className="font-medium">
                {data.accommodationType || data.type || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Name</Label>
              <p className="font-medium">
                {data.name || data.accommodationName || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Monthly Rent</Label>
              <p className="font-medium">
                {data.monthlyRentCents
                  ? formatPrice(data.monthlyRentCents)
                  : data.monthlyRent
                    ? `€${data.monthlyRent}`
                    : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Currency</Label>
              <p className="font-medium">{data.currency || "EUR"}</p>
            </div>
          </div>

          {data.neighborhood && (
            <div>
              <Label className="text-gray-600">Neighborhood</Label>
              <p>{data.neighborhood}</p>
            </div>
          )}

          {data.description && (
            <div>
              <Label className="text-gray-600">Description</Label>
              <p className="text-gray-700">{data.description}</p>
            </div>
          )}

          {data.pros && data.pros.length > 0 && (
            <div>
              <Label className="text-gray-600">Pros</Label>
              <ul className="list-disc list-inside space-y-1">
                {data.pros.map((pro: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.cons && data.cons.length > 0 && (
            <div>
              <Label className="text-gray-600">Cons</Label>
              <ul className="list-disc list-inside space-y-1">
                {data.cons.map((con: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (submission.submissionType === "COURSE_EXCHANGE") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Home Course</Label>
              <p className="font-medium">{data.homeCourse || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600">Host Course</Label>
              <p className="font-medium">{data.hostCourse || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600">ECTS Credits</Label>
              <p className="font-medium">
                {data.ects || data.credits || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Course Quality</Label>
              <p className="font-medium">
                {data.courseQuality || data.rating
                  ? `${data.courseQuality || data.rating}/5 ⭐`
                  : "N/A"}
              </p>
            </div>
          </div>

          {data.description && (
            <div>
              <Label className="text-gray-600">Description / Review</Label>
              <p className="text-gray-700">{data.description}</p>
            </div>
          )}
        </div>
      );
    }

    if (submission.submissionType === "FULL_EXPERIENCE") {
      return (
        <div className="space-y-6">
          {/* Basic Info */}
          {data.basicInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-medium">Study Level:</span>{" "}
                  {data.basicInfo.studyLevel || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Field of Study:</span>{" "}
                  {data.basicInfo.fieldOfStudy || "N/A"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Accommodation */}
          {data.accommodation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Accommodation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {data.accommodation.type || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Monthly Rent:</span>{" "}
                    {data.accommodation.monthlyRentCents
                      ? formatPrice(data.accommodation.monthlyRentCents)
                      : data.accommodation.monthlyRent
                        ? `€${data.accommodation.monthlyRent}`
                        : "N/A"}
                  </p>
                  {data.accommodation.description && (
                    <p className="text-gray-700">
                      {data.accommodation.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses */}
          {data.courses && data.courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Courses ({data.courses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.courses.map((course: any, i: number) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4">
                      <p className="font-medium">
                        {course.hostCourse || course.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {course.homeCourse && `Maps to: ${course.homeCourse}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {course.ects || course.credits} ECTS •{" "}
                        {course.rating || course.quality
                          ? `${course.rating || course.quality}/5 ⭐`
                          : "No rating"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Fallback: Show raw JSON
    return (
      <div>
        <Label className="text-gray-600">Submission Data</Label>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Review Submission - Admin | Erasmus Journey</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Link href="/admin/unified-dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Review Submission
            </h1>
            <p className="text-gray-600 mt-1">
              {getTypeLabel(submission.submissionType)} • Submitted{" "}
              {submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          {getStatusBadge(submission.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {submission.author.firstName} {submission.author.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {submission.author.email}
                </p>
              </CardContent>
            </Card>

            {/* Location Info */}
            {(submission.hostCity ||
              submission.hostCountry ||
              submission.hostUniversity) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {submission.hostCity && (
                    <p>
                      <span className="font-medium">City:</span>{" "}
                      {submission.hostCity}
                    </p>
                  )}
                  {submission.hostCountry && (
                    <p>
                      <span className="font-medium">Country:</span>{" "}
                      {submission.hostCountry}
                    </p>
                  )}
                  {submission.hostUniversity && (
                    <p>
                      <span className="font-medium">University:</span>{" "}
                      {submission.hostUniversity}
                    </p>
                  )}
                  {submission.semester && (
                    <p>
                      <span className="font-medium">Semester:</span>{" "}
                      {submission.semester}
                    </p>
                  )}
                  {submission.academicYear && (
                    <p>
                      <span className="font-medium">Academic Year:</span>{" "}
                      {submission.academicYear}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submission Content */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Content</CardTitle>
                <CardDescription>
                  Preview how this will appear publicly
                </CardDescription>
              </CardHeader>
              <CardContent>{renderSubmissionData()}</CardContent>
            </Card>

            {/* Existing Notes */}
            {(submission.rejectionReason || submission.adminNotes) && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-900">
                    Previous Review Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {submission.rejectionReason && (
                    <div>
                      <Label className="text-yellow-900">
                        Rejection Reason:
                      </Label>
                      <p className="text-yellow-800">
                        {submission.rejectionReason}
                      </p>
                    </div>
                  )}
                  {submission.adminNotes && (
                    <div>
                      <Label className="text-yellow-900">Admin Notes:</Label>
                      <p className="text-yellow-800">{submission.adminNotes}</p>
                    </div>
                  )}
                  {submission.reviewer && (
                    <p className="text-xs text-yellow-700">
                      Reviewed by: {submission.reviewer.firstName}{" "}
                      {submission.reviewer.lastName}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-4">
            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Notes</CardTitle>
                <CardDescription>
                  Internal notes (not visible to student)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add internal notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Quality Score */}
            {submission.status === "PENDING" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Quality Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Score (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={qualityScore}
                      onChange={(e) => setQualityScore(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Feature this submission
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {submission.status === "PENDING" && (
              <div className="space-y-3">
                {/* Approve */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve & Publish
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Approve this submission?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will make the submission publicly visible on the
                        website. Denormalized views will be created
                        automatically.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Request Revision */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Request Revision
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Request Revision</AlertDialogTitle>
                      <AlertDialogDescription>
                        The student will be notified and can resubmit after
                        making changes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label>Revision Notes (visible to student)</Label>
                      <Textarea
                        placeholder="Please explain what needs to be changed..."
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRevise}>
                        Request Revision
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Reject */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Reject this submission?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        The submission will be marked as rejected and will not
                        be published.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label>Rejection Reason (visible to student)</Label>
                      <Textarea
                        placeholder="Please explain why this is being rejected..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReject}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Already Processed */}
            {submission.status !== "PENDING" && (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">
                    This submission has already been{" "}
                    {submission.status.toLowerCase()}.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = withAdminAuth(
  async (context, session) => {
    const { id } = context.params as { id: string };

    try {
      const submission = await prisma.student_submissions.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!submission) {
        return {
          notFound: true,
        };
      }

      return {
        props: {
          submission: JSON.parse(JSON.stringify(submission)),
        },
      };
    } catch (error) {
      console.error("Error fetching submission:", error);
      return {
        notFound: true,
      };
    }
  },
);
