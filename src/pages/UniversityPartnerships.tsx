import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import {
  Search,
  MapPin,
  GraduationCap,
  Building2,
  Globe,
  BookOpen,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByUniversity,
  getAgreementsByDepartment,
  getPartnerCountries,
  searchAgreements,
} from "@/data/universityAgreements";
import {
  generateEnhancedDestinations,
  getDestinationStatistics,
  searchUniversities,
} from "@/data/enhancedDestinations";

const UniversityPartnerships = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"destinations" | "partnerships">(
    "destinations",
  );

  const statistics = useMemo(() => getDestinationStatistics(), []);
  const partnerCountries = useMemo(() => getPartnerCountries(), []);

  // Get all unique departments across all universities
  const allDepartments = useMemo(() => {
    const depts = new Set<string>();
    CYPRUS_UNIVERSITIES.forEach((uni) => {
      uni.departments.forEach((dept) => depts.add(dept));
    });
    return Array.from(depts).sort();
  }, []);

  // Filter data based on current selections
  const filteredData = useMemo(() => {
    if (viewMode === "destinations") {
      let destinations = generateEnhancedDestinations();

      if (selectedCountry !== "all") {
        destinations = destinations.filter(
          (dest) => dest.country === selectedCountry,
        );
      }

      if (selectedUniversity !== "all") {
        destinations = destinations.filter((dest) =>
          dest.cyprusUniversityPartnerships.some(
            (p) => p.universityCode === selectedUniversity,
          ),
        );
      }

      if (selectedDepartment !== "all") {
        destinations = destinations.filter((dest) =>
          dest.availableForDepartments.includes(selectedDepartment),
        );
      }

      if (searchQuery) {
        destinations = destinations.filter(
          (dest) =>
            dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dest.university.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      return destinations;
    } else {
      let agreements = [...ALL_UNIVERSITY_AGREEMENTS];

      if (selectedUniversity !== "all") {
        agreements = agreements.filter(
          (agreement) => agreement.homeUniversity === selectedUniversity,
        );
      }

      if (selectedCountry !== "all") {
        agreements = agreements.filter(
          (agreement) => agreement.partnerCountry === selectedCountry,
        );
      }

      if (selectedDepartment !== "all") {
        agreements = agreements.filter(
          (agreement) => agreement.homeDepartment === selectedDepartment,
        );
      }

      if (searchQuery) {
        agreements = searchAgreements(searchQuery);
      }

      return agreements;
    }
  }, [
    viewMode,
    selectedCountry,
    selectedUniversity,
    selectedDepartment,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedUniversity("all");
    setSelectedCountry("all");
    setSelectedDepartment("all");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              University Partnerships
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Explore comprehensive partnership agreements between Cyprus
              universities and institutions across Europe
            </p>
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <div className="bg-white/10 rounded-lg p-6">
                <MapPin className="h-8 w-8 text-blue-200 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {statistics.totalDestinations}
                </div>
                <div className="text-blue-200">Partner Cities</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <Globe className="h-8 w-8 text-blue-200 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {statistics.totalCountries}
                </div>
                <div className="text-blue-200">Countries</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <Building2 className="h-8 w-8 text-blue-200 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {statistics.totalPartnerships}
                </div>
                <div className="text-blue-200">Partnerships</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <BookOpen className="h-8 w-8 text-blue-200 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {statistics.totalDepartments}
                </div>
                <div className="text-blue-200">Academic Fields</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "destinations" ? "default" : "outline"}
                onClick={() => setViewMode("destinations")}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Destinations
              </Button>
              <Button
                variant={viewMode === "partnerships" ? "default" : "outline"}
                onClick={() => setViewMode("partnerships")}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Partnerships
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search universities, cities, countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select
                value={selectedUniversity}
                onValueChange={setSelectedUniversity}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {CYPRUS_UNIVERSITIES.map((uni) => (
                    <SelectItem key={uni.code} value={uni.code}>
                      {uni.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {partnerCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {allDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {viewMode === "destinations"
                ? "Partner Destinations"
                : "Partnership Agreements"}
            </h2>
            <p className="text-gray-600">
              {Array.isArray(filteredData) ? filteredData.length : 0} results
              found
            </p>
          </div>

          {viewMode === "destinations" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredData as any[]).map((destination: any) => (
                <Card
                  key={destination.id}
                  className="h-full hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={destination.imageUrl}
                        alt={`${destination.city}, ${destination.country}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          className={`${
                            destination.costOfLiving === "low"
                              ? "bg-green-500"
                              : destination.costOfLiving === "medium"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          } text-white`}
                        >
                          {destination.costOfLiving} cost
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary">
                          {destination.totalCyprusPartnerships} partnerships
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {destination.city}, {destination.country}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {destination.university}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />€
                          {destination.averageRent}/month avg. rent
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2" />
                          {destination.language}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Cyprus University Partners:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {destination.cyprusUniversityPartnerships.map(
                              (partner: any) => (
                                <Badge
                                  key={partner.universityCode}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {partner.universityCode}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Popular Fields:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {destination.popularWith
                              .slice(0, 3)
                              .map((field: string) => (
                                <Badge
                                  key={field}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {field}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(filteredData as any[]).map((agreement: any, index: number) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {agreement.partnerUniversity}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          {agreement.partnerCity}, {agreement.partnerCountry}
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {agreement.homeUniversity}
                          </Badge>
                          <Badge variant="secondary">
                            {agreement.homeDepartment}
                          </Badge>
                          {agreement.agreementType && (
                            <Badge variant="outline">
                              {agreement.agreementType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    {agreement.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          {agreement.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Countries Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Top Partner Countries
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {statistics.topCountries.slice(0, 10).map((country, index) => (
              <Card key={country.country} className="text-center">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    #{index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {country.country}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>{country.destinationCount} cities</div>
                    <div>{country.partnershipCount} partnerships</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UniversityPartnerships;
