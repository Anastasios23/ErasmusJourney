import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import {
  Loader2,
  MapPin,
  Users,
  Euro,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Archive,
} from "lucide-react";
import Link from "next/link";

interface Analytics {
  overview: {
    totalDestinations: number;
    publishedDestinations: number;
    draftDestinations: number;
    featuredDestinations: number;
    totalAccommodations: number;
    totalCourseExchanges: number;
    totalSubmissions: number;
  };
  averages: {
    averageRating?: number;
    averageMonthlyCost?: number;
    averageSubmissionsPerDestination?: number;
  };
  topDestinations: Array<{
    id: string;
    city: string;
    country: string;
    totalSubmissions: number;
    averageRating?: number;
    status: string;
  }>;
  recentDestinations: Array<{
    id: string;
    city: string;
    country: string;
    status: string;
    createdAt: string;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  monthlyTrends: Record<string, number>;
}

function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
  });
}

const statusColors = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  DRAFT: Clock,
  PUBLISHED: CheckCircle,
  ARCHIVED: Archive,
};

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error loading analytics
          </h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Overview of generated destinations and student submissions
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Destinations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.totalDestinations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.publishedDestinations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.featuredDestinations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.totalSubmissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Rating
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {analytics.averages.averageRating?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Euro className="w-6 h-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Monthly Cost
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {analytics.averages.averageMonthlyCost
                      ? `€${Math.round(analytics.averages.averageMonthlyCost)}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Submissions/Dest
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {analytics.averages.averageSubmissionsPerDestination?.toFixed(
                      1,
                    ) || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Destinations by Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topDestinations.map((destination, index) => (
                  <div
                    key={destination.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <Link
                          href={`/admin/destinations/${destination.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {destination.city}, {destination.country}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={
                              statusColors[
                                destination.status as keyof typeof statusColors
                              ]
                            }
                          >
                            {destination.status}
                          </Badge>
                          {destination.averageRating && (
                            <span className="text-sm text-gray-600">
                              ★ {destination.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {destination.totalSubmissions}
                      </p>
                      <p className="text-sm text-gray-600">submissions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recently Created Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentDestinations.map((destination) => {
                  const StatusIcon =
                    statusIcons[destination.status as keyof typeof statusIcons];

                  return (
                    <div
                      key={destination.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <Link
                            href={`/admin/destinations/${destination.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {destination.city}, {destination.country}
                          </Link>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              destination.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          statusColors[
                            destination.status as keyof typeof statusColors
                          ]
                        }
                      >
                        {destination.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.statusDistribution.map((item) => {
                const StatusIcon =
                  statusIcons[item.status as keyof typeof statusIcons];

                return (
                  <div key={item.status} className="text-center">
                    <StatusIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-2xl font-bold text-gray-900">
                      {item.count}
                    </p>
                    <p className="text-sm text-gray-600">{item.status}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin-generated-destinations"
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Manage Destinations
                    </p>
                    <p className="text-sm text-gray-600">
                      View and edit all destinations
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/api/destinations/generate"
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Generate New Destinations
                    </p>
                    <p className="text-sm text-gray-600">
                      Process pending submissions
                    </p>
                  </div>
                </div>
              </Link>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Featured Destinations
                    </p>
                    <p className="text-sm text-gray-600">
                      {analytics.overview.featuredDestinations} currently
                      featured
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
