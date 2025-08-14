import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import DestinationOverview from "../../src/components/DestinationOverview";
import GeneratedAccommodationCard from "../../src/components/GeneratedAccommodationCard";
import GeneratedCourseExchangeCard from "../../src/components/GeneratedCourseExchangeCard";
import { useGeneratedDestination } from "../../src/hooks/useGeneratedDestinations";
import { Button } from "../../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import { Skeleton } from "../../src/components/ui/skeleton";
import { ArrowLeft, Home, GraduationCap, Globe } from "lucide-react";

export default function DestinationDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const {
    data: destination,
    isLoading,
    error,
  } = useGeneratedDestination(slug as string);

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

  const pageTitle =
    destination.adminTitle || `${destination.city}, ${destination.country}`;
  const pageDescription =
    destination.adminDescription ||
    `Discover ${destination.city} through ${destination.totalSubmissions} real student experiences. Find accommodation, courses, and practical tips for your Erasmus exchange.`;

  return (
    <>
      <Head>
        <title>{pageTitle} - Erasmus Journey</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={`${pageTitle} - Erasmus Journey`} />
        <meta property="og:description" content={pageDescription} />
        {destination.adminImageUrl && (
          <meta property="og:image" content={destination.adminImageUrl} />
        )}
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/destinations">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Destinations
              </Button>
            </Link>
          </div>

          {/* Destination Overview */}
          <DestinationOverview destination={destination} />

          {/* Main Content Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="accommodations"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Accommodations ({destination.accommodations.length})
                </TabsTrigger>
                <TabsTrigger
                  value="academics"
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Academic Experiences ({destination.courseExchanges.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Latest Student Experiences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {destination.accommodations
                          .slice(0, 2)
                          .map((accommodation) => (
                            <GeneratedAccommodationCard
                              key={accommodation.id}
                              accommodation={accommodation}
                              isCompact={true}
                            />
                          ))}
                        {destination.accommodations.length > 2 && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {}}
                          >
                            View All {destination.accommodations.length}{" "}
                            Accommodation Experiences
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Academic Experiences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {destination.courseExchanges
                          .slice(0, 2)
                          .map((courseExchange) => (
                            <GeneratedCourseExchangeCard
                              key={courseExchange.id}
                              courseExchange={courseExchange}
                              isCompact={true}
                            />
                          ))}
                        {destination.courseExchanges.length > 2 && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {}}
                          >
                            View All {destination.courseExchanges.length}{" "}
                            Academic Experiences
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="accommodations" className="space-y-6">
                <div className="grid gap-6">
                  {destination.accommodations.length > 0 ? (
                    destination.accommodations.map((accommodation) => (
                      <GeneratedAccommodationCard
                        key={accommodation.id}
                        accommodation={accommodation}
                        isCompact={false}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No accommodation experiences yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Be the first to share your accommodation experience in{" "}
                          {destination.city}!
                        </p>
                        <Link href="/erasmus-experience-form">
                          <Button>Share Your Experience</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="academics" className="space-y-6">
                <div className="grid gap-6">
                  {destination.courseExchanges.length > 0 ? (
                    destination.courseExchanges.map((courseExchange) => (
                      <GeneratedCourseExchangeCard
                        key={courseExchange.id}
                        courseExchange={courseExchange}
                        isCompact={false}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No academic experiences yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Be the first to share your academic experience in{" "}
                          {destination.city}!
                        </p>
                        <Link href="/erasmus-experience-form">
                          <Button>Share Your Experience</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
