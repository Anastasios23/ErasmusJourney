import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import { useDestinationAverages } from "../src/hooks/useDestinations";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Skeleton } from "../src/components/ui/skeleton";
import {
  Star,
  Users,
  Euro,
  MapPin,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

const TEST_DESTINATIONS = [
  { id: "berlin_germany", label: "Berlin, Germany" },
  { id: "barcelona_spain", label: "Barcelona, Spain" },
  { id: "prague_czech", label: "Prague, Czech Republic" },
  { id: "amsterdam_netherlands", label: "Amsterdam, Netherlands" },
  { id: "madrid_spain", label: "Madrid, Spain" }, // This one has no data to test empty state
];

export default function TestAveragesPage() {
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const {
    data: averagesData,
    isLoading,
    error,
  } = useDestinationAverages(selectedDestination);

  return (
    <>
      <Head>
        <title>Test Destination Averages - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Test page for destination averages system"
        />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧪 Test Destination Averages System
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              This test page demonstrates how student form submissions are
              aggregated to show destination averages and insights. Select a
              city to see real data!
            </p>

            <div className="max-w-md mx-auto">
              <Select
                value={selectedDestination}
                onValueChange={setSelectedDestination}
              >
                <SelectTrigger>
                  <SelectValue placeholder="🏙️ Select a destination to test" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_DESTINATIONS.map((destination) => (
                    <SelectItem key={destination.id} value={destination.id}>
                      {destination.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          {!selectedDestination ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Select a Destination Above
                </h3>
                <p className="text-gray-600">
                  Choose a destination from the dropdown to see how our
                  destination averages system works with real student data.
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            </div>
          ) : error ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="text-center py-12">
                <div className="text-red-500 mb-4">⚠️</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Error Loading Data
                </h3>
                <p className="text-gray-600">{error.message}</p>
              </CardContent>
            </Card>
          ) : averagesData?.totalSubmissions === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No Data for{" "}
                  {
                    TEST_DESTINATIONS.find((d) => d.id === selectedDestination)
                      ?.label
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  This destination doesn't have any student submission data yet.
                  This demonstrates how the system handles empty states.
                </p>
                <Badge variant="outline">Empty State Test ✅</Badge>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Overview Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    📊 {averagesData?.city} - Student Data Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {averagesData?.totalSubmissions}
                      </div>
                      <div className="text-sm text-gray-600">
                        Student Submissions
                      </div>
                    </div>
                    {averagesData?.averages.ratings.overall && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                          {averagesData.averages.ratings.overall}
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall Rating
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {averagesData?.averages.recommendations.wouldRecommend}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Would Recommend
                      </div>
                    </div>
                    {averagesData?.averages.livingCosts.total && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-1">
                          <Euro className="h-5 w-5" />
                          {averagesData.averages.livingCosts.total}
                        </div>
                        <div className="text-sm text-gray-600">
                          Monthly Cost
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Living Costs */}
                {averagesData?.averages.livingCosts.rent && (
                  <Card>
                    <CardHeader>
                      <CardTitle>💰 Average Living Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>🏠 Rent</span>
                          <span className="font-medium">
                            €{averagesData.averages.livingCosts.rent}/month
                          </span>
                        </div>
                        {averagesData.averages.livingCosts.food && (
                          <div className="flex justify-between items-center">
                            <span>🍽️ Food</span>
                            <span className="font-medium">
                              €{averagesData.averages.livingCosts.food}/month
                            </span>
                          </div>
                        )}
                        {averagesData.averages.livingCosts.transport && (
                          <div className="flex justify-between items-center">
                            <span>🚇 Transport</span>
                            <span className="font-medium">
                              €{averagesData.averages.livingCosts.transport}
                              /month
                            </span>
                          </div>
                        )}
                        {averagesData.averages.livingCosts.entertainment && (
                          <div className="flex justify-between items-center">
                            <span>🎉 Entertainment</span>
                            <span className="font-medium">
                              €{averagesData.averages.livingCosts.entertainment}
                              /month
                            </span>
                          </div>
                        )}
                        <hr />
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span>💸 Total Monthly</span>
                          <span>
                            €{averagesData.averages.livingCosts.total}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Student Ratings */}
                {averagesData?.averages.ratings.overall && (
                  <Card>
                    <CardHeader>
                      <CardTitle>⭐ Student Ratings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(averagesData.averages.ratings).map(
                          ([key, value]) =>
                            value && (
                              <div
                                key={key}
                                className="flex justify-between items-center"
                              >
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.round(value as number)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium">
                                    {value}/5
                                  </span>
                                </div>
                              </div>
                            ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Student Tips */}
              {averagesData?.topTips && averagesData.topTips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>💡 Top Tips from Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {averagesData.topTips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                        >
                          <span className="text-blue-600 font-bold text-lg">
                            💭
                          </span>
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Submissions */}
              {averagesData?.recentSubmissions &&
                averagesData.recentSubmissions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📝 Recent Student Experiences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {averagesData.recentSubmissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="border-l-4 border-green-500 pl-4 py-2"
                          >
                            <h4 className="font-medium">{submission.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {submission.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              <span>👤 {submission.author}</span>
                              <span>
                                📅{" "}
                                {new Date(
                                  submission.createdAt,
                                ).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {submission.type.replace("-", " ")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* CTA */}
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-xl font-bold mb-4">
                    🎯 System Working Perfectly!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This data is calculated in real-time from student form
                    submissions. Try checking out the actual destination pages
                    to see this integrated.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href={`/destinations/${selectedCity.toLowerCase()}_${averagesData?.recentSubmissions[0]?.type === "basic-info" ? "country" : "city"}`}
                    >
                      <Button>
                        View {selectedCity} Destination Page
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/basic-information">
                      <Button variant="outline">
                        Add Your Own Data
                        <Users className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
