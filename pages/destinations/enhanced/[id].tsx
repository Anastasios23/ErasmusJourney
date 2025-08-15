import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Header from "../../../components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../src/components/ui/tabs";
import { Badge } from "../../../src/components/ui/badge";
import { Button } from "../../../src/components/ui/button";
import {
  MapPin,
  Star,
  Euro,
  Users,
  Home,
  BookOpen,
  Calendar,
  TrendingUp,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  Award,
  PieChart,
  BarChart3,
} from "lucide-react";
import { ContentIntegrationService } from "../../../src/services/contentIntegrationService";

interface EnhancedDestinationData {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  featured: boolean;

  stats: {
    totalStudents: number;
    averageRating: number | null;
    averageCost: number | null;
    submissionCount: number;
    lastUpdated: Date;
  };

  accommodation: {
    types: Record<string, number>;
    averageRent: number | null;
    rentRange: { min: number; max: number } | null;
    popularOptions: [string, number][];
  };

  courses: {
    popularDepartments: [string, number][];
    averageCourseCount: number | null;
    difficultyDistribution: Record<string, number>;
  };

  livingCosts: {
    breakdown: {
      rent: number | null;
      food: number | null;
      transport: number | null;
      entertainment: number | null;
    };
    totalMonthly: number | null;
  };

  userExperiences: {
    id: string;
    title: string;
    excerpt: string;
    rating: number | null;
    author: string;
    createdAt: Date;
  }[];

  seo: {
    title: string;
    description: string;
    keywords: string[];
    metaImage?: string;
  };
}

