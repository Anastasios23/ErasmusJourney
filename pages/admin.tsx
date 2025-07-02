import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Users,
  FileText,
  Eye,
  Edit,
  Check,
  X,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  BookOpen,
  Home,
  MessageSquare,
} from "lucide-react";

interface FormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: any;
  status: "draft" | "submitted" | "published";
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    FormSubmission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock data for demonstration
  const mockSubmissions: FormSubmission[] = [
    {
      id: "1",
      userId: "john.doe@unic.ac.cy",
      type: "basic-info",
      title: "Basic Information - John Doe",
      data: {
        firstName: "John",
        lastName: "Doe",
        university: "UNIC",
        department: "Computer Science",
        levelOfStudy: "bachelor",
        hostDestination: "Barcelona, Spain",
      },
      status: "published",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-16T10:00:00Z",
    },
    {
      id: "2",
      userId: "maria.santos@unic.ac.cy",
      type: "story",
      title: "My Amazing Barcelona Experience",
      data: {
        title: "Life-Changing Semester in Barcelona",
        content:
          "My Erasmus experience in Barcelona was incredible. The culture, food, and people...",
        destination: "Barcelona, Spain",
        tags: ["barcelona", "culture", "erasmus"],
      },
      status: "submitted",
      createdAt: "2024-01-18T10:00:00Z",
      updatedAt: "2024-01-18T10:00:00Z",
    },
    {
      id: "3",
      userId: "alex.wilson@unic.ac.cy",
      type: "accommodation",
      title: "Student Housing in Berlin",
      data: {
        name: "Berlin Student Village",
        type: "Student Residence",
        location: "Berlin, Germany",
        rating: 4.5,
        priceRange: "€350-500/month",
        amenities: ["WiFi", "Gym", "Study Rooms"],
      },
      status: "submitted",
      createdAt: "2024-01-20T10:00:00Z",
      updatedAt: "2024-01-20T10:00:00Z",
    },
    {
      id: "4",
      userId: "emma.brown@unic.ac.cy",
      type: "course-matching",
      title: "Computer Science Courses - Barcelona",
      data: {
        hostUniversity: "University of Barcelona",
        department: "Computer Science",
        courses: [
          {
            hostCourse: "Advanced Algorithms",
            homeCourse: "Algorithm Design",
            difficulty: 4,
          },
        ],
      },
      status: "draft",
      createdAt: "2024-01-22T10:00:00Z",
      updatedAt: "2024-01-22T10:00:00Z",
    },
  ];

  useEffect(() => {
    setSubmissions(mockSubmissions);
    setFilteredSubmissions(mockSubmissions);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = submissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.type.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (submission) => submission.status === statusFilter,
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (submission) => submission.type === typeFilter,
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, typeFilter]);

  const updateSubmissionStatus = (id: string, newStatus: string) => {
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === id
          ? { ...submission, status: newStatus as any }
          : submission,
      ),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "basic-info":
        return <Users className="h-4 w-4" />;
      case "course-matching":
        return <BookOpen className="h-4 w-4" />;
      case "accommodation":
        return <Home className="h-4 w-4" />;
      case "story":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStats = () => {
    const total = submissions.length;
    const published = submissions.filter(
      (s) => s.status === "published",
    ).length;
    const pending = submissions.filter((s) => s.status === "submitted").length;
    const drafts = submissions.filter((s) => s.status === "draft").length;

    return { total, published, pending, drafts };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <>
      <Head>
        <title>Admin Dashboard - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Manage content and user submissions"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage user submissions and website content
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.published}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pending}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Edit className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.drafts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Management */}
            <Tabs defaultValue="submissions" className="space-y-6">
              <TabsList>
                <TabsTrigger value="submissions">All Submissions</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
                <TabsTrigger value="content">Generated Content</TabsTrigger>
              </TabsList>

              <TabsContent value="submissions" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search submissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="basic-info">Basic Info</SelectItem>
                          <SelectItem value="course-matching">
                            Course Matching
                          </SelectItem>
                          <SelectItem value="accommodation">
                            Accommodation
                          </SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Submissions List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Form Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            {getTypeIcon(submission.type)}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {submission.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {submission.userId} •{" "}
                                {new Date(
                                  submission.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={getStatusColor(submission.status)}
                            >
                              {submission.status.charAt(0).toUpperCase() +
                                submission.status.slice(1)}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {submission.status === "submitted" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600"
                                    onClick={() =>
                                      updateSubmissionStatus(
                                        submission.id,
                                        "published",
                                      )
                                    }
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() =>
                                      updateSubmissionStatus(
                                        submission.id,
                                        "draft",
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredSubmissions
                        .filter((s) => s.status === "submitted")
                        .map((submission) => (
                          <div
                            key={submission.id}
                            className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {submission.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Submitted by {submission.userId} on{" "}
                                  {new Date(
                                    submission.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    updateSubmissionStatus(
                                      submission.id,
                                      "published",
                                    )
                                  }
                                >
                                  Approve & Publish
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateSubmissionStatus(
                                      submission.id,
                                      "draft",
                                    )
                                  }
                                >
                                  Request Changes
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      {filteredSubmissions.filter(
                        (s) => s.status === "submitted",
                      ).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No submissions pending review.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Website Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Destinations
                        </h4>
                        <p className="text-2xl font-bold text-blue-600">3</p>
                        <p className="text-sm text-gray-600">
                          Generated from user submissions
                        </p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Accommodations
                        </h4>
                        <p className="text-2xl font-bold text-green-600">5</p>
                        <p className="text-sm text-gray-600">User reviews</p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Student Stories
                        </h4>
                        <p className="text-2xl font-bold text-purple-600">8</p>
                        <p className="text-sm text-gray-600">
                          Published stories
                        </p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Course Matches
                        </h4>
                        <p className="text-2xl font-bold text-orange-600">12</p>
                        <p className="text-sm text-gray-600">
                          Course comparisons
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
