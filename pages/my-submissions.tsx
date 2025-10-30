import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  FileText,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Trash2,
  AlertCircle,
  TrendingUp,
  Home,
  BookOpen,
  MapPin,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Plus,
} from "lucide-react";

interface Submission {
  id: string;
  submissionType: string;
  status: string;
  title: string | null;
  hostCity: string | null;
  hostCountry: string | null;
  hostUniversity: string | null;
  semester: string | null;
  academicYear: string | null;
  reviewFeedback: string | null;
  reviewedBy: { id: string; name: string } | null;
  reviewedAt: Date | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isFeatured: boolean;
  qualityScore: number | null;
  revisionCount: number;
  isComplete: boolean;
}

interface SubmissionStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recentCount: number;
  avgResponseTime: number | null;
}

export default function MySubmissions() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch submissions
  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchSubmissions();
    }
  }, [authStatus]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from erasmus_experiences API
      const response = await fetch(`/api/erasmus-experiences`);

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();

      // Transform to match the Submission interface
      const transformedSubmissions = data.map((exp: any) => ({
        id: exp.id,
        submissionType: "FULL_EXPERIENCE",
        status: exp.status || "DRAFT",
        title:
          exp.basicInfo?.firstName && exp.basicInfo?.lastName
            ? `${exp.basicInfo.firstName} ${exp.basicInfo.lastName}'s Experience`
            : null,
        hostCity: exp.hostCity,
        hostCountry: exp.hostCountry,
        hostUniversity: exp.basicInfo?.hostUniversity,
        semester: exp.semester,
        academicYear: exp.semester?.split("-")[0],
        reviewFeedback: exp.reviewFeedback,
        reviewedBy: exp.reviewedBy
          ? { id: exp.reviewedBy, name: "Admin" }
          : null,
        reviewedAt: exp.reviewedAt,
        submittedAt: exp.submittedAt,
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt || exp.lastSavedAt,
        isPublic: exp.status === "APPROVED",
        isFeatured: false,
        qualityScore: null,
        revisionCount: exp.revisionCount || 0,
        isComplete: exp.isComplete,
      }));

      setSubmissions(transformedSubmissions);
      setTotal(transformedSubmissions.length);
      setTotalPages(1); // Single page for now

      // Calculate stats
      if (transformedSubmissions.length > 0) {
        const byStatus = transformedSubmissions.reduce((acc: any, sub: any) => {
          acc[sub.status] = (acc[sub.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: transformedSubmissions.length,
          byStatus,
          byType: { FULL_EXPERIENCE: transformedSubmissions.length },
          recentCount: transformedSubmissions.length,
          avgResponseTime: null,
        });
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load submissions",
      );
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      DRAFT: {
        label: "Draft",
        className: "bg-gray-100 text-gray-700",
        icon: Edit,
      },
      IN_PROGRESS: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-700",
        icon: Edit,
      },
      SUBMITTED: {
        label: "Under Review",
        className: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      },
      PENDING: {
        label: "Under Review",
        className: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      },
      REVISION_NEEDED: {
        label: "Revision Needed",
        className: "bg-orange-100 text-orange-700",
        icon: AlertCircle,
      },
      APPROVED: {
        label: "Approved",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      REJECTED: {
        label: "Rejected",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      },
      ARCHIVED: {
        label: "Archived",
        className: "bg-gray-100 text-gray-600",
        icon: Trash2,
      },
    };

    const { label, className, icon: Icon } = config[status] || config.DRAFT;

    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Get type icon and label
  const getTypeInfo = (type: string) => {
    const config: Record<string, { label: string; icon: any; color: string }> =
      {
        FULL_EXPERIENCE: {
          label: "Full Experience",
          icon: FileText,
          color: "text-blue-600",
        },
        ACCOMMODATION: {
          label: "Accommodation",
          icon: Home,
          color: "text-green-600",
        },
        COURSE_EXCHANGE: {
          label: "Course Exchange",
          icon: BookOpen,
          color: "text-purple-600",
        },
        QUICK_TIP: {
          label: "Quick Tip",
          icon: Lightbulb,
          color: "text-yellow-600",
        },
        DESTINATION_INFO: {
          label: "Destination Info",
          icon: MapPin,
          color: "text-red-600",
        },
      };

    return (
      config[type] || { label: type, icon: FileText, color: "text-gray-600" }
    );
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (loading && submissions.length === 0) {
    return (
      <>
        <Head>
          <title>My Submissions - Erasmus Journey</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Submissions - Erasmus Journey</title>
        <meta
          name="description"
          content="Track and manage your Erasmus submissions"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Submissions
                  </h1>
                  <p className="text-gray-600">
                    Track and manage all your Erasmus experience submissions
                  </p>
                </div>
                <Link href="/basic-information">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Submission
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Submissions
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.total}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.byStatus.APPROVED || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Under Review</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {(stats.byStatus.SUBMITTED || 0) +
                            (stats.byStatus.PENDING || 0)}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Avg Response Time
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.avgResponseTime
                            ? `${stats.avgResponseTime}d`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters and Search */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by title, city, university..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="SUBMITTED">Under Review</SelectItem>
                      <SelectItem value="REVISION_NEEDED">
                        Revision Needed
                      </SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Type Filter */}
                  <Select
                    value={typeFilter}
                    onValueChange={(value) => {
                      setTypeFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="FULL_EXPERIENCE">
                        Full Experience
                      </SelectItem>
                      <SelectItem value="ACCOMMODATION">
                        Accommodation
                      </SelectItem>
                      <SelectItem value="COURSE_EXCHANGE">
                        Course Exchange
                      </SelectItem>
                      <SelectItem value="QUICK_TIP">Quick Tip</SelectItem>
                      <SelectItem value="DESTINATION_INFO">
                        Destination Info
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchSubmissions}
                      className="ml-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submissions List */}
            {submissions.length === 0 && !loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No submissions found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ||
                    statusFilter !== "ALL" ||
                    typeFilter !== "ALL"
                      ? "Try adjusting your filters"
                      : "Start by creating your first submission"}
                  </p>
                  <Link href="/basic-information">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Submission
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const typeInfo = getTypeInfo(submission.submissionType);
                  const TypeIcon = typeInfo.icon;

                  return (
                    <Card
                      key={submission.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Type Icon */}
                            <div
                              className={`p-3 bg-gray-100 rounded-lg ${typeInfo.color}`}
                            >
                              <TypeIcon className="h-6 w-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(submission.status)}
                                <span className="text-xs text-gray-500">
                                  {typeInfo.label}
                                </span>
                                {submission.isFeatured && (
                                  <Badge className="bg-yellow-100 text-yellow-700">
                                    ⭐ Featured
                                  </Badge>
                                )}
                              </div>

                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {submission.title || "Untitled Submission"}
                              </h3>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                {submission.hostCity &&
                                  submission.hostCountry && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {submission.hostCity},{" "}
                                      {submission.hostCountry}
                                    </span>
                                  )}
                                {submission.hostUniversity && (
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {submission.hostUniversity}
                                  </span>
                                )}
                                {submission.semester &&
                                  submission.academicYear && (
                                    <span>
                                      {submission.semester}{" "}
                                      {submission.academicYear}
                                    </span>
                                  )}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  Updated {formatDate(submission.updatedAt)}
                                </span>
                                {submission.submittedAt && (
                                  <span>
                                    Submitted{" "}
                                    {formatDate(submission.submittedAt)}
                                  </span>
                                )}
                                {submission.qualityScore && (
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    Quality:{" "}
                                    {Math.round(submission.qualityScore * 100)}%
                                  </span>
                                )}
                              </div>

                              {/* Review Feedback */}
                              {submission.reviewFeedback && (
                                <div
                                  className={`mt-3 p-3 border rounded-lg ${
                                    submission.status === "REVISION_NEEDED"
                                      ? "bg-orange-50 border-orange-200"
                                      : submission.status === "REJECTED"
                                        ? "bg-red-50 border-red-200"
                                        : "bg-yellow-50 border-yellow-200"
                                  }`}
                                >
                                  <p
                                    className={`text-sm ${
                                      submission.status === "REVISION_NEEDED"
                                        ? "text-orange-800"
                                        : submission.status === "REJECTED"
                                          ? "text-red-800"
                                          : "text-yellow-800"
                                    }`}
                                  >
                                    <strong>Admin Feedback:</strong>{" "}
                                    {submission.reviewFeedback}
                                  </p>
                                  {submission.status === "REVISION_NEEDED" && (
                                    <div className="mt-2 text-xs text-orange-700">
                                      💡 Click "Make Revisions" to edit your
                                      submission and resubmit.
                                      {submission.revisionCount >= 1 && (
                                        <span className="block mt-1 font-semibold">
                                          ⚠️ This is your final revision - next
                                          submission will be approved or
                                          rejected.
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            {(submission.status === "DRAFT" ||
                              submission.status === "IN_PROGRESS" ||
                              submission.status === "REVISION_NEEDED") && (
                              <Link href="/basic-information">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {submission.status === "REVISION_NEEDED"
                                    ? "Make Revisions"
                                    : "Continue Editing"}
                                </Button>
                              </Link>
                            )}
                            {submission.status === "APPROVED" && (
                              <Link href={`/stories/${submission.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Published
                                </Button>
                              </Link>
                            )}
                            {submission.revisionCount > 0 && (
                              <Badge className="bg-orange-100 text-orange-700">
                                Revision {submission.revisionCount}/1
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({total} total)
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
