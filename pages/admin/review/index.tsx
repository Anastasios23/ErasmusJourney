import { useState, useEffect } from "react";
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
import { Input } from "../../../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../src/components/ui/select";
import {
  ArrowRight,
  Clock,
  User,
  MapPin,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Building,
  BookOpen,
  Home,
  Loader2,
} from "lucide-react";
import Footer from "../../../src/components/Footer";
import { cn } from "@/lib/utils";

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
  submittedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface Props {
  submissions: Submission[];
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  session: any;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
  revision_requested: {
    label: "Revision",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: AlertCircle,
  },
};

const typeConfig = {
  basic_information: {
    label: "Basic Info",
    icon: User,
    color: "from-violet-500 to-purple-600",
  },
  course_matching: {
    label: "Course Matching",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
  },
  accommodation: {
    label: "Accommodation",
    icon: Home,
    color: "from-emerald-500 to-teal-600",
  },
  living_expenses: {
    label: "Living Expenses",
    icon: Building,
    color: "from-amber-500 to-orange-600",
  },
  experience: {
    label: "Experience",
    icon: FileText,
    color: "from-pink-500 to-rose-600",
  },
};

export default function AdminReviewIndex({
  submissions,
  stats,
  session,
}: Props) {
  const [filteredSubmissions, setFilteredSubmissions] = useState(submissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.author.email.toLowerCase().includes(term) ||
          s.author.firstName?.toLowerCase().includes(term) ||
          s.author.lastName?.toLowerCase().includes(term) ||
          s.hostCity?.toLowerCase().includes(term) ||
          s.hostCountry?.toLowerCase().includes(term) ||
          s.hostUniversity?.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((s) => s.submissionType === typeFilter);
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, statusFilter, typeFilter, submissions]);

  return (
    <>
      <Head>
        <title>Review Queue | Admin | ErasmusJourney</title>
        <meta name="description" content="Review pending student submissions" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/20">
        <Header />

        <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link
                href="/admin"
                className="hover:text-violet-600 transition-colors"
              >
                Admin
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">
                Review Queue
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Review Queue
                </h1>
                <p className="text-gray-500 mt-1">
                  Review and manage student submissions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/admin">
                  <Button variant="outline" className="rounded-xl">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Pending",
                value: stats.pending,
                color: "from-amber-500 to-orange-500",
                icon: Clock,
              },
              {
                label: "Approved",
                value: stats.approved,
                color: "from-emerald-500 to-green-500",
                icon: CheckCircle2,
              },
              {
                label: "Rejected",
                value: stats.rejected,
                color: "from-red-500 to-rose-500",
                icon: XCircle,
              },
              {
                label: "Total",
                value: stats.total,
                color: "from-violet-500 to-purple-500",
                icon: FileText,
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="relative overflow-hidden border-0 shadow-lg"
              >
                <div
                  className={cn(
                    "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
                    stat.color,
                  )}
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-2xl bg-gradient-to-br",
                        stat.color,
                      )}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by author, city, country, or university..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl h-12"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 rounded-xl h-12">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="revision_requested">
                      Revision Requested
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48 rounded-xl h-12">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="basic_information">
                      Basic Information
                    </SelectItem>
                    <SelectItem value="course_matching">
                      Course Matching
                    </SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="living_expenses">
                      Living Expenses
                    </SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No submissions found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your filters"
                      : "There are no submissions to review at this time"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissions.map((submission) => {
                const status =
                  statusConfig[
                    submission.status as keyof typeof statusConfig
                  ] || statusConfig.pending;
                const type =
                  typeConfig[
                    submission.submissionType as keyof typeof typeConfig
                  ] || typeConfig.experience;
                const StatusIcon = status.icon;
                const TypeIcon = type.icon;

                return (
                  <Card
                    key={submission.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Type Icon */}
                        <div
                          className={cn(
                            "p-4 rounded-2xl bg-gradient-to-br shrink-0",
                            type.color,
                          )}
                        >
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {submission.title || type.label + " Submission"}
                            </h3>
                            <Badge className={cn("border", status.color)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {type.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>
                                {submission.author.firstName}{" "}
                                {submission.author.lastName}
                              </span>
                            </div>
                            {submission.hostCity && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {submission.hostCity},{" "}
                                  {submission.hostCountry}
                                </span>
                              </div>
                            )}
                            {submission.submittedAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    submission.submittedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        <Link href={`/admin/review/${submission.id}`}>
                          <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white gap-2 group-hover:shadow-lg transition-all">
                            <Eye className="w-4 h-4" />
                            Review
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Results count */}
          {filteredSubmissions.length > 0 && (
            <p className="text-center text-gray-500 mt-6">
              Showing {filteredSubmissions.length} of {submissions.length}{" "}
              submissions
            </p>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withAdminAuth(
  async (context, session) => {
    try {
      const submissions = await prisma.form_submissions.findMany({
        where: {
          submittedAt: { not: null },
        },
        orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
        select: {
          id: true,
          submissionType: true,
          status: true,
          title: true,
          hostCity: true,
          hostCountry: true,
          hostUniversity: true,
          semester: true,
          academicYear: true,
          submittedAt: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      const stats = {
        pending: submissions.filter((s) => s.status === "pending").length,
        approved: submissions.filter((s) => s.status === "approved").length,
        rejected: submissions.filter((s) => s.status === "rejected").length,
        total: submissions.length,
      };

      return {
        props: {
          submissions: JSON.parse(JSON.stringify(submissions)),
          stats,
          session,
        },
      };
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return {
        props: {
          submissions: [],
          stats: { pending: 0, approved: 0, rejected: 0, total: 0 },
          session,
        },
      };
    }
  },
);
