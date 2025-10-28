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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { Input } from "../../src/components/ui/input";
import {
  Users,
  MapPin,
  FileText,
  Eye,
  Check,
  X,
  Clock,
  TrendingUp,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";

interface ErasmusExperience {
  id: string;
  userId: string;
  currentStep: number;
  status: string;
  basicInfo: any;
  courses: any;
  accommodation: any;
  livingExpenses: any;
  experience: any;
  lastSavedAt: string;
  submittedAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface FormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  status: string;
  hostCity?: string;
  hostCountry?: string;
  createdAt: string;
  updatedAt: string;
  data: any;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface DashboardStats {
  totalExperiences: number;
  totalSubmissions: number;
  pendingReview: number;
  published: number;
  drafts: number;
  uniqueUsers: number;
  recentActivity: number;
}

export default function UnifiedAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [experiences, setExperiences] = useState<ErasmusExperience[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalExperiences: 0,
    totalSubmissions: 0,
    pendingReview: 0,
    published: 0,
    drafts: 0,
    uniqueUsers: 0,
    recentActivity: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    // Note: Authentication is disabled in your app
    // Enable this when you re-enable authentication
    // if (status === "loading") return;
    // if (!session || session.user?.role !== "ADMIN") {
    //   router.push("/login");
    //   return;
    // }

    setLoading(false);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Initialize variables outside the if blocks
      let experiencesData: ErasmusExperience[] = [];
      let submissionsData: FormSubmission[] = [];

      // Fetch experiences (multi-step forms)
      const experiencesRes = await fetch("/api/erasmus-experiences");
      if (experiencesRes.ok) {
        experiencesData = await experiencesRes.json();
        setExperiences(experiencesData || []);
      }

      // Fetch form submissions (quick submissions)
      const submissionsRes = await fetch(
        "/api/admin/form-submissions?limit=500",
      );
      if (submissionsRes.ok) {
        const submissionsResult = await submissionsRes.json();
        submissionsData = submissionsResult.submissions || [];
        setSubmissions(submissionsData);
      }

      // Calculate stats
      calculateStats(experiencesData, submissionsData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    experiencesData: ErasmusExperience[],
    submissionsData: FormSubmission[],
  ) => {
    const allUsers = new Set([
      ...experiencesData.map((e) => e.userId),
      ...submissionsData.map((s) => s.userId),
    ]);

    const pendingExperiences = experiencesData.filter(
      (e) => e.status === "SUBMITTED" || e.status === "IN_PROGRESS",
    ).length;

    const pendingSubmissions = submissionsData.filter(
      (s) => s.status === "SUBMITTED",
    ).length;

    const publishedSubmissions = submissionsData.filter(
      (s) => s.status === "PUBLISHED",
    ).length;

    const drafts = [
      ...experiencesData.filter((e) => e.status === "DRAFT"),
      ...submissionsData.filter((s) => s.status === "DRAFT"),
    ].length;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = [
      ...experiencesData.filter((e) => new Date(e.lastSavedAt) > sevenDaysAgo),
      ...submissionsData.filter((s) => new Date(s.updatedAt) > sevenDaysAgo),
    ].length;

    setStats({
      totalExperiences: experiencesData.length,
      totalSubmissions: submissionsData.length,
      pendingReview: pendingExperiences + pendingSubmissions,
      published: publishedSubmissions,
      drafts,
      uniqueUsers: allUsers.size,
      recentActivity,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      IN_PROGRESS: { color: "bg-blue-100 text-blue-800", label: "In Progress" },
      SUBMITTED: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending Review",
      },
      PUBLISHED: { color: "bg-green-100 text-green-800", label: "Published" },
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Completed" },
      ARCHIVED: { color: "bg-red-100 text-red-800", label: "Archived" },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter data
  const filteredExperiences = experiences.filter((exp) => {
    const matchesStatus = statusFilter === "all" || exp.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      exp.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.basicInfo?.hostCity
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesType = typeFilter === "all" || sub.type === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      sub.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.hostCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard - Unified View | Erasmus Journey</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Unified view of all form submissions and experiences
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Experiences
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExperiences}</div>
              <p className="text-xs text-muted-foreground">
                Multi-step form submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Submissions
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Destination & quick forms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting admin action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentActivity} active last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
              {activeTab === "submissions" && (
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="basic-info">Basic Info</SelectItem>
                    <SelectItem value="destination">Destination</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experiences">
              Experiences ({experiences.length})
            </TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions ({submissions.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Overview of all form data in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Published Content
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {stats.published}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Draft Items</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {stats.drafts}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Needs Review</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.pendingReview}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Experiences</CardTitle>
                </CardHeader>
                <CardContent>
                  {experiences.slice(0, 5).map((exp) => (
                    <div
                      key={exp.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {exp.user?.firstName} {exp.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {exp.basicInfo?.hostCity || "No city"}
                        </p>
                      </div>
                      {getStatusBadge(exp.status)}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {submissions.slice(0, 5).map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{sub.title}</p>
                        <p className="text-xs text-gray-500">{sub.type}</p>
                      </div>
                      {getStatusBadge(sub.status)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences">
            <Card>
              <CardHeader>
                <CardTitle>Erasmus Experiences</CardTitle>
                <CardDescription>
                  Multi-step form submissions from students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExperiences.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No experiences found. Students haven't submitted the
                          multi-step form yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExperiences.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {exp.user?.firstName} {exp.user?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {exp.user?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {exp.basicInfo?.hostCity &&
                            exp.basicInfo?.hostCountry
                              ? `${exp.basicInfo.hostCity}, ${exp.basicInfo.hostCountry}`
                              : "Not specified"}
                          </TableCell>
                          <TableCell>{exp.currentStep}/5</TableCell>
                          <TableCell>{getStatusBadge(exp.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(exp.lastSavedAt)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
                <CardDescription>
                  Quick submissions and destination forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No submissions found. Try adjusting your filters or
                          add new data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubmissions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">
                            {sub.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sub.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {sub.hostCity && sub.hostCountry
                              ? `${sub.hostCity}, ${sub.hostCountry}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(sub.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
