import { useState, useMemo, useEffect, useCallback } from "react";
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
import { Progress } from "../src/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../src/components/ui/tabs";
import Header from "../components/Header";
import { SafeImage } from "../components/SafeImage";
import {
  MapPin,
  Star,
  Euro,
  Users,
  Search,
  ArrowRight,
  FilterX,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Bookmark,
  Share2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { DestinationSkeleton } from "../src/components/ui/destination-skeleton";
import { OptimizedImage } from "../src/components/ui/OptimizedImage";
import {
  ErasmusIcon,
  DestinationIcon,
} from "../src/components/icons/CustomIcons";

interface Destination {
  id: string;
  city: string;
  country: string;
  image?: string;
  description?: string;
  costLevel?: string;
  rating?: number;
  studentCount?: number;
  popularUniversities?: string[];
  highlights?: string[];
  avgCostPerMonth?: number;
  region?: string;
  isAdminVerified?: boolean;
  featured?: boolean;
  source?: "admin" | "submission";
  climate?: string;
  photos?: any[];
  generalInfo?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface Analytics {
  totalDestinations: number;
  featuredDestinations: number;
  popularCountries: Array<{ country: string; count: number }>;
}

interface FilterOptions {
  search: string;
  country: string;
  verifiedOnly: boolean;
  featuredOnly: boolean;
  costLevel: string;
  sortBy: "name" | "country" | "updated" | "rating";
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";
}

export default function DestinationsEnhanced() {
  const router = useRouter();

  // Enhanced state management
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedDestinations, setBookmarkedDestinations] = useState<
    Set<string>
  >(new Set());

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    country: "",
    verifiedOnly: false,
    featuredOnly: false,
    costLevel: "",
    sortBy: "name",
    sortOrder: "asc",
    viewMode: "grid",
  });

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [destinationsResponse, analyticsResponse] = await Promise.all([
          fetch("/api/destinations"),
          fetch("/api/destinations/analytics"),
        ]);

        if (!destinationsResponse.ok) {
          throw new Error("Failed to fetch destinations");
        }

        const destinationsData = await destinationsResponse.json();
        const analyticsData = analyticsResponse.ok
          ? await analyticsResponse.json()
          : null;

        // Transform API data
        const transformedDestinations = destinationsData.destinations.map(
          (dest: any) => ({
            id: dest.id,
            city: dest.city || dest.name,
            country: dest.country,
            image: dest.image || dest.imageUrl,
            description: dest.description,
            costLevel: dest.costLevel || getCostLevelFromData(dest),
            rating: dest.rating || generateRating(),
            studentCount: dest.studentCount || generateStudentCount(),
            popularUniversities:
              dest.popularUniversities || dest.universities?.slice(0, 3) || [],
            highlights: dest.highlights
              ? dest.highlights.split(",").map((h: string) => h.trim())
              : [],
            avgCostPerMonth:
              dest.avgCostPerMonth || generateAvgCost(dest.costLevel),
            region: getRegionFromCountry(dest.country),
            isAdminVerified: dest.isAdminVerified || dest.source === "admin",
            featured: dest.featured || false,
            source: dest.source || "submission",
            climate: dest.climate,
            photos: dest.photos,
            generalInfo: dest.generalInfo,
            createdAt: dest.createdAt,
            updatedAt: dest.updatedAt,
          }),
        );

        setDestinations(transformedDestinations);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load destinations");
        setDestinations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const getRegionFromCountry = (country: string) => {
    const regions: Record<string, string> = {
      Germany: "Central Europe",
      "Czech Republic": "Central Europe",
      Spain: "Southern Europe",
      Italy: "Southern Europe",
      France: "Western Europe",
      Netherlands: "Western Europe",
      Austria: "Central Europe",
      Belgium: "Western Europe",
      Denmark: "Northern Europe",
      Finland: "Northern Europe",
      Sweden: "Northern Europe",
      Norway: "Northern Europe",
      Poland: "Central Europe",
      Hungary: "Central Europe",
      Portugal: "Southern Europe",
      Greece: "Southern Europe",
    };
    return regions[country] || "Europe";
  };

  const getCostLevelFromData = (dest: any) => {
    if (dest.costOfLiving && typeof dest.costOfLiving === "object") {
      const avgCost = dest.costOfLiving.monthly || dest.avgCostPerMonth || 800;
      if (avgCost < 600) return "low";
      if (avgCost < 1000) return "medium";
      return "high";
    }
    return "medium";
  };

  const generateRating = () => Math.round((Math.random() * 2 + 3) * 10) / 10;
  const generateStudentCount = () => Math.floor(Math.random() * 500) + 50;
  const generateAvgCost = (costLevel?: string) => {
    const baseCosts = { low: 500, medium: 800, high: 1200 };
    const base = baseCosts[costLevel as keyof typeof baseCosts] || 800;
    return Math.floor(base + (Math.random() * 200 - 100));
  };

  // Configure Fuse.js for enhanced search
  const fuseOptions = {
    keys: [
      { name: "city", weight: 0.4 },
      { name: "country", weight: 0.3 },
      { name: "description", weight: 0.2 },
      { name: "highlights", weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  };

  const fuse = useMemo(
    () => new Fuse(destinations, fuseOptions),
    [destinations],
  );

  // Enhanced filtering and sorting
  const filteredAndSortedDestinations = useMemo(() => {
    let results = destinations;

    // Apply search
    if (filters.search.trim()) {
      const fuseResults = fuse.search(filters.search.trim());
      results = fuseResults.map((result) => result.item);
    }

    // Apply filters
    if (filters.country) {
      results = results.filter((dest) => dest.country === filters.country);
    }

    if (filters.verifiedOnly) {
      results = results.filter((dest) => dest.isAdminVerified);
    }

    if (filters.featuredOnly) {
      results = results.filter((dest) => dest.featured);
    }

    if (filters.costLevel && filters.costLevel !== "all") {
      results = results.filter((dest) => dest.costLevel === filters.costLevel);
    }

    // Apply sorting
    results.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "name":
          aValue = a.city;
          bValue = b.city;
          break;
        case "country":
          aValue = a.country;
          bValue = b.country;
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "updated":
          aValue = new Date(a.updatedAt || a.createdAt || 0);
          bValue = new Date(b.updatedAt || b.createdAt || 0);
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return filters.sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return results;
  }, [destinations, filters, fuse]);

  // Update filter function
  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      country: "",
      verifiedOnly: false,
      featuredOnly: false,
      costLevel: "",
      sortBy: "name",
      sortOrder: "asc",
      viewMode: filters.viewMode, // Keep view mode
    });
  }, [filters.viewMode]);

  // Bookmark functionality
  const toggleBookmark = useCallback((destinationId: string) => {
    setBookmarkedDestinations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(destinationId)) {
        newSet.delete(destinationId);
      } else {
        newSet.add(destinationId);
      }
      // In a real app, you'd save this to localStorage or a backend
      localStorage.setItem(
        "bookmarkedDestinations",
        JSON.stringify([...newSet]),
      );
      return newSet;
    });
  }, []);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedDestinations");
    if (saved) {
      setBookmarkedDestinations(new Set(JSON.parse(saved)));
    }
  }, []);

  // Get unique countries for filter
  const countries = useMemo(() => {
    return [...new Set(destinations.map((dest) => dest.country))].sort();
  }, [destinations]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Destinations
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Study Destinations - Erasmus Journey</title>
        <meta
          name="description"
          content="Discover amazing study abroad destinations for your Erasmus journey. Find universities, costs, and student experiences."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section with Analytics */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <DestinationIcon className="h-10 w-10 text-blue-600" />
                Study Destinations
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover amazing study abroad destinations for your Erasmus
                journey
              </p>
            </div>

            {/* Analytics Overview */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Destinations
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics.totalDestinations}
                        </p>
                      </div>
                      <MapPin className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Featured Destinations
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {analytics.featuredDestinations}
                        </p>
                      </div>
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Verified Destinations
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {destinations.filter((d) => d.isAdminVerified).length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Enhanced Filters and Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* Search */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search destinations, countries, universities..."
                      value={filters.search}
                      onChange={(e) => updateFilter("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Country Filter */}
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Select
                    value={filters.country}
                    onValueChange={(value) =>
                      updateFilter("country", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Level Filter */}
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Level
                  </label>
                  <Select
                    value={filters.costLevel}
                    onValueChange={(value) =>
                      updateFilter("costLevel", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All costs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All costs</SelectItem>
                      <SelectItem value="low">Low (€300-600)</SelectItem>
                      <SelectItem value="medium">Medium (€600-1000)</SelectItem>
                      <SelectItem value="high">High (€1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) =>
                        updateFilter("sortBy", value)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="updated">Updated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFilter(
                          "sortOrder",
                          filters.sortOrder === "asc" ? "desc" : "asc",
                        )
                      }
                      className="px-3"
                    >
                      {filters.sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Filter Toggles and View Controls */}
              <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.verifiedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateFilter("verifiedOnly", !filters.verifiedOnly)
                    }
                    className="text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Only
                  </Button>
                  <Button
                    variant={filters.featuredOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateFilter("featuredOnly", !filters.featuredOnly)
                    }
                    className="text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Featured Only
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    <FilterX className="h-3 w-3 mr-1" />
                    Clear Filters
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredAndSortedDestinations.length} of{" "}
                    {destinations.length} destinations
                  </span>
                  <div className="flex border rounded-md">
                    <Button
                      variant={
                        filters.viewMode === "grid" ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => updateFilter("viewMode", "grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={
                        filters.viewMode === "list" ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => updateFilter("viewMode", "list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <DestinationSkeleton key={i} />
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredAndSortedDestinations.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No destinations found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or clearing the filters.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {/* Destinations Grid/List */}
          {!isLoading && filteredAndSortedDestinations.length > 0 && (
            <div
              className={
                filters.viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredAndSortedDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  viewMode={filters.viewMode}
                  isBookmarked={bookmarkedDestinations.has(destination.id)}
                  onToggleBookmark={() => toggleBookmark(destination.id)}
                />
              ))}
            </div>
          )}

          {/* Load More Button (for future pagination) */}
          {!isLoading &&
            filteredAndSortedDestinations.length > 0 &&
            filteredAndSortedDestinations.length < destinations.length && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Destinations
                </Button>
              </div>
            )}
        </main>
      </div>
    </>
  );
}

// Enhanced Destination Card Component
interface DestinationCardProps {
  destination: Destination;
  viewMode: "grid" | "list";
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  viewMode,
  isBookmarked,
  onToggleBookmark,
}) => {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest(".action-button")) {
      return;
    }
    router.push(`/destinations/${destination.id}`);
  };

  if (viewMode === "list") {
    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <SafeImage
                src={destination.image || "/placeholder.svg"}
                alt={`${destination.city}, ${destination.country}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {destination.city}
                  </h3>
                  <p className="text-sm text-gray-600">{destination.country}</p>
                </div>
                <div className="flex items-center gap-2 action-button">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleBookmark}
                    className="text-gray-400 hover:text-yellow-500"
                  >
                    <Bookmark
                      className={`h-4 w-4 ${isBookmarked ? "fill-current text-yellow-500" : ""}`}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-2">
                {destination.isAdminVerified && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {destination.featured && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {destination.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {destination.rating}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {destination.description ||
                  "Explore this amazing study destination."}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {destination.avgCostPerMonth && (
                  <span className="flex items-center gap-1">
                    <Euro className="h-3 w-3" />€{destination.avgCostPerMonth}
                    /month
                  </span>
                )}
                {destination.studentCount && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {destination.studentCount} students
                  </span>
                )}
                {destination.updatedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated{" "}
                    {new Date(destination.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <SafeImage
            src={destination.image || "/placeholder.svg"}
            alt={`${destination.city}, ${destination.country}`}
            width={400}
            height={240}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {destination.featured && (
            <Badge className="bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {destination.isAdminVerified && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Bookmark Button */}
        <div className="absolute top-3 right-3 action-button">
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleBookmark}
            className="bg-white/90 hover:bg-white text-gray-600 hover:text-yellow-500"
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current text-yellow-500" : ""}`}
            />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {destination.city}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {destination.country} • {destination.region}
            </p>
          </div>
          {destination.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{destination.rating}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {destination.description ||
            "Discover amazing universities and student life in this destination."}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {destination.avgCostPerMonth && (
            <span className="flex items-center gap-1">
              <Euro className="h-3 w-3" />€{destination.avgCostPerMonth}/month
            </span>
          )}
          {destination.studentCount && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {destination.studentCount} students
            </span>
          )}
        </div>

        {destination.highlights && destination.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {destination.highlights.slice(0, 3).map((highlight, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {highlight}
              </Badge>
            ))}
            {destination.highlights.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{destination.highlights.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                destination.costLevel === "low"
                  ? "border-green-300 text-green-700"
                  : destination.costLevel === "medium"
                    ? "border-yellow-300 text-yellow-700"
                    : "border-red-300 text-red-700"
              }`}
            >
              {destination.costLevel === "low" && "💰 Budget-friendly"}
              {destination.costLevel === "medium" && "💳 Moderate cost"}
              {destination.costLevel === "high" && "💎 Premium"}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 action-button"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
