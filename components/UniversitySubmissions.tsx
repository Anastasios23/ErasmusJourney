import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Users, Loader2 } from "lucide-react";

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
        setError("Failed to load course matching data");
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
          <p className="text-gray-600">Loading course matching data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
      <CardContent className="space-y-6">
        {courseMatchingSubmissions.map((submission) => (
          <Card key={submission.id} className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {submission.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Submitted:{" "}
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="default" className="bg-blue-600">
                  📚 Course Matching
                </Badge>
              </div>

              {/* Student Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h5 className="font-medium text-gray-900 mb-2">
                  📋 Exchange Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Student:</span>{" "}
                    {[submission.data.firstName, submission.data.lastName]
                      .filter(Boolean)
                      .join(" ") || "Anonymous"}
                  </div>
                  <div>
                    <span className="font-medium">Cyprus University:</span>{" "}
                    {submission.data.universityInCyprus || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span>{" "}
                    {submission.data.departmentInCyprus || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Exchange Period:</span>{" "}
                    {submission.data.exchangePeriod || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Course Mapping */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Host University Courses */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h5 className="font-medium text-indigo-900 mb-3 flex items-center gap-2">
                    🎓 Courses at{" "}
                    {submission.data.hostUniversity || "Partner University"}
                  </h5>
                  {submission.data.hostCourses &&
                  submission.data.hostCourses.length > 0 ? (
                    <ul className="space-y-3">
                      {submission.data.hostCourses.map(
                        (course: any, idx: number) => (
                          <li
                            key={idx}
                            className="border-l-4 border-indigo-400 pl-3"
                          >
                            <div className="font-medium text-indigo-900">
                              {course.code || "N/A"} -{" "}
                              {course.name || course.title || "Unknown Course"}
                            </div>
                            <div className="text-sm text-indigo-700">
                              {course.credits || course.ects || "N/A"} ECTS
                            </div>
                            {course.description && (
                              <div className="text-xs text-indigo-600 mt-1">
                                {course.description}
                              </div>
                            )}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <div className="text-sm text-indigo-700">
                      No host courses listed
                    </div>
                  )}
                </div>

                {/* Recognized Cyprus Courses */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                    ✅ Recognized at Cyprus University
                  </h5>
                  {submission.data.recognizedCourses &&
                  submission.data.recognizedCourses.length > 0 ? (
                    <ul className="space-y-3">
                      {submission.data.recognizedCourses.map(
                        (course: any, idx: number) => (
                          <li
                            key={idx}
                            className="border-l-4 border-green-400 pl-3"
                          >
                            <div className="font-medium text-green-900">
                              {course.cyprusCode || course.code || "N/A"} -{" "}
                              {course.cyprusName ||
                                course.title ||
                                course.name ||
                                "Unknown Course"}
                            </div>
                            <div className="text-sm text-green-700">
                              {course.equivalentCredits ||
                                course.ects ||
                                course.credits ||
                                "N/A"}{" "}
                              ECTS
                            </div>
                            {course.recognitionStatus && (
                              <div className="text-xs text-green-600 mt-1">
                                Status: {course.recognitionStatus}
                              </div>
                            )}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <div className="text-sm text-green-700">
                      No recognized courses listed
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Tips */}
              {submission.data.topTips &&
                submission.data.topTips.length > 0 && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">
                      💡 Student Tips
                    </h5>
                    <ul className="text-sm space-y-1">
                      {submission.data.topTips
                        .slice(0, 3)
                        .map((tip: string, index: number) => (
                          <li key={index} className="text-yellow-700">
                            • {tip}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
