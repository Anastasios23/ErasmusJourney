import { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Badge } from "../../src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Skeleton } from "../../src/components/ui/skeleton";
import { Label } from "../../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { Checkbox } from "../../src/components/ui/checkbox";
import { Separator } from "../../src/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../src/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import { useUniversities } from "../../src/hooks/useQueries";
import {
  Search,
  Filter,
  Map,
  List,
  ChevronDown,
  ChevronUp,
  MapPin,
  GraduationCap,
  Users,
  Building,
  Globe,
  X,
  SlidersHorizontal,
} from "lucide-react";

// Sample extended university data
const SAMPLE_UNIVERSITIES = [
  {
    id: "ucy",
    name: "University of Cyprus",
    shortName: "UCY",
    type: "PUBLIC",
    country: "Cyprus",
    city: "Nicosia",
    faculties: ["Engineering", "Economics", "Humanities", "Social Sciences"],
    studentCount: 7500,
    internationalStudents: 1200,
    coordinates: { lat: 35.1856, lng: 33.3823 },
    establishedYear: 1989,
    ranking: 501,
    tuitionFee: { min: 0, max: 3000 },
    accommodationTypes: ["On-campus", "Private", "Shared"],
    _count: { faculties: 8, homeAgreements: 150 },
  },
  {
    id: "unic",
    name: "University of Nicosia",
    shortName: "UNIC",
    type: "PRIVATE",
    country: "Cyprus",
    city: "Nicosia",
    faculties: ["Business", "Medicine", "Engineering", "Law"],
    studentCount: 6000,
    internationalStudents: 2500,
    coordinates: { lat: 35.1725, lng: 33.3715 },
    establishedYear: 1980,
    ranking: 801,
    tuitionFee: { min: 8000, max: 15000 },
    accommodationTypes: ["On-campus", "Private"],
    _count: { faculties: 6, homeAgreements: 85 },
  },
  {
    id: "frederick",
    name: "Frederick University",
    shortName: "Frederick",
    type: "PRIVATE",
    country: "Cyprus",
    city: "Nicosia",
    faculties: ["Engineering", "Architecture", "Health Sciences", "Business"],
    studentCount: 4500,
    internationalStudents: 800,
    coordinates: { lat: 35.1612, lng: 33.3492 },
    establishedYear: 2007,
    ranking: 1001,
    tuitionFee: { min: 6000, max: 12000 },
    accommodationTypes: ["Private", "Shared"],
    _count: { faculties: 5, homeAgreements: 45 },
  },
  {
    id: "euc",
    name: "European University Cyprus",
    shortName: "EUC",
    type: "PRIVATE",
    country: "Cyprus",
    city: "Nicosia",
    faculties: ["Business", "Medicine", "Engineering", "Humanities"],
    studentCount: 3500,
    internationalStudents: 600,
    coordinates: { lat: 35.1567, lng: 33.3214 },
    establishedYear: 2007,
    ranking: 1201,
    tuitionFee: { min: 7000, max: 14000 },
    accommodationTypes: ["On-campus", "Private"],
    _count: { faculties: 4, homeAgreements: 38 },
  },
];

const ITEMS_PER_PAGE = 9;

