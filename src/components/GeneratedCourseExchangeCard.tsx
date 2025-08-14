import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  GraduationCap,
  User,
  Star,
  Calendar,
  Book,
  Award,
  Target,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import { GeneratedCourseExchange } from "../hooks/useGeneratedDestinations";

interface GeneratedCourseExchangeCardProps {
  courseExchange: GeneratedCourseExchange;
  isCompact?: boolean;
}

export default function GeneratedCourseExchangeCard({
  courseExchange,
  isCompact = false,
}: GeneratedCourseExchangeCardProps) {
  const renderRating = (
    rating: number | undefined,
    label: string,
    icon: React.ReactNode,
  ) => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3 w-3 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`${isCompact ? "h-fit" : ""} hover:shadow-md transition-shadow`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {courseExchange.title}
            </CardTitle>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                <span>{courseExchange.hostUniversity}</span>
              </div>
              {courseExchange.studentName && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>by {courseExchange.studentName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {courseExchange.studyLevel && (
              <Badge variant="secondary" className="text-xs">
                {courseExchange.studyLevel}
              </Badge>
            )}
            {courseExchange.featured && (
              <Badge variant="default" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Academic Details */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          {courseExchange.fieldOfStudy && (
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Field</div>
                <div className="text-sm font-medium">
                  {courseExchange.fieldOfStudy}
                </div>
              </div>
            </div>
          )}
          {courseExchange.semester && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-500">Semester</div>
                <div className="text-sm font-medium">
                  {courseExchange.semester}
                </div>
              </div>
            </div>
          )}
          {courseExchange.creditsEarned && (
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-xs text-gray-500">ECTS</div>
                <div className="text-sm font-medium">
                  {courseExchange.creditsEarned}
                </div>
              </div>
            </div>
          )}
          {courseExchange.language && (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 text-orange-600 text-sm">🌐</span>
              <div>
                <div className="text-xs text-gray-500">Language</div>
                <div className="text-sm font-medium">
                  {courseExchange.language}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="text-gray-700">
          <p className={`${isCompact ? "line-clamp-3" : ""}`}>
            {courseExchange.description}
          </p>
        </div>

        {/* Ratings */}
        {!isCompact &&
          (courseExchange.courseQuality ||
            courseExchange.professorQuality ||
            courseExchange.facilityQuality) && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-800">
                Academic Ratings
              </h4>
              <div className="space-y-2">
                {renderRating(
                  courseExchange.courseQuality,
                  "Course Quality",
                  <Book className="h-4 w-4 text-blue-600" />,
                )}
                {renderRating(
                  courseExchange.professorQuality,
                  "Professors",
                  <User className="h-4 w-4 text-green-600" />,
                )}
                {renderRating(
                  courseExchange.facilityQuality,
                  "Facilities",
                  <CheckCircle className="h-4 w-4 text-purple-600" />,
                )}
              </div>
            </div>
          )}

        {/* Courses Enrolled */}
        {!isCompact &&
          courseExchange.coursesEnrolled &&
          courseExchange.coursesEnrolled.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-800">
                Courses Taken
              </h4>
              <div className="space-y-2">
                {courseExchange.coursesEnrolled.map((course, index) => (
                  <div
                    key={index}
                    className="p-2 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-blue-900">
                        {course.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {course.credits} ECTS
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= course.difficulty
                                  ? "fill-red-400 text-red-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {course.recommendation && (
                      <p className="text-xs text-blue-700 mt-1">
                        {course.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Academic Highlights */}
        {!isCompact && courseExchange.academicHighlights && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium text-sm">Academic Highlights</span>
            </div>
            <p className="text-sm text-gray-600 p-3 bg-green-50 border border-green-200 rounded-lg">
              {courseExchange.academicHighlights}
            </p>
          </div>
        )}

        {/* Academic Challenges */}
        {!isCompact && courseExchange.academicChallenges && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-700">
              <TrendingDown className="h-4 w-4" />
              <span className="font-medium text-sm">Challenges Faced</span>
            </div>
            <p className="text-sm text-gray-600 p-3 bg-red-50 border border-red-200 rounded-lg">
              {courseExchange.academicChallenges}
            </p>
          </div>
        )}

        {/* Tips */}
        {!isCompact &&
          courseExchange.tips &&
          courseExchange.tips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <Lightbulb className="h-4 w-4" />
                <span className="font-medium text-sm">Academic Tips</span>
              </div>
              <ul className="space-y-1">
                {courseExchange.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-1"
                  >
                    <span className="text-amber-500 text-xs mt-1">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Compact view action */}
        {isCompact && (
          <Button variant="outline" size="sm" className="w-full">
            View Full Experience
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
