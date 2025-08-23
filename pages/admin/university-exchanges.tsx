import React, { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import { Badge } from "../../src/components/ui/badge";
import { Label } from "../../src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Upload,
  Edit3,
  Trash2,
  GraduationCap,
  Calendar,
  Globe,
  Award,
  RefreshCw,
} from "lucide-react";

interface CourseInfo {
  courseName: string;
  courseCode: string;
  ects: number;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD" | "VERY_HARD";
  examType: "WRITTEN" | "ORAL" | "PROJECT" | "PRESENTATION" | "MIXED";
  semester: "FALL" | "SPRING" | "BOTH";
  prerequisites?: string;
  description?: string;
}

interface UniversitySubmissionData {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;

  // From Basic Information Form
  basicInfo: {
    universityInCyprus: string;
    hostUniversity: string;
    hostCity: string;
    hostCountry: string;
    studyLevel: "BACHELOR" | "MASTER" | "PHD";
    fieldOfStudy: string;
    studyPeriod: string;
  };

  // From Course Matching Form
  courseMatching: {
    availableCourses: CourseInfo[];
    totalEcts: number;
    academicYear: string;
    language: string;
    specialRequirements?: string;
    applicationDeadline?: string;
  };
}

interface UniversityExchange {
  id: string;
  universityName: string;
  city: string;
  country: string;
  studyLevel: string;
  fieldOfStudy: string;

  // Admin content
  description: string;
  imageUrl?: string;
  partnershipType: "ERASMUS" | "BILATERAL" | "DIRECT";
  applicationDeadline: string;
  languageRequirements: string;
  tuitionWaiver: boolean;
  accommodationSupport: boolean;

  // Course data from submissions
  availableCourses: CourseInfo[];
  totalEcts: number;

  // Statistics
  studentCount: number;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

export default function AdminUniversityExchanges() {
  const [pendingSubmissions, setPendingSubmissions] = useState<
    UniversitySubmissionData[]
  >([]);
  const [liveExchanges, setLiveExchanges] = useState<UniversityExchange[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<UniversitySubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  // Admin form data
  const [adminData, setAdminData] = useState<{
    description: string;
    partnershipType: "ERASMUS" | "BILATERAL" | "DIRECT";
    applicationDeadline: string;
    languageRequirements: string;
    tuitionWaiver: boolean;
    accommodationSupport: boolean;
    additionalNotes: string;
  }>({
    description: "",
    partnershipType: "ERASMUS",
    applicationDeadline: "",
    languageRequirements: "",
    tuitionWaiver: true,
    accommodationSupport: false,
    additionalNotes: "",
  });

  // safeFetch function to bypass FullStory interference using XMLHttpRequest
  const safeFetch = async (url: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}, retries = 3) => {
    const method = options.method || 'GET';
    console.log(`${method} ${url} using XMLHttpRequest to bypass FullStory interference...`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await new Promise<{ok: boolean; status: number; json: () => Promise<any>}>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(method, url, true);

          // Set headers
          if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }

          xhr.onload = () => {
            try {
              const responseData = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                json: async () => responseData
              });
            } catch (parseError) {
              console.warn(`JSON parse error on attempt ${attempt}:`, parseError);
              resolve({
                ok: false,
                status: xhr.status,
                json: async () => ({})
              });
            }
          };

          xhr.onerror = () => {
            reject(new Error(`XMLHttpRequest failed: ${xhr.status} ${xhr.statusText}`));
          };

          xhr.ontimeout = () => {
            reject(new Error('XMLHttpRequest timeout'));
          };

          xhr.timeout = 30000; // 30 second timeout

