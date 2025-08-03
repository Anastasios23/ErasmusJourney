import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Progress } from "../src/components/ui/progress";
import {
  Users,
  Euro,
  Star,
  Home,
  ThumbsUp,
  TrendingUp,
  MapPin,
  GraduationCap,
  Lightbulb,
  BarChart3,
  PieChart,
} from "lucide-react";

interface EnhancedCityData {
  city: string;
  country: string;
  totalSubmissions: number;
  livingCosts: {
    avgMonthlyRent: number;
    avgMonthlyFood: number;
    avgMonthlyTransport: number;
    avgMonthlyEntertainment: number;
    avgMonthlyUtilities: number;
    avgMonthlyOther: number;
    avgTotalMonthly: number;
    costSubmissions: number;
  };
  ratings: {
    avgOverallRating: number;
    avgAcademicRating: number;
    avgSocialLifeRating: number;
    avgCulturalImmersionRating: number;
    avgCostOfLivingRating: number;
    avgAccommodationRating: number;
    ratingSubmissions: number;
  };
  accommodation: {
    types: Array<{
      type: string;
      count: number;
      avgRent: number;
      percentage: number;
    }>;
    totalAccommodationSubmissions: number;
  };
  recommendations: {
    wouldRecommendCount: number;
    totalRecommendationResponses: number;
    recommendationPercentage: number;
  };
  topTips: Array<{
    category: string;
    tip: string;
    frequency: number;
  }>;
  universities: Array<{
    name: string;
    studentCount: number;
  }>;
  // Enhanced fields
  studentProfiles?: Array<{
    id: string;
    university: string;
    studyPeriod: string;
    fieldOfStudy: string;
    totalMonthlyCost: number;
    overallRating: number;
    accommodationType: string;
    topTip: string;
  }>;
  statisticalInsights?: {
    costVariability: {
      minMonthlyCost: number;
      maxMonthlyCost: number;
      medianMonthlyCost: number;
      costRanges: Array<{
        range: string;
        percentage: number;
        count: number;
      }>;
    };
    consensusMetrics: {
      commonExperiences: Array<{
        experience: string;
        studentCount: number;
        percentage: number;
      }>;
      disagreementAreas: Array<{
        topic: string;
        variance: number;
        explanation: string;
      }>;
    };
    temporalInsights: {
      bestMonthsToArrive: Array<{
        month: string;
        studentCount: number;
        avgSatisfaction: number;
      }>;
      semesterBreakdown: {
        fall: number;
        spring: number;
        fullYear: number;
      };
    };
  };
  studentComparisons?: Array<{
    category: string;
    groups: Array<{
      label: string;
      studentCount: number;
      avgCost: number;
      avgRating: number;
      characteristics: string[];
    }>;
  }>;
}

interface EnhancedStudentDataProps {
  city: string;
  country: string;
  className?: string;
}

