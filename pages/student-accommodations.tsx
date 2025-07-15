import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Badge } from "../src/components/ui/badge";
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

  const {
    data: accommodations = [],
    isLoading,
    error,
  } = useAccommodations(filters);
  const contactMutation = useContactStudent();

  // Get generated content from user submissions
  const { content: generatedContent, loading: contentLoading } =
    useGeneratedContent("accommodations");

  // Get real accommodation experiences from form submissions (like destinations page)
  const [accommodationExperiences, setAccommodationExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);

  // User profile and preferences
  const { getDraftData } = useFormSubmissions();
  const [userProfile, setUserProfile] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [activeSection, setActiveSection] = useState("accommodations");

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

  // Fetch accommodation experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      setExperiencesLoading(true);
      try {
        const response = await fetch("/api/accommodation/experiences");
        if (response.ok) {
          const data = await response.json();
          setAccommodationExperiences(data.accommodations || []);
        }
      } catch (error) {
        console.error("Error fetching accommodation experiences:", error);
      } finally {
        setExperiencesLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  // Combine generated content with existing data, ensuring unique IDs
  const allAccommodations = [
    ...(generatedContent?.accommodations || []).map((item, index) => ({
      ...item,
      id: item.id ? `generated-${item.id}` : `generated-${index}`,
    })),
    ...(accommodations || []).map((item, index) => ({
      ...item,
      id: item.id ? `api-${item.id}` : `api-${index}`,
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
                    onClick={() => setActiveSection("accommodations")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === "accommodations"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Home className="h-4 w-4 inline mr-2" />
                    Accommodations
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

            {activeSection === "accommodations" && (
              <>
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
                {experiencesLoading && (
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
                {!experiencesLoading && accommodationExperiences.length > 0 && (
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
                        {accommodationExperiences.length} Experience
                        {accommodationExperiences.length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {accommodationExperiences
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

                    {accommodationExperiences.length > 6 && (
                      <div className="text-center mt-6">
                        <Button variant="outline">
                          View All {accommodationExperiences.length} Experiences
                        </Button>
                      </div>
                    )}
                  </section>
                )}

                {/* CTA Section */}
                <section className="mt-12">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-8 pb-8 text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Help Future Students Find Great Housing
                      </h2>
                      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Share details about your accommodation to help other
                        students find great places to live during their Erasmus
                        experience.
                      </p>
                      <Link href="/accommodation">
                        <Button size="lg">
                          <Home className="h-5 w-5 mr-2" />
                          Share Your Accommodation
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
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
