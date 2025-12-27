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
import { Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/ui/hero-section";

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
      { label: string; className: string; icon: string }
    > = {
      DRAFT: {
        label: "Draft",
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        icon: "solar:pen-new-square-linear",
      },
      IN_PROGRESS: {
        label: "In Progress",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        icon: "solar:pen-new-square-linear",
      },
      SUBMITTED: {
        label: "Under Review",
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        icon: "solar:clock-circle-linear",
      },
      PENDING: {
        label: "Under Review",
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        icon: "solar:clock-circle-linear",
      },
      REVISION_NEEDED: {
        label: "Revision Needed",
        className:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        icon: "solar:danger-triangle-linear",
      },
      APPROVED: {
        label: "Approved",
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        icon: "solar:check-circle-linear",
      },
      REJECTED: {
        label: "Rejected",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        icon: "solar:close-circle-linear",
      },
      ARCHIVED: {
        label: "Archived",
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        icon: "solar:archive-linear",
      },
    };

    const { label, className, icon } = config[status] || config.DRAFT;

    return (
      <Badge className={className}>
        <Icon icon={icon} className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Get type icon and label
  const getTypeInfo = (type: string) => {
    const config: Record<
      string,
      { label: string; icon: string; color: string }
    > = {
      FULL_EXPERIENCE: {
        label: "Full Experience",
        icon: "solar:document-text-linear",
        color: "text-blue-600",
      },
      ACCOMMODATION: {
        label: "Accommodation",
        icon: "solar:home-2-linear",
        color: "text-emerald-600",
      },
      COURSE_EXCHANGE: {
        label: "Course Exchange",
        icon: "solar:notebook-minimalistic-linear",
        color: "text-purple-600",
      },
      QUICK_TIP: {
        label: "Quick Tip",
        icon: "solar:lightbulb-linear",
        color: "text-amber-600",
      },
      DESTINATION_INFO: {
        label: "Destination Info",
        icon: "solar:map-point-linear",
        color: "text-red-600",
      },
    };

    return (
      config[type] || {
        label: type,
        icon: "solar:document-text-linear",
        color: "text-slate-600",
      }
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
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

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />

        <HeroSection
          title="My Submissions"
          subtitle="Track and manage all your Erasmus experience submissions"
          icon="solar:document-text-linear"
          theme="blue"
          size="sm"
        />

        <div className="relative -mt-8 pb-16 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <Link href="/basic-information">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
                  <Icon
                    icon="solar:add-circle-linear"
                    className="h-4 w-4 mr-2"
                  />
                  New Submission
                </Button>
              </Link>
            </motion.div>

            {/* Stats Cards */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Total Submissions
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stats.total}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <Icon
                          icon="solar:document-text-linear"
                          className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Approved
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.byStatus.APPROVED || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <Icon
                          icon="solar:check-circle-linear"
                          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Under Review
                        </p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {(stats.byStatus.SUBMITTED || 0) +
                            (stats.byStatus.PENDING || 0)}
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <Icon
                          icon="solar:clock-circle-linear"
                          className="h-6 w-6 text-amber-600 dark:text-amber-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Avg Response Time
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stats.avgResponseTime
                            ? `${stats.avgResponseTime}d`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <Icon
                          icon="solar:graph-up-linear"
                          className="h-6 w-6 text-purple-600 dark:text-purple-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Icon
                          icon="solar:magnifer-linear"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"
                        />
                        <Input
                          placeholder="Search by title, city, university..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                          }}
                          className="pl-10 rounded-xl border-slate-200 dark:border-slate-700"
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
            </motion.div>

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="solar:danger-circle-linear"
                      className="h-5 w-5 text-red-600 dark:text-red-400"
                    />
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchSubmissions}
                      className="ml-auto rounded-xl"
                    >
                      <Icon
                        icon="solar:refresh-linear"
                        className="h-4 w-4 mr-2"
                      />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submissions List */}
            {submissions.length === 0 && !loading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Icon
                      icon="solar:document-text-linear"
                      className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No submissions found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {searchQuery ||
                      statusFilter !== "ALL" ||
                      typeFilter !== "ALL"
                        ? "Try adjusting your filters"
                        : "Start by creating your first submission"}
                    </p>
                    <Link href="/basic-information">
                      <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                        <Icon
                          icon="solar:add-circle-linear"
                          className="h-4 w-4 mr-2"
                        />
                        Create Submission
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {submissions.map((submission) => {
                  const typeInfo = getTypeInfo(submission.submissionType);

                  return (
                    <Card
                      key={submission.id}
                      className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Type Icon */}
                            <div
                              className={`p-3 bg-slate-50 dark:bg-slate-800 rounded-xl ${typeInfo.color}`}
                            >
                              <Icon icon={typeInfo.icon} className="h-6 w-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(submission.status)}
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {typeInfo.label}
                                </span>
                                {submission.isFeatured && (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                    ⭐ Featured
                                  </Badge>
                                )}
                              </div>

                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                {submission.title || "Untitled Submission"}
                              </h3>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                {submission.hostCity &&
                                  submission.hostCountry && (
                                    <span className="flex items-center gap-1">
                                      <Icon
                                        icon="solar:map-point-linear"
                                        className="h-4 w-4"
                                      />
                                      {submission.hostCity},{" "}
                                      {submission.hostCountry}
                                    </span>
                                  )}
                                {submission.hostUniversity && (
                                  <span className="flex items-center gap-1">
                                    <Icon
                                      icon="solar:buildings-2-linear"
                                      className="h-4 w-4"
                                    />
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

                              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
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
                                    <Icon
                                      icon="solar:chart-2-linear"
                                      className="h-3 w-3"
                                    />
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
                                  className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                                >
                                  <Icon
                                    icon="solar:pen-new-square-linear"
                                    className="h-4 w-4 mr-2"
                                  />
                                  {submission.status === "REVISION_NEEDED"
                                    ? "Make Revisions"
                                    : "Continue Editing"}
                                </Button>
                              </Link>
                            )}
                            {submission.status === "APPROVED" && (
                              <Link
                                href={`/destinations/${encodeURIComponent((submission as any).city?.toLowerCase().replace(/\s+/g, "-") || "explore")}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                >
                                  <Icon
                                    icon="solar:eye-linear"
                                    className="h-4 w-4 mr-2"
                                  />
                                  View Destination
                                </Button>
                              </Link>
                            )}
                            {submission.revisionCount > 0 && (
                              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                Revision {submission.revisionCount}/1
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {page} of {totalPages} ({total} total)
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl"
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
