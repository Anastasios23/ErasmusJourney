import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import { ApplicationCTA, CommunityJoinCTA } from "../src/components/ui/enhanced-cta";
import { PageContext, ContextualTip, JourneyProgress, QuickStartGuide } from "../src/components/ui/user-guidance";
import { designSystem } from "../src/utils/designSystem";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Badge } from "../src/components/ui/badge";
import AccommodationExperienceCard from "../src/components/AccommodationExperienceCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Skeleton } from "../src/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import { Label } from "../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../src/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../src/components/ui/alert-dialog";
import { useAccommodations, useContactStudent } from "../src/hooks/useQueries";
import {
  useGeneratedContent,
  useFormSubmissions,
} from "../src/hooks/useFormSubmissions";
import { useRecentlyViewed } from "../src/hooks/useRecentlyViewed";
import { RecentlyViewed } from "../src/components/RecentlyViewed";
import BudgetCalculator from "../components/accommodation/BudgetCalculator";
import SmartRecommendations from "../components/accommodation/SmartRecommendations";
import ContactIntegration from "../components/accommodation/ContactIntegration";
import PlatformLinks from "../components/accommodation/PlatformLinks";
import UniversityHousing from "../components/accommodation/UniversityHousing";
import {
  Search,
  Star,
  Calendar,
  MapPin,
  CheckCircle,
  ExternalLink,
  Mail,
  Home,
  Wifi,
  Car,
  Utensils,
  SlidersHorizontal,
  X,
  ChevronDown,
  Users,
  Calculator,
  Globe,
  MessageCircle,
  GraduationCap,
  Lightbulb,
  Heart,
} from "lucide-react";

const ITEMS_PER_PAGE = 6;

