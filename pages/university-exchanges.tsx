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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import AgreementDetails from "../components/AgreementDetails";
import UniversitySubmissions from "../components/UniversitySubmissions";
import {
  Search,
  MapPin,
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  Filter,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
} from "../src/data/universityAgreements";
import { UNIC_COMPREHENSIVE_AGREEMENTS } from "../src/data/unic_agreements_temp";

// Real form submissions will be fetched from the database via API

// State for real form submissions
interface FormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const cyprusUniversities = [...CYPRUS_UNIVERSITIES.map((uni) => uni.name)];

// Get all unique countries from actual agreements
const allCountries = [
  ...new Set(
    ALL_UNIVERSITY_AGREEMENTS.map((agreement) => agreement.partnerCountry),
  ),
].sort();
const countries = ["All Countries", ...allCountries];

// Get all unique departments from all Cyprus universities
const allDepartments = CYPRUS_UNIVERSITIES.reduce((deps, uni) => {
  return [...deps, ...uni.departments];
}, [] as string[]);
const uniqueDepartments = [...new Set(allDepartments)].sort();
const departments = ["All Departments", ...uniqueDepartments];

export default function UniversityExchanges() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCyprusUni, setSelectedCyprusUni] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedHostUniversity, setSelectedHostUniversity] = useState(
    "All Host Universities",
  );
  const [
    selectedUniversityForSubmissions,
    setSelectedUniversityForSubmissions,
  ] = useState<string | null>(null);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  // Ensure component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch form submissions and convert to display format
  const fetchFormSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const response = await fetch("/api/form-submissions");
      if (response.ok) {
        const submissions = await response.json();
        setFormSubmissions(submissions);
      }
    } catch (error) {
      console.error("Error fetching form submissions:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormSubmissions();
  }, []);

  // Convert form submissions to exchange history format for display
  // Only show COURSE_MATCHING submissions
  const exchangeHistory = useMemo(() => {
    return formSubmissions
      .filter((submission) => submission.type === "COURSE_MATCHING")
      .map((submission) => {
        const data = submission.data;
        return {
          id: submission.id,
          student: {
            name:
              `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
              "Anonymous Student",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.id}`,
            cyprusUniversity: data.universityInCyprus || "Cyprus University",
            department: data.departmentInCyprus || "Unknown Department",
            year: data.exchangePeriod || "2024",
          },
          exchange: {
            university: data.hostUniversity || "Unknown University",
            country: data.hostCountry || "Unknown Country",
            city: data.hostCity || "Unknown City",
            duration: "1 Semester", // Default duration
            period: data.exchangePeriod || "2024",
          },
          courses: data.hostCourses || [],
          rating: data.overallRating || 4.0,
          review: data.personalExperience || submission.title,
          submissionType: submission.type,
          submissionTitle: submission.title,
        };
      });
  }, [formSubmissions]);

  // Get available destinations based on selected filters
  const availableDestinations = useMemo(() => {
    if (!selectedCyprusUni || selectedDepartment === "All Departments") {
      return [];
    }

    const cyprusUni = CYPRUS_UNIVERSITIES.find(
      (uni) => uni.name === selectedCyprusUni,
    );
    if (!cyprusUni) return [];

    let agreements;
    if (cyprusUni.code === "UNIC" && selectedLevel !== "All Levels") {
      const level = selectedLevel.toLowerCase() as
        | "bachelor"
        | "master"
        | "phd";
      agreements = getAgreementsByDepartmentAndLevel(
        cyprusUni.code,
        selectedDepartment,
        level,
      );
    } else {
      agreements = getAgreementsByDepartment(
        cyprusUni.code,
        selectedDepartment,
      );
    }

    return agreements.map((agreement) => ({
      university: agreement.partnerUniversity,
      city: agreement.partnerCity,
      country: agreement.partnerCountry,
      level: agreement.academicLevel || "all",
    }));
  }, [selectedCyprusUni, selectedDepartment, selectedLevel]);

  // Get available host universities based on selected filters
  const availableHostUniversities = useMemo(() => {
    if (!selectedCyprusUni || selectedDepartment === "All Departments") {
      return [];
    }

    const cyprusUni = CYPRUS_UNIVERSITIES.find(
      (uni) => uni.name === selectedCyprusUni,
    );
    if (!cyprusUni) return [];

    let agreements;
    if (cyprusUni.code === "UNIC" && selectedLevel !== "All Levels") {
      const level = selectedLevel.toLowerCase() as
        | "bachelor"
        | "master"
        | "phd";
      agreements = getAgreementsByDepartmentAndLevel(
        cyprusUni.code,
        selectedDepartment,
        level,
      );
    } else {
      agreements = getAgreementsByDepartment(
        cyprusUni.code,
        selectedDepartment,
      );
    }

    // Get unique host universities from agreements
    const hostUniversities = [
      ...new Set(agreements.map((agreement) => agreement.partnerUniversity)),
    ];
    return hostUniversities.sort();
  }, [selectedCyprusUni, selectedDepartment, selectedLevel]);

  // Filter the exchange history based on search criteria and available agreements
  const filteredHistory = useMemo(() => {
    return exchangeHistory.filter((exchange) => {
      const matchesSearch =
        searchTerm === "" ||
        exchange.student.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exchange.exchange.university
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exchange.exchange.city
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        exchange.courses.some(
          (course) =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.cyprusEquivalent
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );

      const matchesCyprusUni =
        !selectedCyprusUni ||
        exchange.student.cyprusUniversity === selectedCyprusUni;

      const matchesCountry =
        selectedCountry === "All Countries" ||
        exchange.exchange.country === selectedCountry;

      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        exchange.student.department === selectedDepartment;

      const matchesHostUniversity =
        selectedHostUniversity === "All Host Universities" ||
        exchange.exchange.university === selectedHostUniversity;

      // Check if this exchange destination is available based on actual agreements
      const matchesAgreements =
        availableDestinations.length === 0 ||
        availableDestinations.some(
          (dest) =>
            dest.university === exchange.exchange.university &&
            dest.city === exchange.exchange.city &&
            dest.country === exchange.exchange.country,
        );

      return (
        matchesSearch &&
        matchesCyprusUni &&
        matchesCountry &&
        matchesDepartment &&
        matchesHostUniversity &&
        matchesAgreements
      );
    });
  }, [
    searchTerm,
    selectedCyprusUni,
    selectedCountry,
    selectedDepartment,
    selectedHostUniversity,
    availableDestinations,
  ]);

  // Statistics
  const stats = useMemo(() => {
    if (exchangeHistory.length === 0) {
      return {
        totalStudents: 0,
        uniqueUniversities: 0,
        uniqueCountries: 0,
        avgRating: "0",
      };
    }

    const totalStudents = exchangeHistory.length;
    const uniqueUniversities = new Set(
      exchangeHistory.map((e) => e.exchange.university),
    ).size;
    const uniqueCountries = new Set(
      exchangeHistory.map((e) => e.exchange.country),
    ).size;
    const avgRating = (
      exchangeHistory.reduce((sum, e) => sum + e.rating, 0) / totalStudents
    ).toFixed(1);

    return { totalStudents, uniqueUniversities, uniqueCountries, avgRating };
  }, [exchangeHistory]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || submissionsLoading) {
    return (
      <>
        <Head>
          <title>University Course Matching - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Explore course matching between partner universities and Cyprus institutions"
          />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-20 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  University Exchange History
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Loading student experiences from forms...
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
        <title>University Course Matching - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore course matching between partner universities and Cyprus institutions"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                University Course Matching
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover how courses from partner universities map to Cyprus
                university programs. Real course matching data from students who
                completed their exchanges.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Course Matches
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
                    <GraduationCap className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Partner Universities
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.uniqueUniversities}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-purple-600" />
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
                    <TrendingUp className="h-8 w-8 text-orange-600" />
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

            {/* Available Agreements Info */}
            {availableDestinations.length > 0 && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {availableDestinations.length} Available Exchange
                      Destinations
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Based on official agreements for {selectedDepartment} at{" "}
                    {selectedCyprusUni}
                    {selectedLevel !== "All Levels" &&
                      ` (${selectedLevel} level)`}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students, universities, courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={selectedCyprusUni}
                    onValueChange={setSelectedCyprusUni}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="👆 Select Your University First" />
                    </SelectTrigger>
                    <SelectContent>
                      {cyprusUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Destination Country" />
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
                    value={selectedHostUniversity}
                    onValueChange={setSelectedHostUniversity}
                    disabled={availableHostUniversities.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Host University" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Host Universities">
                        All Host Universities
                      </SelectItem>
                      {availableHostUniversities.map((university) => (
                        <SelectItem key={university} value={university}>
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Level of Study" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCyprusUni("");
                      setSelectedCountry("All Countries");
                      setSelectedHostUniversity("All Host Universities");
                      setSelectedDepartment("All Departments");
                      setSelectedLevel("All Levels");
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exchange History List */}
            <div className="space-y-6">
              {!selectedCyprusUni ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <GraduationCap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select Your Home University
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Please select your Cyprus university above to view
                      relevant exchange records and course mappings.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 This helps us show you the most relevant exchange
                        opportunities and course equivalencies for your academic
                        program.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No course matching records found
                    </h3>
                    <p className="text-gray-600">
                      No course mapping data available for the selected
                      criteria. Try adjusting your filters or check other
                      universities.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredHistory.map((exchange) => (
                  <Card
                    key={exchange.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Student Info */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={exchange.student.avatar}
                                alt={exchange.student.name}
                              />
                              <AvatarFallback>
                                {exchange.student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {exchange.student.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {exchange.student.department}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">
                                {exchange.student.cyprusUniversity}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-600">
                                {exchange.student.year}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Exchange Info */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Exchange Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-gray-600">
                                  {exchange.exchange.university}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {exchange.exchange.city},{" "}
                                {exchange.exchange.country}
                              </div>
                              <div className="flex gap-2 mb-2">
                                <Badge variant="secondary">
                                  {exchange.exchange.duration}
                                </Badge>
                                <Badge variant="outline">
                                  {exchange.exchange.period}
                                </Badge>
                                <Badge
                                  variant={
                                    exchange.submissionType ===
                                    "COURSE_MATCHING"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {exchange.submissionType === "COURSE_MATCHING"
                                    ? "📚 Courses"
                                    : exchange.submissionType ===
                                        "ACCOMMODATION"
                                      ? "🏠 Housing"
                                      : exchange.submissionType === "EXPERIENCE"
                                        ? "⭐ Experience"
                                        : "📝 Story"}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Selected university:",
                                    exchange.exchange.university,
                                  );
                                  setSelectedUniversityForSubmissions(
                                    exchange.exchange.university,
                                  );
                                }}
                              >
                                View Course Details
                              </Button>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={
                                      i < Math.floor(exchange.rating)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {exchange.rating}/5
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 italic">
                              "{exchange.review}"
                            </p>
                          </div>
                        </div>

                        {/* Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            Course Matching Information
                          </h4>
                          <div className="space-y-3">
                            {exchange.courses?.length > 0 ? (
                              exchange.courses
                                .slice(0, 3)
                                .map((course, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-blue-50 rounded-lg"
                                  >
                                    <div>
                                      <h5 className="text-sm font-medium text-blue-900">
                                        {course.code} - {course.name}
                                      </h5>
                                      <p className="text-xs text-blue-600">
                                        {course.credits} ECTS
                                      </p>
                                      {course.description && (
                                        <p className="text-xs text-blue-700 mt-1">
                                          {course.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  📚 Course matching data submitted
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Click "View Course Details" to see full course
                                  mapping
                                </p>
                              </div>
                            )}
                            {exchange.courses?.length > 3 && (
                              <p className="text-xs text-blue-600">
                                +{exchange.courses.length - 3} more courses
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* University Submissions Section */}
            {selectedUniversityForSubmissions && (
              <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Course Matching Details
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUniversityForSubmissions(null)}
                  >
                    Close
                  </Button>
                </div>
                <UniversitySubmissions
                  universityId={selectedUniversityForSubmissions}
                  universityName={selectedUniversityForSubmissions}
                />
              </div>
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