export default function Universities() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedAccommodationTypes, setSelectedAccommodationTypes] = useState<
    string[]
  >([]);
  const [tuitionRange, setTuitionRange] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for development
  const universities = SAMPLE_UNIVERSITIES;
  const isLoading = false;
  const error = null;

  // Extract filter options
  const countries = [...new Set(universities.map((u) => u.country))].sort();
  const cities = [...new Set(universities.map((u) => u.city))].sort();
  const types = [...new Set(universities.map((u) => u.type))];
  const allFaculties = [
    ...new Set(universities.flatMap((u) => u.faculties)),
  ].sort();
  const allAccommodationTypes = [
    ...new Set(universities.flatMap((u) => u.accommodationTypes)),
  ].sort();

  // Filtering logic
  const filteredUniversities = useMemo(() => {
    return universities.filter((uni) => {
      const matchesSearch =
        !searchTerm ||
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.faculties.some((f) =>
          f.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesCountry =
        !selectedCountry ||
        selectedCountry === "all" ||
        uni.country === selectedCountry;

      const matchesCity =
        !selectedCity || selectedCity === "all" || uni.city === selectedCity;

      const matchesType =
        !selectedType || selectedType === "all" || uni.type === selectedType;

      const matchesFaculties =
        selectedFaculties.length === 0 ||
        selectedFaculties.some((f) => uni.faculties.includes(f));

      const matchesAccommodation =
        selectedAccommodationTypes.length === 0 ||
        selectedAccommodationTypes.some((a) =>
          uni.accommodationTypes.includes(a),
        );

      const matchesTuition = (() => {
        if (!tuitionRange || tuitionRange === "all") return true;
        const [min, max] = tuitionRange.split("-").map(Number);
        return uni.tuitionFee.min >= min && uni.tuitionFee.max <= max;
      })();

      return (
        matchesSearch &&
        matchesCountry &&
        matchesCity &&
        matchesType &&
        matchesFaculties &&
        matchesAccommodation &&
        matchesTuition
      );
    });
  }, [
    universities,
    searchTerm,
    selectedCountry,
    selectedCity,
    selectedType,
    selectedFaculties,
    selectedAccommodationTypes,
    tuitionRange,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUniversities = filteredUniversities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedType("");
    setSelectedCity("");
    setSelectedFaculties([]);
    setSelectedAccommodationTypes([]);
    setTuitionRange("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCountry ||
    selectedType ||
    selectedCity ||
    selectedFaculties.length > 0 ||
    selectedAccommodationTypes.length > 0 ||
    tuitionRange;

  return (
    <>
      <Head>
        <title>Universities - Enhanced Search - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Find the perfect university for your Erasmus exchange with advanced search and map view"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Perfect University
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explore universities with advanced filtering and map view to
                find the perfect match for your Erasmus exchange.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Filters
                      </span>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search */}
                    <div>
                      <Label htmlFor="search">Search Universities</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="search"
                          placeholder="Search by name, city, faculty..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Country Filter */}
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
                          <SelectItem value="all">All Countries</SelectItem>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Filter */}
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
                          <SelectItem value="all">All Cities</SelectItem>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <Label htmlFor="type">University Type</Label>
                      <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === "PUBLIC" ? "Public" : "Private"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Faculties Filter */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <Label>Faculties ({selectedFaculties.length})</Label>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {allFaculties.map((faculty) => (
                          <div
                            key={faculty}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`faculty-${faculty}`}
                              checked={selectedFaculties.includes(faculty)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedFaculties([
                                    ...selectedFaculties,
                                    faculty,
                                  ]);
                                } else {
                                  setSelectedFaculties(
                                    selectedFaculties.filter(
                                      (f) => f !== faculty,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`faculty-${faculty}`}
                              className="text-sm cursor-pointer"
                            >
                              {faculty}
                            </Label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Accommodation Types Filter */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <Label>
                          Accommodation ({selectedAccommodationTypes.length})
                        </Label>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {allAccommodationTypes.map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`accom-${type}`}
                              checked={selectedAccommodationTypes.includes(
                                type,
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAccommodationTypes([
                                    ...selectedAccommodationTypes,
                                    type,
                                  ]);
                                } else {
                                  setSelectedAccommodationTypes(
                                    selectedAccommodationTypes.filter(
                                      (t) => t !== type,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`accom-${type}`}
                              className="text-sm cursor-pointer"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Tuition Range Filter */}
                    <div>
                      <Label htmlFor="tuition">Tuition Range (EUR/year)</Label>
                      <Select
                        value={tuitionRange}
                        onValueChange={setTuitionRange}
                      >
                        <SelectTrigger id="tuition">
                          <SelectValue placeholder="Any Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Range</SelectItem>
                          <SelectItem value="0-3000">
                            €0 - €3,000 (Free/Low)
                          </SelectItem>
                          <SelectItem value="3000-8000">
                            €3,000 - €8,000 (Moderate)
                          </SelectItem>
                          <SelectItem value="8000-15000">
                            €8,000 - €15,000 (High)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <p className="text-gray-600">
                      {filteredUniversities.length} universities found
                    </p>
                    {hasActiveFilters && (
                      <Badge variant="secondary">
                        {
                          Object.entries({
                            Search: searchTerm,
                            Country: selectedCountry,
                            City: selectedCity,
                            Type: selectedType,
                            Faculties: selectedFaculties.length,
                            Accommodation: selectedAccommodationTypes.length,
                            Tuition: tuitionRange,
                          }).filter(([_, value]) => value).length
                        }{" "}
                        filters active
                      </Badge>
                    )}
                  </div>

                  {/* View Mode Toggle */}
                  <Tabs
                    value={viewMode}
                    onValueChange={(v) => setViewMode(v as "list" | "map")}
                  >
                    <TabsList>
                      <TabsTrigger
                        value="list"
                        className="flex items-center gap-2"
                      >
                        <List className="h-4 w-4" />
                        List
                      </TabsTrigger>
                      <TabsTrigger
                        value="map"
                        className="flex items-center gap-2"
                      >
                        <Map className="h-4 w-4" />
                        Map
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Content Area */}
                <Tabs value={viewMode} className="w-full">
                  <TabsContent value="list" className="space-y-6">
                    {/* Universities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedUniversities.map((university) => (
                        <Card
                          key={university.id}
                          className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() =>
                            router.push(`/universities/${university.id}`)
                          }
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg leading-tight">
                                  {university.name}
                                </CardTitle>
                                <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>
                                    {university.city}, {university.country}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  university.type === "PUBLIC"
                                    ? "default"
                                    : "secondary"
                                }
                                className="ml-2"
                              >
                                {university.type === "PUBLIC"
                                  ? "Public"
                                  : "Private"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-blue-500" />
                                <span>{university.studentCount} students</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3 text-green-500" />
                                <span>
                                  {university.internationalStudents}{" "}
                                  international
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3 text-purple-500" />
                                <span>
                                  {university._count.faculties} faculties
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3 text-orange-500" />
                                <span>
                                  {university._count.homeAgreements}{" "}
                                  partnerships
                                </span>
                              </div>
                            </div>

                            {/* Faculties */}
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-2">
                                Faculties:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {university.faculties
                                  .slice(0, 3)
                                  .map((faculty) => (
                                    <Badge
                                      key={faculty}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {faculty}
                                    </Badge>
                                  ))}
                                {university.faculties.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{university.faculties.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Tuition */}
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-sm text-gray-600">
                                Tuition (yearly):
                              </span>
                              <span className="font-medium">
                                {university.tuitionFee.min === 0
                                  ? "Free"
                                  : `€${university.tuitionFee.min}`}
                                {university.tuitionFee.max !==
                                  university.tuitionFee.min &&
                                  ` - €${university.tuitionFee.max}`}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* No Results */}
                    {filteredUniversities.length === 0 && !isLoading && (
                      <div className="text-center py-12">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No universities found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Try adjusting your search criteria or filters.
                        </p>
                        <Button onClick={clearFilters}>
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="map">
                    <Card className="h-[600px] flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Interactive Map View
                        </h3>
                        <p className="text-gray-600 mb-4 max-w-md">
                          Map integration would show university locations with
                          markers. Click on markers to see university details
                          and navigate to their pages.
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                          <p>Featured universities on the map:</p>
                          {filteredUniversities.slice(0, 3).map((uni) => (
                            <div
                              key={uni.id}
                              className="flex items-center gap-2"
                            >
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span>
                                {uni.name} - {uni.city}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* CTA Section */}
            <section className="mt-16">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Found Your Perfect University?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Start your application process and begin your Erasmus
                    journey today.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="/basic-information">
                      <Button size="lg">Start Application</Button>
                    </Link>
                    <Link href="/course-matching">
                      <Button variant="outline" size="lg">
                        Course Matching
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