          if (options.body) {
            xhr.send(options.body);
          } else {
            xhr.send();
          }
        });

        console.log(`${method} ${url} completed with status:`, response.status);
        return response;
      } catch (error) {
        console.warn(`Attempt ${attempt}/${retries} failed for ${method} ${url}:`, error);

        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`All ${retries} attempts failed for ${method} ${url}`);
  };

  useEffect(() => {
    fetchPendingSubmissions();
    fetchLiveExchanges();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      console.log('Fetching pending university submissions...');
      const response = await safeFetch(
        "/api/admin/university-submissions?status=SUBMITTED",
      );
      const data = await response.json();
      console.log('Pending submissions fetched successfully:', data?.length || 0);
      setPendingSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setPendingSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveExchanges = async () => {
    try {
      console.log('Fetching live university exchanges...');
      const response = await safeFetch("/api/admin/university-exchanges");
      const data = await response.json();
      console.log('Live exchanges fetched successfully:', data?.length || 0);
      setLiveExchanges(data || []);
    } catch (error) {
      console.error("Error fetching exchanges:", error);
      setLiveExchanges([]);
    }
  };

  const handleReviewSubmission = (submission: UniversitySubmissionData) => {
    setSelectedSubmission(submission);

    // Pre-populate admin data
    setAdminData({
      description: `${submission.basicInfo.hostUniversity} offers excellent academic programs in ${submission.basicInfo.fieldOfStudy}. Located in ${submission.basicInfo.hostCity}, ${submission.basicInfo.hostCountry}, this university provides high-quality education with ${submission.courseMatching.totalEcts} ECTS available per semester.`,
      partnershipType: "ERASMUS",
      applicationDeadline: submission.courseMatching.applicationDeadline || "",
      languageRequirements: submission.courseMatching.language || "English B2",
      tuitionWaiver: true,
      accommodationSupport: false,
      additionalNotes: "",
    });
  };

  const approveSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      console.log('Approving university submission:', selectedSubmission.id);
      // Approve the submission and create university exchange
      const response = await safeFetch(
        `/api/admin/university-submissions/${selectedSubmission.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "APPROVED",
            universityExchangeData: {
              ...adminData,
              imageUrl,
              universityName: selectedSubmission.basicInfo.hostUniversity,
              city: selectedSubmission.basicInfo.hostCity,
              country: selectedSubmission.basicInfo.hostCountry,
              studyLevel: selectedSubmission.basicInfo.studyLevel,
              fieldOfStudy: selectedSubmission.basicInfo.fieldOfStudy,
              availableCourses: selectedSubmission.courseMatching.availableCourses,
              totalEcts: selectedSubmission.courseMatching.totalEcts,
            },
          }),
        },
      );

      if (response.ok) {
        console.log('Successfully approved university submission');
        // Refresh data
        fetchPendingSubmissions();
        fetchLiveExchanges();
        setSelectedSubmission(null);
        setImageUrl("");

        // Reset admin data
        setAdminData({
          description: "",
          partnershipType: "ERASMUS",
          applicationDeadline: "",
          languageRequirements: "",
          tuitionWaiver: true,
          accommodationSupport: false,
          additionalNotes: "",
        });
      } else {
        console.error('Failed to approve submission, status:', response.status);
      }
    } catch (error) {
      console.error("Error approving submission:", error);
    }
  };

  const rejectSubmission = async (submissionId: string, reason: string) => {
    try {
      console.log('Rejecting university submission:', submissionId, 'with reason:', reason);
      const response = await safeFetch(`/api/admin/university-submissions/${submissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          adminNotes: reason
        }),
      });

      if (response.ok) {
        console.log('Successfully rejected university submission');
      } else {
        console.error('Failed to reject submission, status:', response.status);
      }

      fetchPendingSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-orange-100 text-orange-800";
      case "VERY_HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExamTypeIcon = (examType: string) => {
    switch (examType) {
      case "WRITTEN":
        return "📝";
      case "ORAL":
        return "🗣️";
      case "PROJECT":
        return "📋";
      case "PRESENTATION":
        return "🎤";
      case "MIXED":
        return "🔄";
      default:
        return "📚";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - University Exchanges Management</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                University Exchanges Management
              </h1>
              <p className="text-gray-600 mt-2">
                Review course matching and basic information submissions to
                create university exchange listings
              </p>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Pending Review ({pendingSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Live Exchanges ({liveExchanges.length})
                </TabsTrigger>
              </TabsList>

              {/* Pending Submissions */}
              <TabsContent value="pending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Course Matching Submissions</CardTitle>
                    <p className="text-sm text-gray-600">
                      Student submissions from Basic Information + Course
                      Matching forms waiting for review
                    </p>
                  </CardHeader>
                  <CardContent>
                    {pendingSubmissions.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No pending submissions to review
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingSubmissions.map((submission) => (
                          <Card
                            key={submission.id}
                            className="border-l-4 border-l-orange-400"
                          >
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-4 flex-1">
                                  {/* Header */}
                                  <div className="flex items-center gap-4">
                                    <h3 className="font-semibold text-lg">
                                      {submission.basicInfo.hostUniversity}
                                    </h3>
                                    <Badge variant="outline">
                                      {submission.basicInfo.studyLevel}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50"
                                    >
                                      {submission.basicInfo.fieldOfStudy}
                                    </Badge>
                                  </div>

                                  {/* Basic Information */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">
                                        Student:
                                      </span>
                                      <p className="font-medium">
                                        {submission.studentName}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Location:
                                      </span>
                                      <p className="font-medium">
                                        {submission.basicInfo.hostCity},{" "}
                                        {submission.basicInfo.hostCountry}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Home University:
                                      </span>
                                      <p className="font-medium">
                                        {
                                          submission.basicInfo
                                            .universityInCyprus
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Period:
                                      </span>
                                      <p className="font-medium">
                                        {submission.basicInfo.studyPeriod}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Course Information */}
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                      <BookOpen className="h-5 w-5" />
                                      <h4 className="font-semibold">
                                        Course Information
                                      </h4>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                      <div>
                                        <span className="text-gray-500">
                                          Total ECTS:
                                        </span>
                                        <p className="font-medium">
                                          {submission.courseMatching.totalEcts}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Available Courses:
                                        </span>
                                        <p className="font-medium">
                                          {
                                            submission.courseMatching
                                              .availableCourses.length
                                          }
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Language:
                                        </span>
                                        <p className="font-medium">
                                          {submission.courseMatching.language}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Academic Year:
                                        </span>
                                        <p className="font-medium">
                                          {
                                            submission.courseMatching
                                              .academicYear
                                          }
                                        </p>
                                      </div>
                                    </div>

                                    {/* Course Examples */}
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Sample Courses:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {submission.courseMatching.availableCourses
                                          .slice(0, 3)
                                          .map((course, index) => (
                                            <div
                                              key={index}
                                              className="bg-white p-2 rounded border text-xs"
                                            >
                                              <div className="font-medium">
                                                {course.courseName}
                                              </div>
                                              <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                  className={getDifficultyColor(
                                                    course.difficultyLevel,
                                                  )}
                                                >
                                                  {course.difficultyLevel}
                                                </Badge>
                                                <span>
                                                  {getExamTypeIcon(
                                                    course.examType,
                                                  )}{" "}
                                                  {course.examType}
                                                </span>
                                                <span className="text-blue-600">
                                                  {course.ects} ECTS
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        {submission.courseMatching
                                          .availableCourses.length > 3 && (
                                          <div className="bg-gray-200 p-2 rounded text-xs text-gray-600">
                                            +
                                            {submission.courseMatching
                                              .availableCourses.length - 3}{" "}
                                            more courses
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-xs text-gray-500">
                                    Submitted:{" "}
                                    {new Date(
                                      submission.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>

                                <Button
                                  onClick={() =>
                                    handleReviewSubmission(submission)
                                  }
                                  className="ml-4"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review & Add Content
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Live Exchanges */}
              <TabsContent value="live" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Published University Exchanges</CardTitle>
                    <p className="text-sm text-gray-600">
                      Currently live university exchanges on the public website
                    </p>
                  </CardHeader>
                  <CardContent>
                    {liveExchanges.length === 0 ? (
                      <div className="text-center py-12">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No university exchanges published yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveExchanges.map((exchange) => (
                          <Card
                            key={exchange.id}
                            className="border-l-4 border-l-green-400"
                          >
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                {exchange.imageUrl && (
                                  <img
                                    src={exchange.imageUrl}
                                    alt={exchange.universityName}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {exchange.universityName}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {exchange.city}, {exchange.country}
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="outline">
                                      {exchange.studyLevel}
                                    </Badge>
                                    <Badge variant="outline">
                                      {exchange.partnershipType}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-sm">
                                  <p className="text-gray-600 line-clamp-2">
                                    {exchange.description}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {exchange.studentCount} students
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {exchange.availableCourses.length} courses
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Award className="h-4 w-4" />
                                    {exchange.totalEcts} ECTS
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Public
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Review Dialog */}
        {selectedSubmission && (
          <Dialog
            open={!!selectedSubmission}
            onOpenChange={() => setSelectedSubmission(null)}
          >
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Review University Exchange Submission</DialogTitle>
                <DialogDescription>
                  Review course and university data, add admin content, and
                  approve for publication
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Student Submission Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        University Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Host University</Label>
                        <p className="font-medium text-lg">
                          {selectedSubmission.basicInfo.hostUniversity}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>City</Label>
                          <p className="font-medium">
                            {selectedSubmission.basicInfo.hostCity}
                          </p>
                        </div>
                        <div>
                          <Label>Country</Label>
                          <p className="font-medium">
                            {selectedSubmission.basicInfo.hostCountry}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Study Level</Label>
                          <p className="font-medium">
                            {selectedSubmission.basicInfo.studyLevel}
                          </p>
                        </div>
                        <div>
                          <Label>Field of Study</Label>
                          <p className="font-medium">
                            {selectedSubmission.basicInfo.fieldOfStudy}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label>Student</Label>
                        <p className="font-medium">
                          {selectedSubmission.studentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedSubmission.basicInfo.universityInCyprus}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Course Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Academic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Total ECTS Available</Label>
                          <p className="font-medium text-lg">
                            {selectedSubmission.courseMatching.totalEcts}
                          </p>
                        </div>
                        <div>
                          <Label>Number of Courses</Label>
                          <p className="font-medium text-lg">
                            {
                              selectedSubmission.courseMatching.availableCourses
                                .length
                            }
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Language</Label>
                          <p className="font-medium">
                            {selectedSubmission.courseMatching.language}
                          </p>
                        </div>
                        <div>
                          <Label>Academic Year</Label>
                          <p className="font-medium">
                            {selectedSubmission.courseMatching.academicYear}
                          </p>
                        </div>
                      </div>
                      {selectedSubmission.courseMatching
                        .applicationDeadline && (
                        <div>
                          <Label>Application Deadline</Label>
                          <p className="font-medium">
                            {
                              selectedSubmission.courseMatching
                                .applicationDeadline
                            }
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Available Courses */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedSubmission.courseMatching.availableCourses.map(
                        (course, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="space-y-2">
                              <h4 className="font-medium">
                                {course.courseName}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {course.courseCode}
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {course.ects} ECTS
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getDifficultyColor(
                                    course.difficultyLevel,
                                  )}
                                >
                                  {course.difficultyLevel}
                                </Badge>
                                <span className="text-sm">
                                  {getExamTypeIcon(course.examType)}{" "}
                                  {course.examType}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                Semester: {course.semester}
                              </div>
                              {course.description && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Content Form */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-900">
                      Add Admin Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* University Description */}
                    <div>
                      <Label htmlFor="description">
                        University Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Professional description of the university and its academic programs..."
                        value={adminData.description}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>

                    {/* University Image */}
                    <div>
                      <Label htmlFor="imageUrl">University Image URL</Label>
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/university-image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      {imageUrl && (
                        <div className="mt-2">
                          <img
                            src={imageUrl}
                            alt="University preview"
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={() => setImageUrl("")}
                          />
                        </div>
                      )}
                    </div>

                    {/* Partnership Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="partnershipType">
                          Partnership Type
                        </Label>
                        <Select
                          value={adminData.partnershipType}
                          onValueChange={(
                            value: "ERASMUS" | "BILATERAL" | "DIRECT",
                          ) =>
                            setAdminData({
                              ...adminData,
                              partnershipType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ERASMUS">
                              Erasmus+ Program
                            </SelectItem>
                            <SelectItem value="BILATERAL">
                              Bilateral Agreement
                            </SelectItem>
                            <SelectItem value="DIRECT">
                              Direct Exchange
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="applicationDeadline">
                          Application Deadline
                        </Label>
                        <Input
                          id="applicationDeadline"
                          placeholder="e.g., March 15th, 2024"
                          value={adminData.applicationDeadline}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              applicationDeadline: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="languageRequirements">
                        Language Requirements
                      </Label>
                      <Input
                        id="languageRequirements"
                        placeholder="e.g., English B2, German A1"
                        value={adminData.languageRequirements}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            languageRequirements: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={adminData.tuitionWaiver}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              tuitionWaiver: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm">
                          Tuition Waiver Available
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={adminData.accommodationSupport}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              accommodationSupport: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm">Accommodation Support</span>
                      </label>
                    </div>

                    <div>
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        placeholder="Any additional information for students..."
                        value={adminData.additionalNotes}
                        onChange={(e) =>
                          setAdminData({
                            ...adminData,
                            additionalNotes: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedSubmission) {
                      rejectSubmission(
                        selectedSubmission.id,
                        "Rejected by admin",
                      );
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={approveSubmission}
                  disabled={!adminData.description.trim()}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Publish Exchange
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
