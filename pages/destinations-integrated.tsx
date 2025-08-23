import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import Header from "../components/Header";
import {
  MapPin,
  Star,
  Euro,
  Users,
  Search,
  ArrowRight,
  FilterX,
  TrendingUp,
  Eye,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
// ContentIntegrationService moved to API routes to avoid client-side Prisma usage

interface EnhancedDestination {
  id: string;
  name: string;
  city: string;
  country: string;
  description?: string;
  imageUrl?: string;
  featured: boolean;
  submissionCount: number;
  averageRating: number | null;
  averageCost: number | null;
  lastUpdated: Date;
}

export default function EnhancedDestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<EnhancedDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [sortBy, setSortBy] = useState<
    "students" | "rating" | "name" | "updated"
  >("students");
  const [showFeatured, setShowFeatured] = useState(false);

  // Fetch enhanced destinations
  useEffect(() => {
    fetchDestinations();
  }, [sortBy, showFeatured, selectedCountry]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        orderBy: sortBy,
        order: "desc",
        limit: "100",
      });

      if (showFeatured) {
        params.append("featured", "true");
      }

      if (selectedCountry && selectedCountry !== "all") {
        params.append("country", selectedCountry);
      }

      const response = await fetch(`/api/destinations/integrated?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDestinations(data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return destinations;

    const query = searchQuery.toLowerCase();
    return destinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query) ||
        dest.city.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.description?.toLowerCase().includes(query),
    );
  }, [destinations, searchQuery]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(
      new Set(destinations.map((dest) => dest.country)),
    ).sort();
    return uniqueCountries;
  }, [destinations]);

  // Get featured destinations for hero section
  const featuredDestinations = useMemo(() => {
    return destinations.filter((dest) => dest.featured).slice(0, 3);
  }, [destinations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filter effect
  };

  const handleDestinationClick = async (destination: EnhancedDestination) => {
    // Track interaction via API route
    try {
      await fetch("/api/content/track-interaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId: destination.id,
          contentType: "destination",
          action: "view",
        }),
      });
    } catch (error) {
      console.error("Error tracking interaction:", error);
      // Don't block navigation if tracking fails
    }

    router.push(`/destinations/${destination.id}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("all");
    setSortBy("students");
    setShowFeatured(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Study Abroad Destinations - Erasmus Journey</title>
        <meta
          name="description"
          content="Discover the best study abroad destinations based on real student experiences. Find accommodation, costs, courses, and student stories."
        />
        <meta
          name="keywords"
          content="erasmus, study abroad, destinations, universities, student exchange, accommodation, costs"
        />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Study Abroad Destination
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover destinations based on real experiences from{" "}
              {destinations.length}+ student stories
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search destinations, cities, or countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-0 text-gray-900"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {featuredDestinations.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Destinations
              </h2>
              <p className="text-lg text-gray-600">
                Top-rated destinations recommended by our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredDestinations.map((destination) => (
                <Card
                  key={destination.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleDestinationClick(destination)}
                >
                  <div className="relative h-48">
                    {destination.imageUrl ? (
                      <Image
                        src={destination.imageUrl}
                        alt={destination.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 text-yellow-900">
                        <Award className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {destination.description ||
                        `Study abroad in ${destination.city}, ${destination.country}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-sm text-gray-600">
                            {destination.submissionCount} students
                          </span>
                        </div>
                        {destination.averageRating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-600">
                              {destination.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Most Students</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFeatured ? "default" : "outline"}
                onClick={() => setShowFeatured(!showFeatured)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Featured Only
              </Button>

              {(searchQuery || selectedCountry !== "all" || showFeatured) && (
                <Button variant="ghost" onClick={clearFilters}>
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {filteredDestinations.length} destinations found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                  <div className="bg-white p-6 rounded-b-lg border">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDestinations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No destinations found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>Clear all filters</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <Card
                  key={destination.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleDestinationClick(destination)}
                >
                  <div className="relative h-48">
                    {destination.imageUrl ? (
                      <Image
                        src={destination.imageUrl}
                        alt={destination.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-white" />
                      </div>
                    )}
                    {destination.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <Award className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-white/90 text-gray-900">
                        <Users className="h-3 w-3 mr-1" />
                        {destination.submissionCount}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {destination.description ||
                        `Study abroad in ${destination.city}, ${destination.country}`}
                    </p>

                    <div className="space-y-2 mb-4">
                      {destination.averageRating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Average Rating
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">
                              {destination.averageRating.toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                      )}

                      {destination.averageCost && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Avg. Monthly Cost
                          </span>
                          <div className="flex items-center">
                            <Euro className="h-4 w-4 text-green-600 mr-1" />
                            <span className="font-medium">
                              €{Math.round(destination.averageCost)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Last Updated
                        </span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {new Date(
                              destination.lastUpdated,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-600 font-medium">
                        View Details
                      </div>
                      <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't see your destination?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Help other students by sharing your exchange experience and creating
            new destination guides
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/erasmus-experience-form")}
            >
              Share Your Experience
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => router.push("/help-future-students")}
            >
              Help Future Students
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
