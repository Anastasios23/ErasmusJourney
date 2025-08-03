import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Fuse from "fuse.js";
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
import CityDataCard from "../components/CityDataCard";
import {
  MapPin,
  Star,
  Euro,
  Users,
  Search,
  ArrowRight,
  FilterX,
  TrendingUp,
  ThumbsUp,
} from "lucide-react";
import { DestinationSkeleton } from "../src/components/ui/destination-skeleton";
import { OptimizedImage } from "../src/components/ui/OptimizedImage";
import {
  ErasmusIcon,
  DestinationIcon,
} from "../src/components/icons/CustomIcons";

// City aggregation data interface
interface CityAggregatedData {
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
}

export default function Destinations() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCostLevel, setSelectedCostLevel] = useState("");
  const [selectedDataFilter, setSelectedDataFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [destinations, setDestinations] = useState([]); // Make this dynamic
  const [error, setError] = useState<string | null>(null);
  const [cityAggregatedData, setCityAggregatedData] = useState<
    Record<string, CityAggregatedData>
  >({});
  const [loadingCityData, setLoadingCityData] = useState(false);

  // Load dynamic destination data
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching destinations from /api/destinations-simple");
        const response = await fetch("/api/destinations-simple");

        console.log("Response status:", response.status);

        // Read the response body only once
        let data;
        try {
          data = await response.json();
          console.log("Destinations data received:", data);
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          throw new Error(`Failed to parse destinations response: ${response.status}`);
        }

        if (!response.ok) {
          console.error("API Error Response:", data);
          throw new Error(`Failed to fetch destinations: ${response.status} - ${data.message || 'Unknown error'}`);
        }

        // Transform API data to match component expectations
        const transformedDestinations = data.destinations.map((dest: any) => ({
          id: dest.id,
          city: dest.city,
          country: dest.country,
          image: dest.image,
          description: dest.description,
          costLevel: dest.costLevel,
          rating: dest.rating,
          studentCount: dest.studentCount,
          popularUniversities: dest.popularUniversities,
          highlights: dest.universities ? dest.universities.slice(0, 3) : [], // Use universities as highlights for now
          avgCostPerMonth: dest.avgCostPerMonth,
          region: getRegionFromCountry(dest.country),
        }));

        setDestinations(transformedDestinations);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setError(error instanceof Error ? error.message : "Failed to load destinations");

        // Set fallback destinations so the page doesn't break completely
        setDestinations([
          {
            id: "fallback-prague",
            city: "Prague",
            country: "Czech Republic",
            image: "/images/destinations/prague.svg",
            description: "Historic city with affordable living and great universities",
            costLevel: "low",
            rating: 4.2,
            studentCount: 0,
            popularUniversities: ["Charles University"],
            highlights: ["Affordable Living", "Beautiful Architecture", "Central Europe"],
            avgCostPerMonth: 800,
            region: "Central Europe",
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Load city aggregated data
  useEffect(() => {
    const fetchCityAggregatedData = async () => {
      try {
        setLoadingCityData(true);
        const response = await fetch(
          "/api/destinations/city-aggregated?all=true",
        );

        if (response.ok) {
          const result = await response.json();
          console.log("City aggregated API response:", result);

          // Check if we have cities data
          const citiesData = result.cities || result.data || [];

          if (Array.isArray(citiesData)) {
            // Convert array to object keyed by city-country
            const dataMap = citiesData.reduce(
              (
                acc: Record<string, CityAggregatedData>,
                cityData: CityAggregatedData,
              ) => {
                const key = `${cityData.city.toLowerCase()}-${cityData.country.toLowerCase()}`;
                acc[key] = cityData;
                return acc;
              },
              {},
            );
            setCityAggregatedData(dataMap);
            console.log(
              `Loaded city data for ${Object.keys(dataMap).length} cities`,
            );
          } else {
            console.warn("No cities data found in API response");
          }
        } else {
          console.error(
            "Failed to fetch city data:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("Error fetching city aggregated data:", error);
      } finally {
        setLoadingCityData(false);
      }
    };

    fetchCityAggregatedData();
  }, []);

  const getRegionFromCountry = (country: string) => {
    const regions: Record<string, string> = {
      Germany: "Central Europe",
      "Czech Republic": "Central Europe",
      Spain: "Southern Europe",
      Italy: "Southern Europe",
      France: "Western Europe",
      Netherlands: "Western Europe",
    };
    return regions[country] || "Europe";
  };

  // Configure Fuse.js for fuzzy search
  const fuseOptions = {
    keys: [
      { name: "city", weight: 0.3 },
      { name: "country", weight: 0.3 },
      { name: "description", weight: 0.2 },
      { name: "popularUniversities", weight: 0.1 },
      { name: "highlights", weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  };

  const fuse = useMemo(
    () => new Fuse(destinations, fuseOptions),
    [destinations],
  );

  // Get unique values for filters
  const costLevels = ["low", "medium", "high"];

  // Filter destinations using Fuse.js and other filters
  const filteredDestinations = useMemo(() => {
    let results = destinations;

    // Apply fuzzy search if search term exists
    if (searchTerm.trim()) {
      const fuseResults = fuse.search(searchTerm.trim());
      results = fuseResults.map((result) => result.item);
    }

    // Apply cost filter (only if a specific cost level is selected)
    if (
      selectedCostLevel &&
      selectedCostLevel !== "all-costs" &&
      selectedCostLevel !== ""
    ) {
      results = results.filter((dest) => dest.costLevel === selectedCostLevel);
    }

    // Apply data availability filter
    if (
      selectedDataFilter &&
      selectedDataFilter !== "all-data" &&
      selectedDataFilter !== ""
    ) {
      switch (selectedDataFilter) {
        case "with-cost-data":
          results = results.filter(
            (dest) =>
              dest.dataInsights?.hasAccommodationData ||
              dest.dataInsights?.hasExpenseData,
          );
          break;
        case "popular-destinations":
          results = results.filter((dest) => dest.studentCount >= 10);
          break;
        case "complete-info":
          results = results.filter(
            (dest) =>
              dest.cityInfo &&
              dest.cityInfo.topAttractions &&
              dest.cityInfo.topAttractions.length > 0,
          );
          break;
        case "admin-verified":
          results = results.filter((dest) => dest.isAdminDestination);
          break;
      }
    }

    return results;
  }, [searchTerm, selectedCostLevel, selectedDataFilter, destinations, fuse]);

  const getCostBadgeColor = (cost: string) => {
    switch (cost) {
      case "low":
        return "bg-green-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "high":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleDestinationClick = (destinationId: string) => {
    router.push(`/destinations/${destinationId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCostLevel("");
    setSelectedDataFilter("");
  };

  return (
    <>
      <Head>
        <title>Destinations - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore amazing destinations for your Erasmus exchange program"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Explore Destinations
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover amazing cities and universities across Europe for your
                Erasmus exchange experience.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cities, countries, universities, or highlights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-4">
                  <Select
                    value={selectedCostLevel || "all-costs"}
                    onValueChange={(value) =>
                      setSelectedCostLevel(value === "all-costs" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Cost Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-costs">All Cost Levels</SelectItem>
                      {costLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)} Cost
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDataFilter || "all-data"}
                    onValueChange={(value) =>
                      setSelectedDataFilter(value === "all-data" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="All Destinations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-data">All Destinations</SelectItem>
                      <SelectItem value="admin-verified">
                        ✓ Admin Verified
                      </SelectItem>
                      <SelectItem value="with-cost-data">
                        With Real Cost Data
                      </SelectItem>
                      <SelectItem value="popular-destinations">
                        Popular (10+ Students)
                      </SelectItem>
                      <SelectItem value="complete-info">
                        Complete City Info
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {(searchTerm || selectedCostLevel || selectedDataFilter) && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Results count and active filters */}
              <div className="text-left mt-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm text-gray-600">
                    Showing {filteredDestinations.length} of{" "}
                    {destinations.length} European destinations
                  </p>

                  {/* Active Filters */}
                  {(searchTerm || selectedCostLevel || selectedDataFilter) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">•</span>
                      {searchTerm && (
                        <Badge variant="outline" className="text-xs">
                          Search: "{searchTerm}"
                        </Badge>
                      )}
                      {selectedCostLevel && (
                        <Badge variant="outline" className="text-xs">
                          {selectedCostLevel.charAt(0).toUpperCase() +
                            selectedCostLevel.slice(1)}{" "}
                          cost
                        </Badge>
                      )}
                      {selectedDataFilter && (
                        <Badge variant="outline" className="text-xs">
                          {selectedDataFilter === "with-cost-data"
                            ? "Real cost data"
                            : selectedDataFilter === "popular-destinations"
                              ? "Popular (10+ students)"
                              : selectedDataFilter === "complete-info"
                                ? "Complete city info"
                                : selectedDataFilter === "admin-verified"
                                  ? "✓ Admin verified"
                                  : selectedDataFilter}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Filter Buttons */}
              {!searchTerm && !selectedCostLevel && !selectedDataFilter && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 self-center">
                    Quick filters:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDataFilter("with-cost-data")}
                    className="text-xs"
                  >
                    Real Cost Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedDataFilter("popular-destinations")
                    }
                    className="text-xs"
                  >
                    Popular Destinations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCostLevel("low")}
                    className="text-xs"
                  >
                    Low Cost
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDataFilter("complete-info")}
                    className="text-xs"
                  >
                    Complete Info
                  </Button>
                </div>
              )}
            </div>

            {/* Destinations Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <DestinationSkeleton key={index} />
                ))}
              </div>
            ) : destinations.length === 0 ? (
              /* No data at all - show empty state with call to action */
              <div className="text-center py-16">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No destinations available yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Destinations are generated based on student form
                    submissions. Be the first to share your experience!
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => router.push("/basic-information")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Share Your Experience
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dev-tools")}
                      className="text-gray-600"
                    >
                      Generate Sample Data
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {filteredDestinations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDestinations.map((destination, index) => (
                      <Card
                        key={destination.id}
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-0 shadow-md hover:shadow-2xl hover:-translate-y-1"
                        onClick={() => handleDestinationClick(destination.id)}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <OptimizedImage
                            src={
                              destination.image ||
                              `/images/destinations/${destination.city.toLowerCase().replace(/\s+/g, "-")}-custom.svg`
                            }
                            alt={`${destination.city}, ${destination.country} - Study abroad destination with Erasmus program`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            priority={index < 6}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />

                          {/* Custom gradient overlay with Erasmus branding */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                          {/* EU/Erasmus indicator */}
                          <div className="absolute top-4 right-4 transform transition-transform group-hover:scale-110">
                            <div className="bg-blue-600/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                              <ErasmusIcon
                                size={18}
                                className="text-yellow-300"
                              />
                            </div>
                          </div>

                          {/* Destination indicator */}
                          <div className="absolute top-4 left-4">
                            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                              <DestinationIcon
                                size={16}
                                className="text-blue-600"
                              />
                              <span className="text-sm font-medium text-gray-800">
                                {destination.country}
                              </span>
                            </div>
                          </div>

                          {/* City name overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                              {destination.city}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-200 text-sm font-medium">
                                {destination.studentCount} Cypriot students
                              </span>
                            </div>
                          </div>
                        </div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">
                                {destination.city}
                              </CardTitle>
                              <p className="text-gray-600 flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {destination.country}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge
                                className={getCostBadgeColor(
                                  destination.costLevel,
                                )}
                              >
                                {destination.costLevel} cost
                              </Badge>
                              {destination.isAdminDestination && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {destination.description}
                          </p>

                          {/* City Aggregated Data */}
                          <CityDataCard
                            cityData={
                              cityAggregatedData[
                                `${destination.city.toLowerCase()}-${destination.country.toLowerCase()}`
                              ]
                            }
                            loading={loadingCityData}
                          />

                          {/* Stats */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">
                                {destination.rating}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">
                                {destination.studentCount} students
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                €{destination.avgCostPerMonth}/mo
                              </span>
                            </div>
                          </div>

                          {/* Data Quality Indicators */}
                          {destination.dataInsights && (
                            <div className="mb-4 flex gap-2">
                              {destination.dataInsights
                                .hasAccommodationData && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  ✓ Real rent data
                                </Badge>
                              )}
                              {destination.dataInsights.hasExpenseData && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  ✓ Living costs
                                </Badge>
                              )}
                              {destination.studentCount >= 10 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  Popular choice
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Universities */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Popular Universities:
                            </h4>
                            <div className="space-y-1">
                              {destination.popularUniversities
                                .slice(0, 2)
                                .map((uni, index) => (
                                  <p
                                    key={index}
                                    className="text-xs text-gray-600"
                                  >
                                    • {uni}
                                  </p>
                                ))}
                              {destination.popularUniversities.length > 2 && (
                                <p className="text-xs text-blue-600">
                                  +{destination.popularUniversities.length - 2}{" "}
                                  more
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          {destination.dataInsights &&
                            (destination.dataInsights.hasAccommodationData ||
                              destination.dataInsights.hasExpenseData) && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  💰 Real Student Costs:
                                </h4>
                                <div className="space-y-1 text-xs">
                                  {destination.dataInsights.avgRent > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Average Rent:
                                      </span>
                                      <span className="font-medium">
                                        €{destination.dataInsights.avgRent}/mo
                                      </span>
                                    </div>
                                  )}
                                  {destination.dataInsights.avgLivingExpenses >
                                    0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Living Expenses:
                                      </span>
                                      <span className="font-medium">
                                        €
                                        {
                                          destination.dataInsights
                                            .avgLivingExpenses
                                        }
                                        /mo
                                      </span>
                                    </div>
                                  )}
                                  {destination.dataInsights
                                    .mostCommonBiggestExpense && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <span className="text-gray-600">
                                        Biggest expense:{" "}
                                      </span>
                                      <span className="font-medium text-orange-600">
                                        {
                                          destination.dataInsights
                                            .mostCommonBiggestExpense
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {destination.highlights
                              .slice(0, 3)
                              .map((highlight, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {highlight}
                                </Badge>
                              ))}
                          </div>

                          {/* City Information */}
                          {destination.cityInfo && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <h4 className="text-sm font-medium text-blue-900 mb-2">
                                🏛️ City Info:
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {destination.cityInfo.population && (
                                  <div>
                                    <span className="text-gray-600">
                                      Population:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {destination.cityInfo.population}
                                    </span>
                                  </div>
                                )}
                                {destination.cityInfo.language && (
                                  <div>
                                    <span className="text-gray-600">
                                      Language:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {destination.cityInfo.language}
                                    </span>
                                  </div>
                                )}
                                {destination.cityInfo.climate && (
                                  <div>
                                    <span className="text-gray-600">
                                      Climate:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {destination.cityInfo.climate}
                                    </span>
                                  </div>
                                )}
                                {destination.cityInfo.practicalInfo
                                  ?.englishFriendly && (
                                  <div>
                                    <span className="text-gray-600">
                                      English:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {
                                        destination.cityInfo.practicalInfo
                                          .englishFriendly
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>

                              {destination.cityInfo.topAttractions &&
                                destination.cityInfo.topAttractions.length >
                                  0 && (
                                  <div className="mt-2 pt-2 border-t border-blue-200">
                                    <span className="text-gray-600 text-xs">
                                      Top attractions:{" "}
                                    </span>
                                    <span className="text-blue-700 text-xs font-medium">
                                      {destination.cityInfo.topAttractions
                                        .slice(0, 3)
                                        .join(", ")}
                                      {destination.cityInfo.topAttractions
                                        .length > 3 && "..."}
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}

                          <Button className="w-full" variant="outline">
                            Learn More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 col-span-full">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                      <FilterX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        No Destinations Found
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        We couldn't find any destinations matching your search
                        for "{searchTerm}". Try adjusting your filters or search
                        terms.
                      </p>
                      <Button onClick={clearFilters} size="lg">
                        Clear All Filters
                      </Button>
                      <div className="mt-6 text-sm text-gray-500">
                        <p>Popular searches:</p>
                        <div className="flex gap-2 justify-center mt-2">
                          <Button
                            variant="link"
                            className="text-blue-600"
                            onClick={() => setSearchTerm("Spain")}
                          >
                            Spain
                          </Button>
                          <Button
                            variant="link"
                            className="text-blue-600"
                            onClick={() => setSearchTerm("Germany")}
                          >
                            Germany
                          </Button>
                          <Button
                            variant="link"
                            className="text-blue-600"
                            onClick={() => setSearchTerm("low cost")}
                          >
                            Low Cost
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Show error message if API fails */}
            {error && !isLoading && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  {error}. Showing available destinations from our database.
                </p>
              </div>
            )}

            {/* Show data source info */}
            {!isLoading && destinations.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  📊 This data is generated from{" "}
                  <strong>
                    {destinations.reduce(
                      (sum, dest) => sum + dest.studentCount,
                      0,
                    )}{" "}
                    real student experiences
                  </strong>
                  {destinations.some((dest) => dest.studentCount > 0) &&
                    ". Click on any destination to see detailed experiences from students who studied there."}
                </p>
              </div>
            )}

            {/* CTA Section */}
            <section className="mt-16">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Start Your Adventure?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Explore detailed information about each destination, connect
                    with other students, and start planning your Erasmus
                    journey.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/basic-information">
                      <Button size="lg">Start Your Application</Button>
                    </Link>
                    <Link href="/student-stories">
                      <Button variant="outline" size="lg">
                        Read Student Stories
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