export function EnhancedStudentData({
  city,
  country,
  className,
}: EnhancedStudentDataProps) {
  const [data, setData] = useState<EnhancedCityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnhancedCityData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching enhanced city data for ${city}, ${country}`);
        const response = await fetch(
          `/api/destinations/city-enhanced?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&enhanced=true`,
        );

        console.log(`API response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API error response:", errorData);

          if (response.status === 404) {
            setError(`No student data available for ${city}, ${country} yet.`);
          } else if (response.status === 500) {
            setError(
              `Server error while loading data for ${city}. Please try again later.`,
            );
          } else {
            setError(
              errorData?.message ||
                `Failed to fetch city data: ${response.statusText}`,
            );
          }
          return;
        }

        const result = await response.json();
        console.log("Enhanced API response data:", result);

        if (result.success && result.data) {
          setData(result.data);
          setError(null);
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching enhanced city data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load city data",
        );
      } finally {
        setLoading(false);
      }
    };

    if (city && country) {
      fetchEnhancedCityData();
    } else {
      setLoading(false);
      setError("Missing city or country information");
    }
  }, [city, country]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enhanced Student Data
            </CardTitle>
            <CardDescription>
              Loading comprehensive student insights for {city}...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enhanced Student Data
          </CardTitle>
          <CardDescription>{error || "No data available"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Be the first to share your experience in {city}!
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStarRating = (rating: number, size: "sm" | "md" = "sm") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} ${
            i < fullStars
              ? "fill-yellow-400 text-yellow-400"
              : i === fullStars && hasHalfStar
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
          }`}
        />,
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enhanced Student Insights from {data.totalSubmissions} Students
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of student experiences in {data.city},{" "}
            {data.country}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.totalSubmissions}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.livingCosts.avgTotalMonthly)}
              </div>
              <div className="text-sm text-gray-600">Avg Monthly Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data.ratings.avgOverallRating.toFixed(1)}/5
              </div>
              <div className="text-sm text-gray-600">Overall Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.recommendations.recommendationPercentage}%
              </div>
              <div className="text-sm text-gray-600">Would Recommend</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Distribution */}
      {data.statisticalInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Cost Distribution
            </CardTitle>
            <CardDescription>
              How much students actually spend per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.statisticalInsights.costVariability.costRanges.map(
                (range, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{range.range}</span>
                      <span className="text-sm text-gray-600">
                        {range.count} students ({range.percentage}%)
                      </span>
                    </div>
                    <Progress value={range.percentage} className="h-2" />
                  </div>
                ),
              )}

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Minimum:</span>
                    <div className="font-semibold">
                      {formatCurrency(
                        data.statisticalInsights.costVariability.minMonthlyCost,
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Median:</span>
                    <div className="font-semibold">
                      {formatCurrency(
                        data.statisticalInsights.costVariability
                          .medianMonthlyCost,
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Maximum:</span>
                    <div className="font-semibold">
                      {formatCurrency(
                        data.statisticalInsights.costVariability.maxMonthlyCost,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Consensus */}
      {data.statisticalInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Common Experiences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                What Students Agree On
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.statisticalInsights.consensusMetrics.commonExperiences.map(
                  (exp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{exp.experience}</span>
                      <Badge variant="secondary">
                        {exp.studentCount}/{data.totalSubmissions} students
                      </Badge>
                    </div>
                  ),
                )}
                {data.statisticalInsights.consensusMetrics.commonExperiences
                  .length === 0 && (
                  <p className="text-sm text-gray-600">
                    Not enough data for consensus analysis
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mixed Experiences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mixed Experiences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.statisticalInsights.consensusMetrics.disagreementAreas.map(
                  (area, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="font-medium text-sm">{area.topic}</div>
                      <div className="text-xs text-gray-600">
                        {area.explanation}
                      </div>
                    </div>
                  ),
                )}
                {data.statisticalInsights.consensusMetrics.disagreementAreas
                  .length === 0 && (
                  <p className="text-sm text-gray-600">
                    Students generally agree on most aspects
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Comparisons */}
      {data.studentComparisons && data.studentComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Student Comparisons
            </CardTitle>
            <CardDescription>
              Compare experiences by different student groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.studentComparisons.map((comparison, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold mb-3">
                    By {comparison.category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {comparison.groups.map((group, groupIdx) => (
                      <div key={groupIdx} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm mb-2">
                          {group.label}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {group.studentCount} students
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Avg Cost:</span>
                            <span className="font-medium">
                              {formatCurrency(group.avgCost)}
                            </span>
                          </div>
                          {group.avgRating > 0 && (
                            <div className="flex justify-between text-xs">
                              <span>Rating:</span>
                              <span className="font-medium">
                                ⭐ {group.avgRating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Student Profiles */}
      {data.studentProfiles && data.studentProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Individual Student Experiences
            </CardTitle>
            <CardDescription>
              Real experiences from students (anonymized)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.studentProfiles.slice(0, 9).map((student, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-blue-600">
                      {student.id}
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStarRating(student.overallRating, "sm")}
                      <span className="text-xs text-gray-600 ml-1">
                        {student.overallRating}/5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div>🎓 {student.university}</div>
                    <div>📚 {student.fieldOfStudy}</div>
                    <div>📅 {student.studyPeriod}</div>
                    <div>🏠 {student.accommodationType}</div>
                    {student.totalMonthlyCost > 0 && (
                      <div>
                        💰 {formatCurrency(student.totalMonthlyCost)}/month
                      </div>
                    )}
                  </div>

                  {student.topTip && (
                    <div className="bg-yellow-50 p-2 rounded text-xs">
                      <span className="font-medium text-yellow-800">
                        💡 Tip:{" "}
                      </span>
                      <span className="text-yellow-700">{student.topTip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {data.studentProfiles.length > 9 && (
              <div className="text-center mt-4">
                <Badge variant="outline">
                  +{data.studentProfiles.length - 9} more student experiences
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Temporal Insights */}
      {data.statisticalInsights?.temporalInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Best Times to Arrive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.statisticalInsights.temporalInsights.bestMonthsToArrive.map(
                (month, idx) => (
                  <div key={idx} className="text-center p-3 border rounded-lg">
                    <div className="font-semibold">{month.month}</div>
                    <div className="text-sm text-gray-600">
                      {month.studentCount} students
                    </div>
                    <div className="text-xs text-gray-500">
                      ⭐ {month.avgSatisfaction}/5 satisfaction
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EnhancedStudentData;
