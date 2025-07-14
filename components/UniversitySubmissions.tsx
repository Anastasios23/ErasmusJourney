import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import {
  Users,
  BookOpen,
  MapPin,
  Calendar,
  Star,
  Euro,
  Home,
  MessageCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface UniversitySubmissionsProps {
  universityId: string;
  universityName: string;
}

interface Submission {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UniversitySubmissionsData {
  submissions: Submission[];
  university: {
    id: string;
    name: string;
    city?: string;
    country?: string;
  };
  totalSubmissions: number;
}

export default function UniversitySubmissions({
  universityId,
  universityName,
}: UniversitySubmissionsProps) {
  const [data, setData] = useState<UniversitySubmissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/university-exchanges/${encodeURIComponent(universityId)}/submissions`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError("Failed to load student experiences");
      } finally {
        setLoading(false);
      }
    };

    if (universityId) {
      fetchSubmissions();
    }
  }, [universityId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading student experiences...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Filter to only show COURSE_MATCHING submissions
  const courseMatchingSubmissions =
    data?.submissions?.filter((sub) => sub.type === "COURSE_MATCHING") || [];

  if (!data || courseMatchingSubmissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Course Matching Data Yet
          </h3>
          <p className="text-gray-600">
            Be the first to share course mapping information for{" "}
            {universityName}!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group submissions by type (only course matching now)
  const submissionsByType = courseMatchingSubmissions.reduce(
    (acc, submission) => {
      const type = submission?.type || "unknown";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(submission);
      return acc;
    },
    {} as Record<string, Submission[]>,
  );

  // Ensure we have at least one type to prevent tabs error
  if (Object.keys(submissionsByType).length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Valid Submissions
          </h3>
          <p className="text-gray-600">
            The submissions data appears to be malformed.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ACCOMMODATION":
        return <Home className="h-4 w-4" />;
      case "COURSE_MATCHING":
        return <BookOpen className="h-4 w-4" />;
      case "STORY":
        return <MessageCircle className="h-4 w-4" />;
      case "EXPERIENCE":
        return <Euro className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "accommodation":
        return "Accommodation";
      case "course-matching":
        return "Course Matching";
      case "story":
        return "Stories";
      case "living-expenses":
        return "Living Expenses";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const formatSubmissionData = (submission: Submission) => {
    const { data } = submission;

    return (
      <div className="space-y-4">
        {/* Student and Exchange Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">
            📚 Exchange Details
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">Student:</span>{" "}
              {[data.firstName, data.lastName].filter(Boolean).join(" ") ||
                "Anonymous"}
            </div>
            <div>
              <span className="font-medium">Cyprus University:</span>{" "}
              {data.universityInCyprus || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Department:</span>{" "}
              {data.departmentInCyprus || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Exchange Period:</span>{" "}
              {data.exchangePeriod || "Not specified"}
            </div>
          </div>
        </div>

        {/* Course Matching Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Host University Courses */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h5 className="font-medium text-indigo-900 mb-3">
              🎓 Courses at Partner University
            </h5>
            {data.hostCourses && data.hostCourses.length > 0 ? (
              <div className="space-y-3">
                {data.hostCourses.map((course: any, index: number) => (
                  <div
                    key={index}
                    className="border-l-4 border-indigo-400 pl-3"
                  >
                    <div className="font-medium text-indigo-900">
                      {course.code || "Unknown"} -{" "}
                      {course.name || "Unknown Course"}
                    </div>
                    <div className="text-sm text-indigo-700">
                      {course.credits} ECTS
                    </div>
                    {course.description && (
                      <div className="text-xs text-indigo-600 mt-1">
                        {course.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-indigo-700">
                No host courses listed
              </div>
            )}
          </div>

          {/* Recognized Cyprus Courses */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 mb-3">
              ✅ Recognized at Cyprus University
            </h5>
            {data.recognizedCourses && data.recognizedCourses.length > 0 ? (
              <div className="space-y-3">
                {data.recognizedCourses.map((course: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-400 pl-3">
                    <div className="font-medium text-green-900">
                      {course.cyprusCode || "Unknown"} -{" "}
                      {course.cyprusName || "Unknown Course"}
                    </div>
                    <div className="text-sm text-green-700">
                      {course.equivalentCredits} ECTS
                    </div>
                    {course.recognitionStatus && (
                      <div className="text-xs text-green-600 mt-1">
                        Status: {course.recognitionStatus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-green-700">
                No recognized courses listed
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Course Matching for {data.university?.name || universityName}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {courseMatchingSubmissions.length} course matching submission
          {courseMatchingSubmissions.length === 1 ? "" : "s"} available
        </p>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={Object.keys(submissionsByType)[0] || "default"}
          className="w-full"
        >
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${Object.keys(submissionsByType).length}, minmax(0, 1fr))`,
            }}
          >
            {Object.keys(submissionsByType).map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="flex items-center gap-2"
              >
                {getTypeIcon(type)}
                {getTypeName(type)} ({submissionsByType[type].length})
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(submissionsByType).map(([type, submissions]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        {submission.title}
                      </h4>
                      <Badge variant="secondary">
                        {getTypeName(submission.type)}
                      </Badge>
                    </div>
                    {formatSubmissionData(submission)}
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      Shared on{" "}
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
