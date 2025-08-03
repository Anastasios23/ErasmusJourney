import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  BookOpen,
  GraduationCap,
  User,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface CourseMatchingExperience {
  id: string;
  studentName: string;
  homeUniversity: string;
  homeDepartment: string;
  hostUniversity: string;
  hostDepartment: string;
  levelOfStudy: string;
  hostCourseCount: number;
  homeCourseCount: number;
  courseMatchingDifficult: string;
  courseMatchingChallenges?: string;
  timeSpentOnMatching?: string;
  creditsTransferredSuccessfully?: number;
  totalCreditsAttempted?: number;
  recommendCourses: string;
  recommendationReason?: string;
  overallAcademicExperience?: number;
  biggestCourseChallenge?: string;
  academicAdviceForFuture?: string;
  teachingQuality?: number;
  languageOfInstruction?: string;
  classSize?: string;
  studentSupportServices?: number;
  courseSelectionTips?: string;
  academicPreparationAdvice?: string;
  bestCoursesRecommendation?: string;
  coursesToAvoid?: string;
  hasLinkedStory?: boolean;
  hostCourses?: Array<{
    name: string;
    code?: string;
    ects: number;
    difficulty?: string;
    examTypes?: string[];
    teachingStyle?: string;
    workload?: string;
    recommendation?: string;
    type?: string;
  }>;
  equivalentCourses?: Array<{
    hostCourseName: string;
    homeCourseName: string;
    hostCourseCode?: string;
    homeCourseCode?: string;
    ects: number;
    matchQuality?: string;
    approvalDifficulty?: string;
    notes?: string;
  }>;
}

interface CourseMatchingExperienceCardProps {
  courseMatching: CourseMatchingExperience;
  showDetailButton?: boolean;
  onViewDetail?: (id: string) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Very Easy":
      return "bg-green-100 text-green-800";
    case "Easy":
      return "bg-green-100 text-green-700";
    case "Moderate":
      return "bg-yellow-100 text-yellow-800";
    case "Difficult":
      return "bg-orange-100 text-orange-800";
    case "Very Difficult":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "Yes":
      return "bg-green-100 text-green-800";
    case "Some":
      return "bg-yellow-100 text-yellow-800";
    case "No":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const renderStarRating = (rating?: number) => {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
    </div>
  );
};

export default function CourseMatchingExperienceCard({
  courseMatching,
  showDetailButton = true,
  onViewDetail,
}: CourseMatchingExperienceCardProps) {
  const transferSuccessRate = courseMatching.creditsTransferredSuccessfully && courseMatching.totalCreditsAttempted
    ? Math.round((courseMatching.creditsTransferredSuccessfully / courseMatching.totalCreditsAttempted) * 100)
    : null;

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {courseMatching.studentName}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <GraduationCap className="h-4 w-4" />
                <span>{courseMatching.levelOfStudy} Student</span>
                <span>•</span>
                <span>{courseMatching.homeDepartment}</span>
              </div>
            </div>
          </div>
          <Badge className={getDifficultyColor(courseMatching.courseMatchingDifficult)}>
            {courseMatching.courseMatchingDifficult}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* University Exchange Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">From:</span>
              <p className="text-gray-900">{courseMatching.homeUniversity}</p>
              <p className="text-gray-600">{courseMatching.homeDepartment}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">To:</span>
              <p className="text-gray-900">{courseMatching.hostUniversity}</p>
              <p className="text-gray-600">{courseMatching.hostDepartment}</p>
            </div>
          </div>
        </div>

        {/* Course Matching Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courseMatching.hostCourseCount}
            </div>
            <div className="text-xs text-gray-600">Host Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {courseMatching.homeCourseCount}
            </div>
            <div className="text-xs text-gray-600">Home Equivalents</div>
          </div>
          {transferSuccessRate && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {transferSuccessRate}%
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          )}
          {courseMatching.timeSpentOnMatching && (
            <div className="text-center">
              <div className="text-sm font-bold text-orange-600">
                {courseMatching.timeSpentOnMatching}
              </div>
              <div className="text-xs text-gray-600">Time Spent</div>
            </div>
          )}
        </div>

        {/* Ratings */}
        {(courseMatching.overallAcademicExperience || courseMatching.teachingQuality) && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Academic Experience</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseMatching.overallAcademicExperience && (
                <div>
                  <span className="text-sm text-gray-600">Overall Experience:</span>
                  {renderStarRating(courseMatching.overallAcademicExperience)}
                </div>
              )}
              {courseMatching.teachingQuality && (
                <div>
                  <span className="text-sm text-gray-600">Teaching Quality:</span>
                  {renderStarRating(courseMatching.teachingQuality)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Recommends courses:
            </span>
            <Badge className={getRecommendationColor(courseMatching.recommendCourses)}>
              {courseMatching.recommendCourses}
            </Badge>
          </div>
        </div>

        {/* Key Insight or Advice */}
        {(courseMatching.academicAdviceForFuture || courseMatching.courseSelectionTips || courseMatching.biggestCourseChallenge) && (
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Key Advice</span>
            </div>
            <p className="text-sm text-blue-800">
              {courseMatching.academicAdviceForFuture ||
               courseMatching.courseSelectionTips ||
               courseMatching.biggestCourseChallenge}
            </p>
          </div>
        )}

        {/* Course Details Preview */}
        {courseMatching.hostCourses && courseMatching.hostCourses.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sample Courses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {courseMatching.hostCourses.slice(0, 4).map((course, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="font-medium text-gray-900">{course.name}</div>
                  <div className="flex items-center gap-2 text-gray-600">
                    {course.code && <span>{course.code}</span>}
                    <span>•</span>
                    <span>{course.ects} ECTS</span>
                    {course.difficulty && (
                      <>
                        <span>•</span>
                        <span className="text-xs">{course.difficulty}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {courseMatching.hostCourses.length > 4 && (
              <p className="text-sm text-gray-600 mt-2">
                +{courseMatching.hostCourses.length - 4} more courses
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showDetailButton && (
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{courseMatching.hostUniversity}</span>
            </div>
            {onViewDetail && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetail(courseMatching.id)}
                className="flex items-center gap-2"
              >
                <span>View Details</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
