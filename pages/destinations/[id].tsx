import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import {
  useDestination,
  useDestinationAverages,
} from "../../src/hooks/useDestinations";
import { useGeneratedContent } from "../../src/hooks/useFormSubmissions";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Separator } from "../../src/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import { Skeleton } from "../../src/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Star,
  Euro,
  Users,
  Calendar,
  Globe,
  GraduationCap,
  Home,
  Utensils,
  Train,
  Heart,
  Share2,
  BookOpen,
  ExternalLink,
  List,
  TrendingUp,
} from "lucide-react";

interface TableOfContentsProps {
  destination: any;
}

function TableOfContents({ destination }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "overview",
        "universities",
        "costs",
        "life",
        "practical",
      ];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.querySelector(`[data-section="${section}"]`);
        if (element) {
          const { offsetTop, offsetHeight } = element as HTMLElement;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "universities", label: "Universities", icon: GraduationCap },
    { id: "student-data", label: "Student Data", icon: Users },
    { id: "costs", label: "Living Costs", icon: Euro },
    { id: "life", label: "Student Life", icon: Star },
    { id: "practical", label: "Practical Info", icon: List },
  ];

  return (
    <Card className="sticky top-24 h-fit">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === section.id
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function DestinationDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: destination, isLoading, error } = useDestination(id as string);
  const { data: averagesData, isLoading: averagesLoading } =
    useDestinationAverages(id as string);
  const { content: userGeneratedContent } = useGeneratedContent();

  // Filter user content relevant to this destination
  const relevantUserContent =
    userGeneratedContent?.filter(
      (content: any) =>
        content.data?.city?.toLowerCase() ===
          destination?.city?.toLowerCase() ||
        content.data?.country?.toLowerCase() ===
          destination?.country?.toLowerCase(),
    ) || [];

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-96 w-full" />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Skeleton className="h-64 w-full" />
                <div className="lg:col-span-3 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !destination) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Destination Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The destination you're looking for doesn't exist or has been
                moved.
              </p>
              <Link href="/destinations">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Destinations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          {destination.city}, {destination.country} - Study Abroad | Erasmus
          Journey
        </title>
        <meta
          name="description"
          content={`Discover study abroad opportunities in ${destination.city}, ${destination.country}. ${destination.description}`}
        />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 inline-flex items-center"
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link
                    href="/destinations"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Destinations
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">{destination.city}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Hero Image */}
              <div className="lg:col-span-2">
                <div className="aspect-video rounded-lg overflow-hidden relative">
                  <Image
                    src={destination.imageUrl}
                    alt={`${destination.city}, ${destination.country}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">
                        {destination.city}, {destination.country}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cost Level</span>
                      <Badge
                        variant={
                          destination.costOfLiving === "low"
                            ? "default"
                            : destination.costOfLiving === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {destination.costOfLiving}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. Rent</span>
                      <span className="font-medium">
                        €{destination.averageRent}/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="font-medium">
                        {destination.language}
                      </span>
                    </div>

                    {destination.detailedInfo && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Population</span>
                        <span className="font-medium">
                          {destination.detailedInfo.population.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        aria-label={`Add ${destination.city} to favorites`}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        aria-label={`Share ${destination.city} destination page`}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Title and Description */}
            <div className="px-6 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Study in {destination.city}
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {destination.description}
              </p>

              {/* Popular Programs */}
              <div className="flex flex-wrap gap-2">
                {destination.popularWith.map((program, index) => (
                  <Badge key={index} variant="secondary">
                    {program}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content with Table of Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <TableOfContents destination={destination} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="universities">Universities</TabsTrigger>
                  <TabsTrigger value="student-data">Student Data</TabsTrigger>
                  <TabsTrigger value="costs">Living Costs</TabsTrigger>
                  <TabsTrigger value="life">Student Life</TabsTrigger>
                  <TabsTrigger value="practical">Practical Info</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="overview"
                  className="space-y-6"
                  data-section="overview"
                >
                  {/* University Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Main University
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2">
                        {destination.university}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Partner universities:{" "}
                        {destination.partnerUniversities.join(", ")}
                      </p>
                      <Link
                        href={`/university-exchanges?search=${destination.university}`}
                      >
                        <Button variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Exchange Programs
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* User Generated Content */}
                  {relevantUserContent.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Experiences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {relevantUserContent
                            .slice(0, 3)
                            .map((content: any, index: number) => (
                              <div
                                key={index}
                                className="border-l-4 border-blue-500 pl-4"
                              >
                                <h4 className="font-medium">{content.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {content.data?.description ||
                                    "Student experience shared"}
                                </p>
                              </div>
                            ))}
                          {relevantUserContent.length > 3 && (
                            <p className="text-sm text-gray-500">
                              ...and {relevantUserContent.length - 3} more
                              experiences
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="universities" data-section="universities">
                  <Card>
                    <CardHeader>
                      <CardTitle>University Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">
                            {destination.university}
                          </h3>
                          <p className="text-gray-600">
                            ({destination.universityShort})
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">
                            Partner Universities in Cyprus:
                          </h4>
                          <ul className="space-y-1">
                            {destination.partnerUniversities.map(
                              (uni, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <GraduationCap className="h-4 w-4 text-blue-600" />
                                  {uni}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="student-data" data-section="student-data">
                  {averagesLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : averagesData?.totalSubmissions > 0 ? (
                    <div className="space-y-6">
                      {/* Overview Stats */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            📊 {averagesData.city} - Student Data Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600">
                                {averagesData.totalSubmissions}
                              </div>
                              <div className="text-sm text-gray-600">
                                Student Submissions
                              </div>
                            </div>
                            {averagesData.averages.ratings.overall && (
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
                                {
                                  averagesData.averages.recommendations
                                    .wouldRecommend
                                }
                                %
                              </div>
                              <div className="text-sm text-gray-600">
                                Would Recommend
                              </div>
                            </div>
                            {averagesData.averages.livingCosts.total && (
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

                      {/* Living Costs from Students */}
                      {averagesData.averages.livingCosts.rent && (
                        <Card>
                          <CardHeader>
                            <CardTitle>💰 Average Living Costs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span>🏠 Rent</span>
                                <span className="font-medium">
                                  €{averagesData.averages.livingCosts.rent}
                                  /month
                                </span>
                              </div>
                              {averagesData.averages.livingCosts.food && (
                                <div className="flex justify-between items-center">
                                  <span>🍽️ Food</span>
                                  <span className="font-medium">
                                    €{averagesData.averages.livingCosts.food}
                                    /month
                                  </span>
                                </div>
                              )}
                              {averagesData.averages.livingCosts.transport && (
                                <div className="flex justify-between items-center">
                                  <span>🚇 Transport</span>
                                  <span className="font-medium">
                                    €
                                    {
                                      averagesData.averages.livingCosts
                                        .transport
                                    }
                                    /month
                                  </span>
                                </div>
                              )}
                              {averagesData.averages.livingCosts
                                .entertainment && (
                                <div className="flex justify-between items-center">
                                  <span>🎉 Entertainment</span>
                                  <span className="font-medium">
                                    €
                                    {
                                      averagesData.averages.livingCosts
                                        .entertainment
                                    }
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
                      {averagesData.averages.ratings.overall && (
                        <Card>
                          <CardHeader>
                            <CardTitle>⭐ Student Ratings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {Object.entries(
                                averagesData.averages.ratings,
                              ).map(
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
                                        <span className="text-sm text-gray-600">
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

                      {/* Top Tips from Students */}
                      {averagesData.topTips.length > 0 && (
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

                      {/* Accommodation Types */}
                      {averagesData.accommodationTypes.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Popular Accommodation Types</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {averagesData.accommodationTypes.map(
                                (accommodation, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center"
                                  >
                                    <div>
                                      <span className="font-medium">
                                        {accommodation.type}
                                      </span>
                                      <span className="text-sm text-gray-600 ml-2">
                                        ({accommodation.count} students)
                                      </span>
                                    </div>
                                    {accommodation.averageRent && (
                                      <span className="font-medium">
                                        €{accommodation.averageRent}/month
                                      </span>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recent Submissions */}
                      {averagesData.recentSubmissions.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Student Experiences</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {averagesData.recentSubmissions.map(
                                (submission) => (
                                  <div
                                    key={submission.id}
                                    className="border-l-4 border-blue-500 pl-4"
                                  >
                                    <h4 className="font-medium">
                                      {submission.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {submission.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                      <span>By {submission.author}</span>
                                      <span>
                                        {new Date(
                                          submission.createdAt,
                                        ).toLocaleDateString()}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {submission.type.replace("-", " ")}
                                      </Badge>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Student Data Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Be the first to share your experience in{" "}
                          {destination?.city}!
                        </p>
                        <Link href="/basic-information">
                          <Button>
                            Share Your Experience
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="costs" data-section="costs">
                  {destination.livingCosts && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Living Costs Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Accommodation</span>
                            <span>
                              €{destination.livingCosts.accommodation.min} - €
                              {destination.livingCosts.accommodation.max}/month
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Food</span>
                            <span>
                              €{destination.livingCosts.food.min} - €
                              {destination.livingCosts.food.max}/month
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Transport</span>
                            <span>
                              €{destination.livingCosts.transport}/month
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Entertainment</span>
                            <span>
                              €{destination.livingCosts.entertainment.min} - €
                              {destination.livingCosts.entertainment.max}/month
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="life" data-section="life">
                  {destination.studentLife && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Life Ratings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(destination.studentLife).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center"
                              >
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[...Array(10)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < (value as number)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {value}/10
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="practical" data-section="practical">
                  {destination.practicalInfo && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Practical Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-1">
                              Visa Requirements
                            </h4>
                            <p className="text-gray-600">
                              {destination.practicalInfo.visa}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Healthcare</h4>
                            <p className="text-gray-600">
                              {destination.practicalInfo.healthcare}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Banking</h4>
                            <p className="text-gray-600">
                              {destination.practicalInfo.bankingTips}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Mobile Phone</h4>
                            <p className="text-gray-600">
                              {destination.practicalInfo.simCard}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {destination.transportation && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Transportation</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-1">
                                Public Transport
                              </h4>
                              <p className="text-gray-600">
                                {destination.transportation.publicTransport}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Walkability Score</span>
                              <span>
                                {destination.transportation.walkability}/10
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Bike Rentals Available</span>
                              <span>
                                {destination.transportation.bikeRentals
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Nearest Airport</span>
                              <span>
                                {destination.transportation.nearestAirport}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Study in {destination.city}?
              </h2>
              <p className="text-gray-600 mb-6">
                Explore exchange programs and connect with students who have
                studied here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/university-exchanges">
                  <Button size="lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Find Exchange Programs
                  </Button>
                </Link>
                <Link href="/student-stories">
                  <Button variant="outline" size="lg">
                    <Users className="h-5 w-5 mr-2" />
                    Read Student Stories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
