import { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Badge } from "../src/components/ui/badge";
import { Card, CardContent } from "../src/components/ui/card";
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

  // Pagination
  const totalPages = Math.ceil(accommodations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAccommodations = accommodations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Filter options derived from data
  const cities = [...new Set(accommodations.map((a) => a.city))].sort();
  const countries = [...new Set(accommodations.map((a) => a.country))].sort();
  const types = [
    ...new Set(accommodations.map((a) => a.accommodationType)),
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
    router.push(`/accommodation-detail/${id}`);
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
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Student Accommodations
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Find accommodation recommendations from fellow Erasmus students
                who've already lived in your destination city.
              </p>
            </header>

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
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
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
                            <SelectItem value="all-types">All Types</SelectItem>
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
                        <Select value={maxBudget} onValueChange={setMaxBudget}>
                          <SelectTrigger id="budget">
                            <SelectValue placeholder="No Limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-limit">No Limit</SelectItem>
                            <SelectItem value="500">€500</SelectItem>
                            <SelectItem value="700">€700</SelectItem>
                            <SelectItem value="1000">€1000</SelectItem>
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
                  {isLoading ? (
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
            {isLoading && (
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

            {/* Accommodation Listings */}
            {!isLoading && !error && (
              <section aria-label="Accommodation listings">
                <div className="space-y-6">
                  {paginatedAccommodations.map((listing) => (
                    <article
                      key={listing.id}
                      className="group"
                      aria-labelledby={`accommodation-${listing.id}-title`}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Image */}
                            <div className="lg:col-span-1">
                              <div className="aspect-video overflow-hidden rounded-lg">
                                <img
                                  src={listing.photos[0]}
                                  alt={`${listing.accommodationType} in ${listing.city}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              {listing.featured && (
                                <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                                  Featured
                                </Badge>
                              )}
                            </div>

                            {/* Content */}
                            <div className="lg:col-span-2 space-y-4">
                              <div>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h2
                                      id={`accommodation-${listing.id}-title`}
                                      className="text-xl font-semibold mb-1"
                                    >
                                      {listing.accommodationType} in{" "}
                                      {listing.neighborhood}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                      <MapPin
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                      />
                                      <span>
                                        {listing.city}, {listing.country}
                                      </span>
                                      {listing.verified && (
                                        <CheckCircle
                                          className="h-4 w-4 text-green-500"
                                          aria-label="Verified listing"
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star
                                      className="h-4 w-4 text-yellow-400 fill-current"
                                      aria-hidden="true"
                                    />
                                    <span
                                      className="font-medium"
                                      aria-label={`${listing.rating} out of 5 stars`}
                                    >
                                      {listing.rating}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-gray-700 mb-4">
                                  {listing.description}
                                </p>

                                {/* Highlights */}
                                <div
                                  className="flex flex-wrap gap-2 mb-4"
                                  role="list"
                                  aria-label="Accommodation highlights"
                                >
                                  {listing.highlights.map(
                                    (highlight, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                        role="listitem"
                                      >
                                        {highlight}
                                      </Badge>
                                    ),
                                  )}
                                </div>

                                {/* Facilities */}
                                <div
                                  className="flex flex-wrap gap-3 text-sm text-gray-600"
                                  role="list"
                                  aria-label="Available facilities"
                                >
                                  {listing.facilities
                                    .slice(0, 4)
                                    .map((facility) => (
                                      <div
                                        key={facility}
                                        className="flex items-center gap-1"
                                        role="listitem"
                                      >
                                        {facility === "Wifi" && (
                                          <Wifi
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                          />
                                        )}
                                        {facility === "Kitchen" && (
                                          <Utensils
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                          />
                                        )}
                                        {facility === "Parking" && (
                                          <Car
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                          />
                                        )}
                                        <span>{facility}</span>
                                      </div>
                                    ))}
                                  {listing.facilities.length > 4 && (
                                    <span className="text-blue-600">
                                      +{listing.facilities.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Price and Actions */}
                            <div className="lg:col-span-1 flex flex-col justify-between">
                              <div>
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                  €{listing.monthlyRent}
                                  <span className="text-sm text-gray-500">
                                    /month
                                  </span>
                                </div>

                                {/* Student Info */}
                                <div className="flex items-center gap-2 mb-4">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.studentName}`}
                                      alt={`${listing.studentName}'s avatar`}
                                    />
                                    <AvatarFallback>
                                      {listing.studentName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-medium">
                                      {listing.studentName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(
                                        listing.datePosted,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Button
                                  className="w-full"
                                  onClick={() => handleViewDetails(listing.id)}
                                  aria-describedby={`accommodation-${listing.id}-title`}
                                >
                                  <ExternalLink
                                    className="h-4 w-4 mr-2"
                                    aria-hidden="true"
                                  />
                                  View Details
                                </Button>

                                {listing.contact.allowContact && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled={contactMutation.isPending}
                                      >
                                        <Mail
                                          className="h-4 w-4 mr-2"
                                          aria-hidden="true"
                                        />
                                        {contactMutation.isPending
                                          ? "Contacting..."
                                          : "Contact Student"}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Contact Student
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will open your email client to
                                          send a message to{" "}
                                          {listing.studentName} about their
                                          accommodation in {listing.city}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleContactStudent(listing)
                                          }
                                        >
                                          Open Email
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                            aria-disabled={currentPage === 1}
                          />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                  aria-current={
                                    currentPage === page ? "page" : undefined
                                  }
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1),
                              )
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                            aria-disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </section>
            )}

            {/* No Results */}
            {!isLoading && !error && accommodations.length === 0 && (
              <div className="text-center py-12">
                <Home
                  className="h-12 w-12 text-gray-400 mx-auto mb-4"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No accommodations found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or be the first to share
                  accommodation info for this location.
                </p>
                <Link href="/accommodation">
                  <Button>Share Your Accommodation</Button>
                </Link>
              </div>
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
          </div>
        </main>
      </div>
    </>
  );
}
