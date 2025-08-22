import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import { Badge } from "../../src/components/ui/badge";
import { Button } from "../../src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/ui/dialog";
import {
  Users,
  MapPin,
  Home,
  BookOpen,
  FileText,
  Eye,
  Edit,
  Check,
  X,
  Clock,
  TrendingUp,
  BarChart3,
  ExternalLink,
} from "lucide-react";

interface FormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: any;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface AdminStats {
  totalSubmissions: number;
  pendingReview: number;
  published: number;
  drafts: number;
  users: number;
}

export default function UnifiedAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalSubmissions: 0,
    pendingReview: 0,
    published: 0,
    drafts: 0,
    users: 0,
  });
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    setLoading(false);
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      // Fetch submissions
      const submissionsRes = await fetch(
        "/api/admin/form-submissions?limit=100",
      );
      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData.submissions || []);

        // Calculate stats
        const submissions = submissionsData.submissions || [];
        const stats = {
          totalSubmissions: submissions.length,
          pendingReview: submissions.filter(
            (s: FormSubmission) => s.status === "SUBMITTED",
          ).length,
          published: submissions.filter(
            (s: FormSubmission) => s.status === "PUBLISHED",
          ).length,
          drafts: submissions.filter(
            (s: FormSubmission) => s.status === "DRAFT",
          ).length,
          users: new Set(submissions.map((s: FormSubmission) => s.userId)).size,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const handleStatusUpdate = async (
    submissionId: string,
    newStatus: string,
  ) => {
    try {
      const response = await fetch(
        `/api/admin/form-submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        await fetchData(); // Refresh data
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error updating submission status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      SUBMITTED: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending Review",
      },
      PUBLISHED: { color: "bg-green-100 text-green-800", label: "Published" },
      ARCHIVED: { color: "bg-red-100 text-red-800", label: "Archived" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      "basic-info": Users,
      "course-matching": BookOpen,
      accommodation: Home,
      "living-expenses": FileText,
      "help-future-students": MapPin,
    };

    const IconComponent = iconMap[type as keyof typeof iconMap] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard - Erasmus Journey</title>
      </Head>

      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage user submissions and content</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalSubmissions}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingReview}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.published}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.drafts}
                  </p>
                </div>
                <Edit className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.users}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                View analytics for destinations and submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full">
                  View Analytics
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Review ({stats.pendingReview})
            </TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.slice(0, 10).map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(submission.type)}
                            <span className="capitalize">
                              {submission.type.replace("-", " ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.user
                            ? `${submission.user.firstName || ""} ${submission.user.lastName || ""}`.trim() ||
                              submission.user.email
                            : "Unknown User"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {submission.title}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedSubmission(submission)
                                }
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {submission.title} -{" "}
                                  {submission.type.replace("-", " ")}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedSubmission && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <strong>Status:</strong>{" "}
                                      {getStatusBadge(
                                        selectedSubmission.status,
                                      )}
                                    </div>
                                    <div>
                                      <strong>Created:</strong>{" "}
                                      {new Date(
                                        selectedSubmission.createdAt,
                                      ).toLocaleString()}
                                    </div>
                                  </div>

                                  <div>
                                    <strong>Data:</strong>
                                    <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                                      {JSON.stringify(
                                        selectedSubmission.data,
                                        null,
                                        2,
                                      )}
                                    </pre>
                                  </div>

                                  {selectedSubmission.status ===
                                    "SUBMITTED" && (
                                    <div className="flex space-x-2 pt-4 border-t">
                                      <Button
                                        onClick={() =>
                                          handleStatusUpdate(
                                            selectedSubmission.id,
                                            "PUBLISHED",
                                          )
                                        }
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve & Publish
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleStatusUpdate(
                                            selectedSubmission.id,
                                            "ARCHIVED",
                                          )
                                        }
                                        variant="destructive"
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submissions Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.filter((s) => s.status === "SUBMITTED").length ===
                0 ? (
                  <div className="text-center py-8">
                    <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-600">
                      No submissions waiting for review.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions
                        .filter((s) => s.status === "SUBMITTED")
                        .map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(submission.type)}
                                <span className="capitalize">
                                  {submission.type.replace("-", " ")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {submission.user
                                ? `${submission.user.firstName || ""} ${submission.user.lastName || ""}`.trim() ||
                                  submission.user.email
                                : "Unknown User"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {submission.title}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                submission.createdAt,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedSubmission(submission)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Review: {submission.title}
                                      </DialogTitle>
                                    </DialogHeader>
                                    {selectedSubmission && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <strong>Type:</strong>{" "}
                                            {selectedSubmission.type.replace(
                                              "-",
                                              " ",
                                            )}
                                          </div>
                                          <div>
                                            <strong>Created:</strong>{" "}
                                            {new Date(
                                              selectedSubmission.createdAt,
                                            ).toLocaleString()}
                                          </div>
                                        </div>

                                        <div>
                                          <strong>Data:</strong>
                                          <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                                            {JSON.stringify(
                                              selectedSubmission.data,
                                              null,
                                              2,
                                            )}
                                          </pre>
                                        </div>

                                        <div className="flex space-x-2 pt-4 border-t">
                                          <Button
                                            onClick={() =>
                                              handleStatusUpdate(
                                                selectedSubmission.id,
                                                "PUBLISHED",
                                              )
                                            }
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve & Publish
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              handleStatusUpdate(
                                                selectedSubmission.id,
                                                "ARCHIVED",
                                              )
                                            }
                                            variant="destructive"
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      submission.id,
                                      "PUBLISHED",
                                    )
                                  }
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>

                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      submission.id,
                                      "ARCHIVED",
                                    )
                                  }
                                  size="sm"
                                  variant="destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Destination Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage destination content created from user submissions and
                  add your own.
                </p>
                <Button onClick={() => router.push("/admin/destinations")}>
                  <MapPin className="h-4 w-4 mr-1" />
                  Manage Destinations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Story Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Review and manage student stories and experiences.
                </p>
                <Button onClick={() => router.push("/admin/stories")}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  Manage Stories
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
