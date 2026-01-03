import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import CourseMatchingExperienceCard from "./CourseMatchingExperienceCard";
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface CourseMatchingInsight {
  totalExperiences: number;
  avgDifficulty: number;
  difficultyBreakdown: Record<string, number>;
  avgCoursesMatched: number;
  avgCreditsTransferred: number;
  successRate: number;
  recommendationRate: number;
  commonChallenges: string[];
  topAdvice: string[];
  departmentInsights: Array<{
    department: string;
    studentCount: number;
    avgDifficulty: number;
    avgSuccess: number;
  }>;
  experiences: Array<{
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
  }>;
}

interface CourseMatchingInsightsProps {
  city: string;
  country: string;
  university?: string;
  className?: string;
}

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 2) return "bg-green-100 text-green-800";
  if (difficulty <= 3) return "bg-yellow-100 text-yellow-800";
  if (difficulty <= 4) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty <= 1.5) return "Very Easy";
  if (difficulty <= 2.5) return "Easy";
  if (difficulty <= 3.5) return "Moderate";
  if (difficulty <= 4.5) return "Difficult";
  return "Very Difficult";
};

export default function CourseMatchingInsights({
  city,
  country,
  university,
  className = "",
}: CourseMatchingInsightsProps) {
  const [insights, setInsights] = useState<CourseMatchingInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseMatchingInsights();
  }, [city, country, university]);

  const fetchCourseMatchingInsights = async () => {
    try {
      setLoading(true);
      let url = `/api/course-matching/insights?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
      if (university) {
        url += `&university=${encodeURIComponent(university)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          setInsights(null);
          return;
        }
        throw new Error("Failed to fetch course matching insights");
      }
      const data = await response.json();
      setInsights(data.insights || null);
    } catch (err) {
      console.error("Error fetching course matching insights:", err);
      setError("Failed to load course matching insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!insights || insights.totalExperiences === 0) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Matching Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Course Matching Data Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share your course matching experience in {city}!
              </p>
              <Link href="/share-experience">
                <Button>
                  Share Your Experience
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Matching Insights
            </CardTitle>
            <Link
              href={`/course-matching-experiences?destination=${city}, ${country}`}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                View All
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-600">
            Based on {insights.totalExperiences} course matching experiences
            from students in {city}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insights.avgCoursesMatched}
              </div>
              <div className="text-sm text-blue-800">Avg Courses Matched</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(insights.successRate)}%
              </div>
              <div className="text-sm text-green-800">Success Rate</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(insights.recommendationRate)}%
              </div>
              <div className="text-sm text-purple-800">Recommend</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Badge className={getDifficultyColor(insights.avgDifficulty)}>
                {getDifficultyLabel(insights.avgDifficulty)}
              </Badge>
              <div className="text-sm text-orange-800 mt-1">Avg Difficulty</div>
            </div>
          </div>

          {/* Department Insights */}
          {insights.departmentInsights.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                By Department
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.departmentInsights.slice(0, 4).map((dept, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {dept.department}
                      </span>
                      <Badge variant="outline">
                        {dept.studentCount} students
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Difficulty: {dept.avgDifficulty}/5</span>
                      {dept.avgSuccess > 0 && (
                        <span>Success: {dept.avgSuccess}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Advice */}
          {insights.topAdvice.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Top Advice from Students
              </h3>
              <div className="space-y-3">
                {insights.topAdvice.slice(0, 3).map((advice, index) => (
                  <div
                    key={index}
                    className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400"
                  >
                    <p className="text-sm text-green-800">{advice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Challenges */}
          {insights.commonChallenges.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Common Challenges
              </h3>
              <div className="space-y-3">
                {insights.commonChallenges
                  .slice(0, 3)
                  .map((challenge, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400"
                    >
                      <p className="text-sm text-yellow-800">{challenge}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Experiences */}
          {insights.experiences.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recent Student Experiences
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {insights.experiences.slice(0, 2).map((experience) => (
                  <CourseMatchingExperienceCard
                    key={experience.id}
                    courseMatching={experience}
                    showDetailButton={false}
                  />
                ))}
              </div>
              {insights.experiences.length > 2 && (
                <div className="text-center mt-4">
                  <Link
                    href={`/course-matching-experiences?destination=${city}, ${country}`}
                  >
                    <Button variant="outline">
                      View All {insights.totalExperiences} Experiences
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