export default function EnhancedDestinationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [destination, setDestination] =
    useState<EnhancedDestinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchDestination(id);
    }
  }, [id]);

  const fetchDestination = async (destinationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await ContentIntegrationService.getEnhancedDestinationForPublic(
          destinationId,
        );

      if (!data) {
        setError("Destination not found");
        return;
      }

      setDestination(data);

      // Track page view
      ContentIntegrationService.trackContentInteraction(
        destinationId,
        "destination",
        "page_view",
      );
    } catch (err) {
      console.error("Error fetching destination:", err);
      setError("Failed to load destination");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Destination not found"}
          </h2>
          <p className="text-gray-600 mb-6">
            The destination you're looking for doesn't exist or isn't published
            yet.
          </p>
          <Button onClick={() => router.push("/destinations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Destinations
          </Button>
        </div>
      </div>
    );
  }

  const chartData = {
    accommodationTypes: Object.entries(destination.accommodation.types),
    departments: destination.courses.popularDepartments.slice(0, 5),
    difficulty: Object.entries(destination.courses.difficultyDistribution),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{destination.seo.title}</title>
        <meta name="description" content={destination.seo.description} />
        <meta name="keywords" content={destination.seo.keywords.join(", ")} />
        {destination.seo.metaImage && (
          <meta property="og:image" content={destination.seo.metaImage} />
        )}
        <meta property="og:title" content={destination.seo.title} />
        <meta property="og:description" content={destination.seo.description} />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="relative h-96 mt-16">
        {destination.imageUrl ? (
          <Image
            src={destination.imageUrl}
            alt={destination.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-700" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 mb-4"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-bold">
                  {destination.name}
                </h1>
                {destination.featured && (
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Award className="h-4 w-4 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <p className="text-xl md:text-2xl mb-6 max-w-3xl">
                {destination.description}
              </p>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>
                    {destination.stats.totalStudents} student experiences
                  </span>
                </div>
                {destination.stats.averageRating && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>{destination.stats.averageRating.toFixed(1)}/5</span>
                  </div>
                )}
                {destination.stats.averageCost && (
                  <div className="flex items-center">
                    <Euro className="h-5 w-5 mr-2 text-green-400" />
                    <span>
                      €{Math.round(destination.stats.averageCost)}/month
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="accommodation">Housing</TabsTrigger>
                  <TabsTrigger value="academics">Academics</TabsTrigger>
                  <TabsTrigger value="experiences">Stories</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Key Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Key Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {destination.stats.totalStudents}
                          </div>
                          <div className="text-sm text-gray-600">Students</div>
                        </div>

                        {destination.stats.averageRating && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">
                              {destination.stats.averageRating.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Avg. Rating
                            </div>
                          </div>
                        )}

                        {destination.livingCosts.totalMonthly && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              €
                              {Math.round(destination.livingCosts.totalMonthly)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Monthly Cost
                            </div>
                          </div>
                        )}

                        {destination.accommodation.averageRent && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                              €
                              {Math.round(
                                destination.accommodation.averageRent,
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Avg. Rent
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Living Costs Breakdown */}
                  {destination.livingCosts.breakdown && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Euro className="h-5 w-5 mr-2" />
                          Monthly Living Costs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(
                            destination.livingCosts.breakdown,
                          ).map(
                            ([category, amount]) =>
                              amount && (
                                <div
                                  key={category}
                                  className="flex items-center justify-between"
                                >
                                  <span className="capitalize text-gray-600">
                                    {category}
                                  </span>
                                  <span className="font-semibold">
                                    €{Math.round(amount)}
                                  </span>
                                </div>
                              ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="accommodation" className="space-y-6">
                  {/* Accommodation Types */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Home className="h-5 w-5 mr-2" />
                        Accommodation Types
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {chartData.accommodationTypes.map(([type, count]) => (
                          <div
                            key={type}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-600">{type}</span>
                            <Badge variant="outline">{count} students</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rent Range */}
                  {destination.accommodation.rentRange && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Rent Range</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            €{destination.accommodation.rentRange.min} - €
                            {destination.accommodation.rentRange.max}
                          </div>
                          <div className="text-gray-600">
                            Average: ���
                            {Math.round(
                              destination.accommodation.averageRent || 0,
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="academics" className="space-y-6">
                  {/* Popular Departments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Popular Departments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {chartData.departments.map(([department, count]) => (
                          <div
                            key={department}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-700">{department}</span>
                            <Badge variant="outline">{count} students</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Course Difficulty */}
                  {chartData.difficulty.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Difficulty</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {chartData.difficulty.map(([level, count]) => (
                            <div
                              key={level}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">{level}</span>
                              <Badge variant="outline">{count} reports</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="experiences" className="space-y-6">
                  {/* Student Experiences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Student Stories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {destination.userExperiences.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            No student stories available yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {destination.userExperiences.map((experience) => (
                            <div
                              key={experience.id}
                              className="border-b border-gray-200 pb-6 last:border-b-0"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">
                                  {experience.title}
                                </h4>
                                {experience.rating && (
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                    <span className="text-sm">
                                      {experience.rating}/5
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 mb-3">
                                {experience.excerpt}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <span>by {experience.author}</span>
                                <span className="mx-2">•</span>
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {new Date(
                                    experience.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => router.push("/erasmus-experience-form")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Share Your Experience
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save Destination
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </CardContent>
              </Card>

              {/* Data Freshness */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {new Date(
                          destination.stats.lastUpdated,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Based on:</span>
                      <span className="font-medium">
                        {destination.stats.submissionCount} submissions
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-3">
                      All data is based on real student experiences and is
                      regularly updated.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Destinations */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Destinations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-4">
                    Other popular destinations in {destination.country}
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 h-auto"
                      onClick={() =>
                        router.push(
                          "/destinations?country=" +
                            encodeURIComponent(destination.country),
                        )
                      }
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">
                          View All in {destination.country}
                        </div>
                        <div className="text-xs text-gray-500">
                          Browse all destinations
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 h-auto"
                      onClick={() =>
                        router.push(
                          "/destinations?search=" +
                            encodeURIComponent(destination.city),
                        )
                      }
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">
                          Similar Cities
                        </div>
                        <div className="text-xs text-gray-500">
                          Find cities like {destination.city}
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
