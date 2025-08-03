import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Badge } from "../src/components/ui/badge";
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
import {
  Search,
  MapPin,
  GraduationCap,
  BookOpen,
  Users,
  Filter,
  ExternalLink,
  CheckCircle,
  Star,
  Globe,
  Mail,
} from "lucide-react";
import {
  ErasmusIcon,
  UniversityIcon,
  StudyAbroadIcon,
} from "../src/components/icons/CustomIcons";
import { OptimizedImage } from "../src/components/ui/OptimizedImage";

interface UniversityExchange {
  id: string;
  universityName: string;
  location: string;
  country: string;
  studentsCount: number;
  departments: string[];
  studyLevels: string[];
  cyprusUniversities: string[];
  courseMatches: number;
  totalHostCourses?: string;
  totalHomeCourses?: string;
  image: string;
  description: string;
  highlights: string[];
  averageRating: number;
  academicStrength: string;
  researchFocus: string[];
  languageOfInstruction: string[];
  semesterOptions: string[];
  applicationDeadline: string;
  establishedYear: number;
  worldRanking?: number;
  erasmusCode: string;
  contactEmail: string;
  website: string;
}

export default function UniversityExchanges() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [exchanges, setExchanges] = useState<UniversityExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedAcademicStrength, setSelectedAcademicStrength] =
    useState("All Fields");
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("All Levels");
  const [selectedPopularity, setSelectedPopularity] =
    useState("All Universities");

  // Ensure component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch university exchanges from our API
  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/university-exchanges");
      if (response.ok) {
        const data = await response.json();
        setExchanges(data);
      }
    } catch (error) {
      console.error("Error fetching university exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  // Get unique filter options
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(exchanges.map((e) => e.country))]
      .filter((c) => c !== "Unknown")
      .sort();
    return ["All Countries", ...uniqueCountries];
  }, [exchanges]);

  const academicStrengths = useMemo(() => {
    const unique = [
      ...new Set(exchanges.map((e) => e.academicStrength)),
    ].sort();
    return ["All Fields", ...unique];
  }, [exchanges]);

  const studyLevels = useMemo(() => {
    const allLevels = exchanges.flatMap((e) => e.studyLevels);
    const unique = [...new Set(allLevels)].sort();
    return ["All Levels", ...unique];
  }, [exchanges]);

  // Filter exchanges
  const filteredExchanges = useMemo(() => {
    return exchanges.filter((exchange) => {
      const matchesSearch =
        searchTerm === "" ||
        exchange.universityName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exchange.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exchange.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exchange.departments.some((dept) =>
          dept.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesCountry =
        selectedCountry === "All Countries" ||
        exchange.country === selectedCountry;

      const matchesAcademicStrength =
        selectedAcademicStrength === "All Fields" ||
        exchange.academicStrength === selectedAcademicStrength;

      const matchesStudyLevel =
        selectedStudyLevel === "All Levels" ||
        exchange.studyLevels.includes(selectedStudyLevel.toLowerCase());

      const matchesPopularity =
        selectedPopularity === "All Universities" ||
        (selectedPopularity === "Popular (10+ Students)" &&
          exchange.studentsCount >= 10) ||
        (selectedPopularity === "Very Popular (20+ Students)" &&
          exchange.studentsCount >= 20) ||
        (selectedPopularity === "Emerging (5-9 Students)" &&
          exchange.studentsCount >= 5 &&
          exchange.studentsCount < 10) ||
        (selectedPopularity === "Small Programs (1-4 Students)" &&
          exchange.studentsCount >= 1 &&
          exchange.studentsCount < 5);

      return (
        matchesSearch &&
        matchesCountry &&
        matchesAcademicStrength &&
        matchesStudyLevel &&
        matchesPopularity
      );
    });
  }, [
    exchanges,
    searchTerm,
    selectedCountry,
    selectedAcademicStrength,
    selectedStudyLevel,
    selectedPopularity,
  ]);

  // Statistics
  const stats = useMemo(() => {
    if (exchanges.length === 0) {
      return {
        totalUniversities: 0,
        totalStudents: 0,
        uniqueCountries: 0,
        avgRating: "0",
        withCourseData: 0,
      };
    }

    const totalUniversities = exchanges.length;
    const totalStudents = exchanges.reduce(
      (sum, e) => sum + e.studentsCount,
      0,
    );
    const uniqueCountries = new Set(
      exchanges.map((e) => e.country).filter((c) => c !== "Unknown"),
    ).size;
    const avgRating = (
      exchanges.reduce((sum, e) => sum + e.averageRating, 0) / totalUniversities
    ).toFixed(1);
    const withCourseData = exchanges.filter((e) => e.courseMatches > 0).length;

    return {
      totalUniversities,
      totalStudents,
      uniqueCountries,
      avgRating,
      withCourseData,
    };
  }, [exchanges]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || loading) {
    return (
      <>
        <Head>
          <title>University Exchanges - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Explore partner universities for your Erasmus exchange"
          />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  University Exchanges
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Loading partner universities...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>University Exchanges - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore partner universities for your Erasmus exchange based on real student data"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 py-20">
          {/* Custom academic background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 1200 400" className="w-full h-full">
              <defs>
                <pattern
                  id="academicPattern"
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="30" cy="30" r="1" fill="currentColor" />
                  <rect
                    x="25"
                    y="25"
                    width="10"
                    height="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#academicPattern)" />

              {/* University buildings silhouettes */}
              <g opacity="0.3" fill="currentColor">
                <rect x="100" y="200" width="40" height="80" />
                <rect x="120" y="180" width="40" height="100" />
                <rect x="140" y="160" width="40" height="120" />
                <polygon points="120,160 140,140 160,160" />

                <rect x="800" y="220" width="50" height="60" />
                <rect x="825" y="200" width="50" height="80" />
                <polygon points="825,200 850,180 875,200" />
              </g>
            </svg>
          </div>

          <div className="absolute inset-0 bg-black/30" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Icon row */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-4">
                <UniversityIcon
                  size={48}
                  className="text-yellow-300 animate-pulse"
                />
                <ErasmusIcon size={48} className="text-blue-300" />
                <StudyAbroadIcon
                  size={48}
                  className="text-teal-300 animate-pulse"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              University{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Exchanges
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover partner universities and hear from fellow Cypriot
              students about their academic experiences abroad
            </p>
          </div>
        </div>

        <div className="pt-8 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Universities
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalUniversities}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Cyprus Students
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalStudents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Globe className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Countries
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.uniqueCountries}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Course Data
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.withCourseData}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Avg Rating
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.avgRating}/5
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter Universities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search universities, cities, departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedAcademicStrength}
                    onValueChange={setSelectedAcademicStrength}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Academic Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicStrengths.map((strength) => (
                        <SelectItem key={strength} value={strength}>
                          {strength}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedStudyLevel}
                    onValueChange={setSelectedStudyLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Study Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedPopularity}
                    onValueChange={setSelectedPopularity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Popularity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Universities">
                        All Universities
                      </SelectItem>
                      <SelectItem value="Very Popular (20+ Students)">
                        Very Popular (20+)
                      </SelectItem>
                      <SelectItem value="Popular (10+ Students)">
                        Popular (10+)
                      </SelectItem>
                      <SelectItem value="Emerging (5-9 Students)">
                        Emerging (5-9)
                      </SelectItem>
                      <SelectItem value="Small Programs (1-4 Students)">
                        Small Programs (1-4)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCountry("All Countries");
                      setSelectedAcademicStrength("All Fields");
                      setSelectedStudyLevel("All Levels");
                      setSelectedPopularity("All Universities");
                    }}
                  >
                    Clear All Filters
                  </Button>
                  <div className="text-sm text-gray-600 flex items-center">
                    Showing {filteredExchanges.length} of {exchanges.length}{" "}
                    universities
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* University Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExchanges.map((exchange) => (
                <Card
                  key={exchange.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() =>
                    router.push(`/university-exchanges/${exchange.id}`)
                  }
                >
                  <CardContent className="p-0">
                    {/* University Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg">
                      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-white bg-opacity-90"
                        >
                          {exchange.studentsCount} Cyprus students
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center bg-white bg-opacity-90 rounded px-2 py-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">
                            {exchange.averageRating}
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {exchange.universityName}
                        </h3>
                        <div className="flex items-center text-white text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {exchange.location !== "Unknown Location"
                            ? exchange.location
                            : exchange.country}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* University Info */}
                      <div className="space-y-4">
                        {/* Academic Strength & Established */}
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {exchange.academicStrength}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              Est. {exchange.establishedYear}
                              {exchange.worldRanking &&
                                ` • Ranked #${exchange.worldRanking}`}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {exchange.description}
                        </p>

                        {/* Highlights */}
                        {exchange.highlights.length > 0 && (
                          <div className="space-y-2">
                            {exchange.highlights
                              .slice(0, 3)
                              .map((highlight, index) => (
                                <div
                                  key={index}
                                  className="flex items-center text-sm text-gray-600"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  {highlight}
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Study Levels & Languages */}
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Study Levels:{" "}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exchange.studyLevels.map((level, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {level.charAt(0).toUpperCase() +
                                    level.slice(1)}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Languages:{" "}
                            </span>
                            <span className="text-sm text-gray-600">
                              {exchange.languageOfInstruction.join(", ")}
                            </span>
                          </div>
                        </div>

                        {/* Course Matching Info */}
                        {exchange.courseMatches > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center text-blue-800 mb-1">
                              <BookOpen className="h-4 w-4 mr-2" />
                              <span className="font-medium">
                                Course Matching Available
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              {exchange.courseMatches} students have shared
                              course mapping data
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/university-exchanges/${exchange.id}`,
                              );
                            }}
                          >
                            View Details
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `mailto:${exchange.contactEmail}`,
                                "_blank",
                              );
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Additional Info */}
                        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                          <div>
                            Application Deadline: {exchange.applicationDeadline}
                          </div>
                          <div>Erasmus Code: {exchange.erasmusCode}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredExchanges.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No universities found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms to find more
                    universities.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCountry("All Countries");
                      setSelectedAcademicStrength("All Fields");
                      setSelectedStudyLevel("All Levels");
                      setSelectedPopularity("All Universities");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Call to Action */}
            <section className="mt-16">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Start Your Exchange?
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Join hundreds of Cyprus students who have successfully
                    completed their Erasmus journey. Start your application
                    today!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/basic-information">
                      <Button size="lg">
                        Start Application
                        <ExternalLink className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/destinations">
                      <Button variant="outline" size="lg">
                        Browse Destinations
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