export default function StudentAccommodations() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // React Query for data fetching with caching
  const filters = useMemo(
    () => ({
      search: searchTerm,
      city: selectedCity === "all-cities" ? undefined : selectedCity,
      country:
        selectedCountry === "all-countries" ? undefined : selectedCountry,
      type: selectedType === "all-types" ? undefined : selectedType,
      maxBudget: maxBudget === "no-limit" ? undefined : parseInt(maxBudget),
      minRating:
        selectedRating === "all-ratings" ? undefined : parseInt(selectedRating),
    }),
    [
      searchTerm,
      selectedCity,
      selectedCountry,
      selectedType,
      maxBudget,
      selectedRating,
    ],
  );

  // Use real accommodation data from API instead of generated data
  const {
    data: accommodations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["real-accommodations", filters],
    queryFn: async () => {
      const response = await fetch("/api/accommodation/experiences");
      if (!response.ok) throw new Error("Failed to fetch accommodations");
      const data = await response.json();

      // Apply client-side filtering if needed
      let filtered = data.experiences || [];

      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (acc: any) =>
            acc.studentName?.toLowerCase().includes(search) ||
            acc.accommodationAddress?.toLowerCase().includes(search) ||
            acc.accommodationType?.toLowerCase().includes(search) ||
            acc.neighborhood?.toLowerCase().includes(search),
        );
      }

      if (filters.city) {
        filtered = filtered.filter(
          (acc: any) => acc.city?.toLowerCase() === filters.city?.toLowerCase(),
        );
      }

      if (filters.type) {
        filtered = filtered.filter(
          (acc: any) => acc.accommodationType === filters.type,
        );
      }

      if (filters.maxBudget) {
        filtered = filtered.filter(
          (acc: any) => acc.monthlyRent <= filters.maxBudget!,
        );
      }

      if (filters.minRating) {
        filtered = filtered.filter(
          (acc: any) => acc.rating >= filters.minRating!,
        );
      }

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const contactMutation = useContactStudent();

  // Get generated content from user submissions
  const { content: generatedContent, loading: contentLoading } =
    useGeneratedContent("accommodations");

  // Accommodation statistics
  const [accommodationStats, setAccommodationStats] = useState(null);

  // User profile and preferences
  const { getDraftData } = useFormSubmissions();
  const { addRecentItem } = useRecentlyViewed();
  const [userProfile, setUserProfile] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [activeSection, setActiveSection] = useState("experiences");

  // Load user profile from form data
  useEffect(() => {
    const basicInfoData = getDraftData("basic-info");
    if (basicInfoData) {
      setUserProfile({
        university: basicInfoData.universityInCyprus,
        hostCountry: basicInfoData.hostCountry,
        hostCity: basicInfoData.hostCity,
        hostUniversity: basicInfoData.hostUniversity,
        budget: basicInfoData.monthlyBudget,
      });
    }

    // Load wishlist from localStorage
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("accommodation_wishlist");
      if (savedWishlist) {
        setWishlist(new Set(JSON.parse(savedWishlist)));
      }
    }
  }, []); // Remove getDraftData dependency to prevent infinite loop

  // Fetch accommodation statistics for destination insights
  useEffect(() => {
    const fetchAccommodationStats = async () => {
      try {
        const response = await fetch("/api/student-accommodations/stats");
        if (response.ok) {
          const data = await response.json();
          setAccommodationStats(data.destinationStats || null);
        }
      } catch (error) {
        console.error("Error fetching accommodation stats:", error);
      }
    };

    fetchAccommodationStats();
  }, []);

  // Combine real accommodations with generated content as fallback
  const allAccommodations = [
    ...(accommodations || []).map((item, index) => ({
      ...item,
      id: item.id ? `api-${item.id}` : `api-${index}`,
      source: "student_experience",
      isReal: true,
    })),
    ...(generatedContent?.accommodations || []).map((item, index) => ({
      ...item,
      id: item.id ? `generated-${item.id}` : `generated-${index}`,
      source: "generated",
      isReal: false,
    })),
  ];

  const finalLoading = isLoading || contentLoading;

  // Pagination
  const totalPages = Math.ceil(allAccommodations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAccommodations = allAccommodations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Filter options derived from data
  const cities = [...new Set(allAccommodations.map((a) => a.city))].sort();
  const countries = [
    ...new Set(allAccommodations.map((a) => a.country)),
  ].sort();
  const types = [
    ...new Set(allAccommodations.map((a) => a.accommodationType || a.type)),
  ].sort();

  const handleContactStudent = async (accommodation: any) => {
    if (accommodation.contact.allowContact && accommodation.contact.email) {
      try {
        await contactMutation.mutateAsync({
          studentEmail: accommodation.contact.email,
          subject: `Question about your accommodation in ${accommodation.city}`,
          message: `Hi ${accommodation.studentName},\n\nI saw your accommodation listing in ${accommodation.city} and would like to know more details.\n\nBest regards`,
        });
      } catch (error) {
        console.error("Failed to send contact email:", error);
      }
    }
  };

  const handleViewDetails = (id: string) => {
    // Track this accommodation as recently viewed
    const accommodation = allAccommodations.find((acc) => acc.id === id);
    if (accommodation) {
      addRecentItem({
        id: id,
        title: `${accommodation.accommodationType || accommodation.type} in ${accommodation.city}`,
        type: "accommodation",
        url: `/accommodation/${id}`,
        metadata: {
          city: accommodation.city,
          country: accommodation.country,
          author: accommodation.studentName,
        },
      });
    }

    router.push(`/accommodation/${id}`);
  };

  const toggleWishlist = (accommodationId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(accommodationId)) {
      newWishlist.delete(accommodationId);
    } else {
      newWishlist.add(accommodationId);
    }
    setWishlist(newWishlist);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "accommodation_wishlist",
        JSON.stringify([...newWishlist]),
      );
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedType("");
    setMaxBudget("");
    setSelectedRating("");
    setSelectedCountry("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCity ||
    selectedType ||
    maxBudget ||
    selectedRating ||
    selectedCountry;

  return (
    <>
      <Head>
        <title>Student Accommodations - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Find accommodation recommendations from fellow Erasmus students"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Student Accommodations
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Find accommodation recommendations from fellow Erasmus students
                who've already lived in your destination city.
              </p>
            </header>

            {/* Section Navigation */}
            <nav className="mb-8">
              <div className="flex justify-center">
                <div className="bg-white rounded-lg border p-1 inline-flex">
                  <button
                    onClick={() => setActiveSection("experiences")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === "experiences"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Student Experiences
                  </button>
                  <button
                    onClick={() => setActiveSection("accommodations")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === "accommodations"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Home className="h-4 w-4 inline mr-2" />
                    Platform Listings
                  </button>
                  <button
                    onClick={() => setActiveSection("platforms")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === "platforms"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Globe className="h-4 w-4 inline mr-2" />
                    Platforms
                  </button>
                  <button
                    onClick={() => setActiveSection("university")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === "university"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <GraduationCap className="h-4 w-4 inline mr-2" />
                    University Housing
                  </button>
                  <button
                    onClick={() => setActiveSection("tools")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === "tools"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Calculator className="h-4 w-4 inline mr-2" />
                    Tools
                  </button>
                  <button
                    onClick={() => setActiveSection("support")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === "support"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 inline mr-2" />
                    Support
                  </button>
                </div>
              </div>
            </nav>

            {/* Conditional Section Content */}
            {activeSection === "platforms" && (
              <section className="mb-12">
                <PlatformLinks
                  userCountry={userProfile?.hostCountry}
                  userCity={userProfile?.hostCity}
                />
              </section>
            )}

            {activeSection === "university" && (
              <section className="mb-12">
                <UniversityHousing
                  userCountry={userProfile?.hostCountry}
                  userCity={userProfile?.hostCity}
                  userUniversity={userProfile?.hostUniversity}
                />
              </section>
            )}

            {activeSection === "tools" && (
              <section className="mb-12 space-y-8">
                <BudgetCalculator />
                <SmartRecommendations userProfile={userProfile} />
              </section>
            )}

            {activeSection === "support" && (
              <section className="mb-12">
                <ContactIntegration
                  userCity={userProfile?.hostCity}
                  userCountry={userProfile?.hostCountry}
                />
              </section>
            )}

            {activeSection === "experiences" && (
              <>
                {/* Student Accommodation Experiences */}
                {!isLoading && accommodations.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Real Student Accommodation Experiences
                        </h2>
                        <p className="text-gray-600">
                          Detailed reviews and tips from actual exchange
                          students
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-600"
                      >
                        {accommodations.length} Experience
                        {accommodations.length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {accommodations.map((accommodation) => (
                        <AccommodationExperienceCard
                          key={accommodation.id}
                          accommodation={{
                            ...accommodation,
                            isReal: true,
                            source: "student_experience",
                          }}
                          onSaveToWishlist={(id) => {
                            const newWishlist = new Set(wishlist);
                            if (wishlist.has(id)) {
                              newWishlist.delete(id);
                            } else {
                              newWishlist.add(id);
                            }
                            setWishlist(newWishlist);
                            if (typeof window !== "undefined") {
                              localStorage.setItem(
                                "accommodation_wishlist",
                                JSON.stringify(Array.from(newWishlist)),
                              );
                            }
                          }}
                          isInWishlist={wishlist.has(accommodation.id)}
                        />
                      ))}
                    </div>

                    {(generatedContent?.length || 0) > 6 && (
                      <div className="text-center mt-6">
                        <Button variant="outline">
                          View All {generatedContent?.length || 0} Experiences
                        </Button>
                      </div>
                    )}
                  </section>
                )}

                {/* Stats Overview */}
                {accommodationStats && accommodationStats.length > 0 && (
                  <section className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {accommodationStats.slice(0, 4).map((stat, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <h3 className="font-semibold text-lg mb-2">
                                {stat.city}, {stat.country}
                              </h3>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    €{stat.avgRent}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Avg. Rent
                                  </div>
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-green-600">
                                    ⭐ {stat.avgRating}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Avg. Rating
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {stat.accommodationCount} experiences
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* Loading state */}
                {isLoading && (
                  <section className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-300 rounded"></div>
                              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                              <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* Error state */}
                {error && (
                  <section className="mb-12">
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-8 pb-8 text-center">
                        <div className="max-w-2xl mx-auto">
                          <div className="h-12 w-12 text-red-600 mx-auto mb-4">
                            ⚠️
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Failed to load accommodation experiences
                          </h3>
                          <p className="text-gray-600 mb-6">
                            There was an error loading the accommodation data.
                            Please try refreshing the page.
                          </p>
                          <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            size="lg"
                          >
                            Refresh Page
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* No experiences message */}
                {!isLoading && !error && accommodations.length === 0 && (
                  <section className="mb-12">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-8 pb-8 text-center">
                        <div className="max-w-2xl mx-auto">
                          <Home className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No accommodation experiences yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Be the first to share your accommodation experience
                            to help future students find great places to stay.
                          </p>
                          <Link href="/accommodation">
                            <Button size="lg">
                              <Home className="h-5 w-5 mr-2" />
                              Share Your Accommodation Experience
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Recently Viewed Section */}
                <div className="mb-8">
                  <RecentlyViewed maxItems={3} />
                </div>

                {/* Search and Filters */}
                <section aria-label="Search and filter accommodations">
                  <Card className="mb-8">
                    <CardContent className="pt-6">
                      {/* Search Bar */}
                      <div className="mb-4">
                        <Label htmlFor="search" className="sr-only">
                          Search accommodations
                        </Label>
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                            aria-hidden="true"
                          />
                          <Input
                            id="search"
                            placeholder="Search by city, student, or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                            aria-describedby="search-help"
                          />
                          <div id="search-help" className="sr-only">
                            Search for accommodations by city, student name, or
                            neighborhood
                          </div>
                        </div>
                      </div>

                      {/* Filters Toggle */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setShowFilters(!showFilters)}
                          aria-expanded={showFilters}
                          aria-controls="filter-section"
                        >
                          <SlidersHorizontal className="h-4 w-4 mr-2" />
                          Filters
                          <ChevronDown
                            className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </Button>
                        {hasActiveFilters && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear all
                          </Button>
                        )}
                      </div>

                      {/* Expandable Filters */}
                      {showFilters && (
                        <div
                          id="filter-section"
                          className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t"
                        >
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Select
                              value={selectedCountry}
                              onValueChange={setSelectedCountry}
                            >
                              <SelectTrigger id="country">
                                <SelectValue placeholder="All Countries" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all-countries">
                                  All Countries
                                </SelectItem>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="city">City</Label>
                            <Select
                              value={selectedCity}
                              onValueChange={setSelectedCity}
                            >
                              <SelectTrigger id="city">
                                <SelectValue placeholder="All Cities" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all-cities">
                                  All Cities
                                </SelectItem>
                                {cities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                              value={selectedType}
                              onValueChange={setSelectedType}
                            >
                              <SelectTrigger id="type">
                                <SelectValue placeholder="All Types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all-types">
                                  All Types
                                </SelectItem>
                                {types.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="budget">Max Budget</Label>
                            <Select
                              value={maxBudget}
                              onValueChange={setMaxBudget}
                            >
                              <SelectTrigger id="budget">
                                <SelectValue placeholder="No Limit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no-limit">
                                  No Limit
                                </SelectItem>
                                <SelectItem value="500">€500</SelectItem>
                                <SelectItem value="700">€700</SelectItem>
                                <SelectItem value="1000">��1000</SelectItem>
                                <SelectItem value="1500">€1500</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="rating">Min Rating</Label>
                            <Select
                              value={selectedRating}
                              onValueChange={setSelectedRating}
                            >
                              <SelectTrigger id="rating">
                                <SelectValue placeholder="Any Rating" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all-ratings">
                                  Any Rating
                                </SelectItem>
                                <SelectItem value="4">4+ Stars</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Results Summary */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-gray-600">
                      {finalLoading ? (
                        "Loading accommodations..."
                      ) : (
                        <>
                          Found {accommodations.length} accommodation{" "}
                          {accommodations.length === 1 ? "listing" : "listings"}
                          {currentPage > 1 &&
                            ` (Page ${currentPage} of ${totalPages})`}
                        </>
                      )}
                    </p>
                  </div>
                  <Link href="/accommodation">
                    <Button variant="outline">
                      <Home className="h-4 w-4 mr-2" />
                      Share Your Accommodation
                    </Button>
                  </Link>
                </div>

                {/* Error State */}
                {error && (
                  <Card className="mb-8 bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                      <p className="text-red-800">
                        Failed to load accommodations. Please try again later.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {finalLoading && (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Skeleton className="h-40 w-full" />
                            <div className="lg:col-span-2 space-y-4">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="space-y-4">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-10 w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Student Accommodation Experiences Loading */}
                {contentLoading && (
                  <section className="mb-12">
                    <div className="mb-6">
                      <Skeleton className="h-8 w-64 mb-2" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="pt-6">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <Skeleton className="h-12 w-full mb-4" />
                            <Skeleton className="h-8 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* Student Accommodation Experiences */}
                {!contentLoading &&
                  generatedContent &&
                  generatedContent.length > 0 && (
                    <section className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Real Student Experiences
                          </h2>
                          <p className="text-gray-600">
                            Accommodation reviews and tips from actual exchange
                            students
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-600"
                        >
                          {generatedContent?.length || 0} Experience
                          {(generatedContent?.length || 0) === 1 ? "" : "s"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(generatedContent || [])
                          .slice(0, 6)
                          .map((experience) => (
                            <Card
                              key={experience.id}
                              className="hover:shadow-lg transition-shadow"
                            >
                              <CardContent className="pt-6">
                                <div className="space-y-4">
                                  {/* Header */}
                                  <div>
                                    <div className="flex items-start justify-between mb-2">
                                      <h3 className="font-semibold text-lg">
                                        {experience.accommodationType}
                                      </h3>
                                      {experience.rating && (
                                        <div className="flex items-center gap-1">
                                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                          <span className="text-sm font-medium">
                                            {experience.rating}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                      <MapPin className="h-4 w-4" />
                                      <span>
                                        {experience.city}, {experience.country}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Student Info */}
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Users className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-900">
                                        {experience.studentName}
                                      </span>
                                    </div>
                                    {experience.universityInCyprus && (
                                      <p className="text-xs text-blue-700">
                                        {experience.universityInCyprus} →{" "}
                                        {experience.university}
                                      </p>
                                    )}
                                  </div>

                                  {/* Financial Info */}
                                  {experience.monthlyRent && (
                                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                                      <span className="text-sm text-gray-600">
                                        Monthly Rent:
                                      </span>
                                      <span className="font-semibold text-green-600">
                                        €{experience.monthlyRent}
                                        {experience.billsIncluded && (
                                          <span className="text-xs text-green-500 ml-1">
                                            (bills incl.)
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  )}

                                  {/* Experience Highlights */}
                                  {experience.pros &&
                                    experience.pros.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                          Pros:
                                        </h4>
                                        <div className="space-y-1">
                                          {experience.pros
                                            .slice(0, 2)
                                            .map((pro, index) => (
                                              <div
                                                key={index}
                                                className="flex items-start gap-2"
                                              >
                                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs text-gray-700">
                                                  {pro}
                                                </span>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Tips */}
                                  {experience.tips && (
                                    <div className="bg-yellow-50 rounded-lg p-3">
                                      <h4 className="text-sm font-medium text-yellow-900 mb-1">
                                        Tip:
                                      </h4>
                                      <p className="text-xs text-yellow-800 line-clamp-2">
                                        {experience.tips}
                                      </p>
                                    </div>
                                  )}

                                  {/* Recommendation */}
                                  {experience.wouldRecommend !== undefined && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-gray-600">
                                        Would recommend:
                                      </span>
                                      <span
                                        className={
                                          experience.wouldRecommend
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }
                                      >
                                        {experience.wouldRecommend
                                          ? "✅ Yes"
                                          : "❌ No"}
                                      </span>
                                    </div>
                                  )}

                                  {/* Date */}
                                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                                    Shared{" "}
                                    {new Date(
                                      experience.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>

                      {(generatedContent?.length || 0) > 6 && (
                        <div className="text-center mt-6">
                          <Button variant="outline">
                            View All {generatedContent?.length || 0} Experiences
                          </Button>
                        </div>
                      )}
                    </section>
                  )}

                {/* Enhanced CTA Section */}
                <section className={designSystem.layouts.section}>
                  <div className="space-y-8">
                    <ApplicationCTA className="mb-8" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Card className={designSystem.componentVariants.card.featured}>
                        <CardContent className="pt-8 pb-8 text-center">
                          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Home className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className={designSystem.typography.h3 + " mb-4"}>Share Your Housing Experience</h3>
                          <p className={designSystem.typography.muted + " mb-6"}>Help future students by sharing your accommodation details, costs, and tips.</p>
                          <Link href="/accommodation">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Home className="h-4 w-4 mr-2" />
                              Share Experience
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>

                      <CommunityJoinCTA />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Practical Resources Section */}
            {activeSection === "accommodations" && (
              <section className="mt-12">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Practical Resources & Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">
                          Budget Planning
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>
                            • Use our budget calculator in the Tools section
                          </li>
                          <li>
                            • Consider all costs: rent, utilities, groceries
                          </li>
                          <li>• Look for student discounts and subsidies</li>
                          <li>• Budget for deposits and agency fees</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">
                          Documentation
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Prepare acceptance letter from university</li>
                          <li>• Get proof of income or financial support</li>
                          <li>• Obtain European health insurance card</li>
                          <li>• Keep passport/ID copies ready</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">
                          Safety Tips
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Never pay full rent without viewing</li>
                          <li>• Verify landlord identity and ownership</li>
                          <li>• Read contracts carefully before signing</li>
                          <li>• Check emergency contact numbers</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Smart Recommendations for accommodations section */}
            {activeSection === "accommodations" && userProfile && (
              <section className="mt-8">
                <SmartRecommendations userProfile={userProfile} />
              </section>
            )}

            {/* Wishlist Summary */}
            {activeSection === "accommodations" && wishlist.size > 0 && (
              <section className="mt-8">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-red-600 fill-current" />
                      <h3 className="font-semibold text-red-900">
                        Your Wishlist ({wishlist.size} items)
                      </h3>
                    </div>
                    <p className="text-sm text-red-800">
                      You have {wishlist.size} accommodation
                      {wishlist.size === 1 ? "" : "s"} saved to your wishlist.
                      Your wishlist is saved locally and will be available next
                      time you visit.
                    </p>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
