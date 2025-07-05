import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Award, Info, Loader2 } from "lucide-react";

interface Course {
  code: string;
  name: string;
  credits: number;
  grade?: string;
  cyprusEquivalent: string;
}

interface CourseMappingProps {
  courses?: Course[];
  foreignUniversity?: string;
  cyprusUniversity?: string;
  expanded?: boolean;
  fetchFromAPI?: boolean;
}

export default function CourseMapping({
  courses: propCourses,
  foreignUniversity: propForeignUniversity,
  cyprusUniversity: propCyprusUniversity,
  expanded = false,
  fetchFromAPI = false,
}: CourseMappingProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [courses, setCourses] = useState<Course[]>(propCourses || []);
  const [foreignUniversity, setForeignUniversity] = useState(propForeignUniversity || "");
  const [cyprusUniversity, setCyprusUniversity] = useState(propCyprusUniversity || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're in production (no courses provided and fetchFromAPI is true)
  const isProduction = !propCourses && fetchFromAPI;

  useEffect(() => {
    if (fetchFromAPI && !propCourses) {
      fetchCourses();
    }
  }, [fetchFromAPI, propCourses]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setForeignUniversity(data.foreignUniversity || "");
        setCyprusUniversity(data.cyprusUniversity || "");
      } else {
        throw new Error("Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Unable to load course data");
    } finally {
      setLoading(false);
    }
  };

  const displayedCourses = isExpanded ? courses : courses.slice(0, 2);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800";
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Course Mapping
        </CardTitle>
        {foreignUniversity && cyprusUniversity && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {foreignUniversity}
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {cyprusUniversity}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Production Banner */}
        {isProduction && courses.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Course Data Coming Soon
                </h4>
                <p className="text-sm text-blue-700">
                  We're working on integrating live course mapping data.
                  This feature will show real course equivalencies and transfer approvals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading course data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">
                  Unable to Load Courses
                </h4>
                <p className="text-sm text-red-700 mb-2">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchCourses}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Course Content */}
        {!loading && courses.length > 0 && (
          <>
        {displayedCourses.map((course, index) => (
          <div key={index} className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Foreign Course */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {course.code}
                  </Badge>
                  {course.grade && (
                    <Badge className={`text-xs ${getGradeColor(course.grade)}`}>
                      {course.grade}
                    </Badge>
                  )}
                </div>
                <h4 className="font-medium text-gray-900">{course.name}</h4>
                <p className="text-sm text-gray-600">{course.credits} ECTS</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="md:hidden flex items-center justify-center py-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </div>

              {/* Cyprus Equivalent */}
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  Cyprus Equivalent
                </Badge>
                <h4 className="font-medium text-gray-900">
                  {course.cyprusEquivalent}
                </h4>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Award className="h-3 w-3" />
                  Credit Transfer Approved
                </div>
              </div>
            </div>
          </div>
        ))}

        {courses.length > 2 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded
                ? "Show Less"
                : `Show ${courses.length - 2} More Courses`}
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {courses.length}
              </p>
              <p className="text-xs text-gray-600">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {courses.reduce((sum, course) => sum + course.credits, 0)}
              </p>
              <p className="text-xs text-gray-600">ECTS Credits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">100%</p>
              <p className="text-xs text-gray-600">Transfer Rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}