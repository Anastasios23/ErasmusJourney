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

  if (!data || data.submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Student Experiences Yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your experience at {universityName}!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group submissions by type
  const submissionsByType = data.submissions.reduce(
    (acc, submission) => {
      const type = submission.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(submission);
      return acc;
    },
    {} as Record<string, Submission[]>,
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "accommodation":
        return <Home className="h-4 w-4" />;
      case "course-matching":
        return <BookOpen className="h-4 w-4" />;
      case "story":
        return <MessageCircle className="h-4 w-4" />;
      case "living-expenses":
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
      <div className="space-y-3">
        {/* Basic Information */}
        {(data.firstName || data.lastName) && (
          <div>
            <span className="font-medium text-gray-900">
              {[data.firstName, data.lastName].filter(Boolean).join(" ")}
            </span>
            {data.nationality && (
              <span className="text-gray-600"> • {data.nationality}</span>
            )}
          </div>
        )}

        {/* Academic Info */}
        {data.universityInCyprus && (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              {data.universityInCyprus}
            </span>
          </div>
        )}

        {data.departmentInCyprus && (
          <div className="text-sm text-gray-600">
            Department: {data.departmentInCyprus}
          </div>
        )}

        {/* Exchange Details */}
        {data.hostCity && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-600" />
            <span className="text-sm text-gray-600">
              {data.hostCity}, {data.hostCountry}
            </span>
          </div>
        )}

        {data.exchangePeriod && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">{data.exchangePeriod}</span>
          </div>
        )}

        {/* Living Costs */}
        {submission.type === "living-expenses" && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">
              💰 Monthly Expenses
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.monthlyRent && <div>🏠 Rent: €{data.monthlyRent}</div>}
              {data.monthlyFood && <div>🍽️ Food: €{data.monthlyFood}</div>}
              {data.monthlyTransport && (
                <div>🚇 Transport: €{data.monthlyTransport}</div>
              )}
              {data.monthlyEntertainment && (
                <div>🎉 Entertainment: €{data.monthlyEntertainment}</div>
              )}
            </div>
            {data.accommodationType && (
              <div className="mt-2 text-sm text-green-700">
                Accommodation: {data.accommodationType}
              </div>
            )}
          </div>
        )}

        {/* Ratings */}
        {data.overallRating && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">⭐ Ratings</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Overall: {data.overallRating}/5</div>
              {data.accommodationRating && (
                <div>Accommodation: {data.accommodationRating}/5</div>
              )}
              {data.socialLifeRating && (
                <div>Social Life: {data.socialLifeRating}/5</div>
              )}
              {data.academicsRating && (
                <div>Academics: {data.academicsRating}/5</div>
              )}
            </div>
            {data.wouldRecommend !== undefined && (
              <div className="mt-2 text-sm">
                Would recommend: {data.wouldRecommend ? "✅ Yes" : "❌ No"}
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {data.topTips && data.topTips.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h5 className="font-medium text-yellow-900 mb-2">💡 Tips</h5>
            <ul className="text-sm space-y-1">
              {data.topTips.slice(0, 3).map((tip: string, index: number) => (
                <li key={index} className="text-yellow-700">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Course Information for Course Matching */}
        {submission.type === "course-matching" && (
          <>
            {data.hostCourses && data.hostCourses.length > 0 && (
              <div className="bg-indigo-50 p-3 rounded-lg">
                <h5 className="font-medium text-indigo-900 mb-2">
                  📚 Courses Taken
                </h5>
                <div className="space-y-2">
                  {data.hostCourses
                    .slice(0, 3)
                    .map((course: any, index: number) => (
                      <div key={index} className="text-sm text-indigo-700">
                        <div className="font-medium">
                          {course.code} - {course.name}
                        </div>
                        {course.credits && (
                          <div className="text-xs">
                            Credits: {course.credits}
                          </div>
                        )}
                      </div>
                    ))}
                  {data.hostCourses.length > 3 && (
                    <div className="text-xs text-indigo-600">
                      +{data.hostCourses.length - 3} more courses
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.recognizedCourses && data.recognizedCourses.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">
                  ✅ Recognized Courses
                </h5>
                <div className="space-y-2">
                  {data.recognizedCourses
                    .slice(0, 3)
                    .map((course: any, index: number) => (
                      <div key={index} className="text-sm text-green-700">
                        <div className="font-medium">
                          {course.cyprusCode} - {course.cyprusName}
                        </div>
                        {course.equivalentCredits && (
                          <div className="text-xs">
                            Credits: {course.equivalentCredits}
                          </div>
                        )}
                      </div>
                    ))}
                  {data.recognizedCourses.length > 3 && (
                    <div className="text-xs text-green-600">
                      +{data.recognizedCourses.length - 3} more courses
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Personal Experience */}
        {data.personalExperience && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">📝 Experience</h5>
            <p className="text-sm text-purple-700 italic">
              "{data.personalExperience.slice(0, 200)}..."
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Experiences at {data.university.name}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {data.totalSubmissions} student
          {data.totalSubmissions === 1 ? "" : "s"} shared their experience
        </p>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={Object.keys(submissionsByType)[0]}
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
