import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { useMentorshipMembers } from "../src/hooks/useMentorship";
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
import { Skeleton } from "../src/components/ui/skeleton";
import {
  Search,
  MapPin,
  GraduationCap,
  Users,
  Heart,
  MessageSquare,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  Phone,
  Clock,
  Star,
  Filter,
  UserPlus,
  BookOpen,
  Languages,
  Calendar,
  Award,
} from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
} from "../src/data/universityAgreements";

const cyprusUniversities = [
  "All Universities",
  ...CYPRUS_UNIVERSITIES.map((uni) => uni.name),
];

// Common European countries for host destinations
const hostCountries = [
  "All Countries",
  "Austria",
  "Belgium",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Netherlands",
  "Poland",
  "Portugal",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

// Get all unique departments from all Cyprus universities
const allDepartments = CYPRUS_UNIVERSITIES.reduce((deps, uni) => {
  return [...deps, ...uni.departments];
}, [] as string[]);
const uniqueDepartments = [...new Set(allDepartments)].sort();
const departments = ["All Departments", ...uniqueDepartments];

// Academic specializations
const specializations = [
  "All Specializations",
  "Engineering",
  "Business",
  "Medicine",
  "Computer Science",
  "Arts & Design",
  "Law",
  "Psychology",
  "Languages",
  "Sciences",
  "Architecture",
  "Education",
  "Social Work",
  "Other",
];

export default function Community() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCyprusUni, setSelectedCyprusUni] =
    useState("All Universities");
  const [selectedHostCountry, setSelectedHostCountry] =
    useState("All Countries");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedSpecialization, setSelectedSpecialization] = useState(
    "All Specializations",
  );
  const [selectedHostUniversity, setSelectedHostUniversity] = useState(
    "All Host Universities",
  );

  const { mentors, loading, error } = useMentorshipMembers();

  // Reset host university filter when Cyprus university changes
  useEffect(() => {
    setSelectedHostUniversity("All Host Universities");
  }, [selectedCyprusUni]);

  // Get available host universities based on selected Cyprus university and department (same logic as basic-information form)
  const availableHostUniversities = useMemo(() => {
    if (
      selectedCyprusUni === "All Universities" ||
      selectedDepartment === "All Departments"
    ) {
      // If no specific university and department are selected, get all unique host universities from mentors
      const allHostUniversities = [
        ...new Set(mentors.map((mentor) => mentor.hostUniversity)),
      ];
      return ["All Host Universities", ...allHostUniversities.sort()];
    }

    // Find the selected Cyprus university
    const cyprusUni = CYPRUS_UNIVERSITIES.find(
      (uni) => uni.name === selectedCyprusUni,
    );

    if (!cyprusUni) {
      return ["All Host Universities"];
    }

    // Use the same logic as basic-information form
    let agreements: any[] = [];

    if (cyprusUni.code === "UNIC") {
      // For UNIC, we could use level-specific agreements, but for simplicity we'll use department-only
      // In the future, you could add level filtering here if needed
      agreements = getAgreementsByDepartment(
        cyprusUni.code,
        selectedDepartment,
      );
    } else {
      // For other universities, use general department agreements
      agreements = getAgreementsByDepartment(
        cyprusUni.code,
        selectedDepartment,
      );
    }

    // Get unique host universities from agreements
    const hostUniversities = [
      ...new Set(agreements.map((agreement) => agreement.partnerUniversity)),
    ];

    return ["All Host Universities", ...hostUniversities.sort()];
  }, [selectedCyprusUni, selectedDepartment, mentors]);

  // Filter mentors based on search criteria
  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesSearch =
        searchTerm === "" ||
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.hostCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.hostUniversity
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.specializations.some((spec) =>
          spec.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        mentor.helpTopics.some((topic) =>
          topic.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesCyprusUni =
        selectedCyprusUni === "All Universities" ||
        mentor.universityInCyprus === selectedCyprusUni;

      const matchesHostCountry =
        selectedHostCountry === "All Countries" ||
        mentor.hostCountry === selectedHostCountry;

      const matchesSpecialization =
        selectedSpecialization === "All Specializations" ||
        mentor.specializations.includes(selectedSpecialization);

      const matchesHostUniversity =
        selectedHostUniversity === "All Host Universities" ||
        mentor.hostUniversity === selectedHostUniversity;

      return (
        matchesSearch &&
        matchesCyprusUni &&
        matchesHostCountry &&
        matchesSpecialization &&
        matchesHostUniversity
      );
    });
  }, [
    mentors,
    searchTerm,
    selectedCyprusUni,
    selectedHostCountry,
    selectedSpecialization,
    selectedHostUniversity,
  ]);

  // Statistics
  const stats = useMemo(() => {
    if (mentors.length === 0) {
      return {
        totalMentors: 0,
        countriesCovered: 0,
        universitiesCovered: 0,
        topSpecialization: "N/A",
      };
    }

    const countries = [...new Set(mentors.map((m) => m.hostCountry))];
    const universities = [...new Set(mentors.map((m) => m.hostUniversity))];
    const specializationCounts = mentors.reduce(
      (acc, mentor) => {
        mentor.specializations.forEach((spec) => {
          acc[spec] = (acc[spec] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const topSpecialization =
      Object.entries(specializationCounts).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0] || "N/A";

    return {
      totalMentors: mentors.length,
      countriesCovered: countries.length,
      universitiesCovered: universities.length,
      topSpecialization,
    };
  }, [mentors]);

  const getContactIcon = (method: string) => {
    switch (method) {
      case "email":
        return Mail;
      case "instagram":
        return Instagram;
      case "facebook":
        return Facebook;
      case "linkedin":
        return Linkedin;
      case "phone":
        return Phone;
      default:
        return MessageSquare;
    }
  };

  const getAvailabilityColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Head>
        <title>Mentorship Community - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Connect with experienced Erasmus students who can help guide your exchange journey"
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
                Mentorship Community
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Connect with experienced Erasmus students who can provide
                guidance, share insights, and help you navigate your exchange
                journey successfully.
              </p>
            </header>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalMentors}
                    </div>
                    <div className="text-sm text-gray-600">Active Mentors</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <MapPin className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.countriesCovered}
                    </div>
                    <div className="text-sm text-gray-600">
                      Countries Covered
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <GraduationCap className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.universitiesCovered}
                    </div>
                    <div className="text-sm text-gray-600">Universities</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <BookOpen className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.topSpecialization}
                    </div>
                    <div className="text-sm text-gray-600">
                      Top Specialization
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
                  Find Your Ideal Mentor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, university, city, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select
                    value={selectedCyprusUni}
                    onValueChange={setSelectedCyprusUni}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cyprus University" />
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
                    value={selectedHostCountry}
                    onValueChange={setSelectedHostCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Host Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedSpecialization}
                    onValueChange={setSelectedSpecialization}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedHostUniversity}
                    onValueChange={setSelectedHostUniversity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Host University" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHostUniversities.map((university) => (
                        <SelectItem key={university} value={university}>
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">
                  {loading ? (
                    "Loading mentors..."
                  ) : (
                    <>
                      Found {filteredMentors.length} mentor
                      {filteredMentors.length === 1 ? "" : "s"}
                    </>
                  )}
                </p>
              </div>
              <Link href="/help-future-students">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Become a Mentor
                </Button>
              </Link>
            </div>

            {/* Error State */}
            {error && (
              <Card className="mb-8 bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-red-800">
                    Failed to load mentors. Please try again later.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Mentors Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredMentors.map((mentor) => {
                  const ContactIcon = getContactIcon(mentor.contactMethod);
                  return (
                    <Card
                      key={mentor.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={mentor.avatar} />
                            <AvatarFallback>
                              {mentor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight">
                              {mentor.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600 truncate">
                              {mentor.studyProgram}
                            </p>
                          </div>
                          <Badge
                            className={getAvailabilityColor(
                              mentor.availabilityLevel,
                            )}
                          >
                            {mentor.availabilityLevel}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Bio */}
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {mentor.bio}
                        </p>

                        {/* Experience Location */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>
                            {mentor.hostCity}, {mentor.hostCountry}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <span className="truncate">
                            {mentor.hostUniversity}
                          </span>
                        </div>

                        {/* Exchange Period */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span>{mentor.exchangePeriod}</span>
                        </div>

                        {/* Specializations */}
                        <div className="flex flex-wrap gap-1">
                          {mentor.specializations.slice(0, 3).map((spec) => (
                            <Badge
                              key={spec}
                              variant="outline"
                              className="text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                          {mentor.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.specializations.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Languages */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Languages className="h-4 w-4 text-orange-500" />
                          <span className="truncate">
                            {mentor.languagesSpoken.slice(0, 3).join(", ")}
                            {mentor.languagesSpoken.length > 3 && "..."}
                          </span>
                        </div>

                        {/* Response Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-indigo-500" />
                          <span>
                            Responds {mentor.responseTime.replace("-", " ")}
                          </span>
                        </div>

                        {/* Fun Fact */}
                        {mentor.funFact && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-900">
                                Fun Fact
                              </span>
                            </div>
                            <p className="text-sm text-blue-800 italic">
                              {mentor.funFact}
                            </p>
                          </div>
                        )}

                        {/* Contact Button */}
                        <div className="pt-2">
                          {mentor.contactInfo.email ? (
                            <div className="space-y-2">
                              <Button className="w-full" asChild>
                                <a href={`mailto:${mentor.contactInfo.email}`}>
                                  <ContactIcon className="h-4 w-4 mr-2" />
                                  Contact Mentor
                                </a>
                              </Button>

                              {/* Additional contact methods */}
                              <div className="flex justify-center gap-2">
                                {mentor.contactInfo.instagram && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a
                                      href={`https://instagram.com/${mentor.contactInfo.instagram}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Instagram className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                {mentor.contactInfo.linkedin && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a
                                      href={mentor.contactInfo.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Linkedin className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                {mentor.contactInfo.facebook && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a
                                      href={mentor.contactInfo.facebook}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Facebook className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                {mentor.contactInfo.website && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a
                                      href={mentor.contactInfo.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Globe className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full"
                              disabled
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact via Form
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No mentors found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or be the first to join our
                  mentorship program for this combination.
                </p>
                <Link href="/help-future-students">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Become a Mentor
                  </Button>
                </Link>
              </div>
            )}

            {/* CTA Section */}
            <section className="mt-16">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Want to Help Future Students?
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Share your Erasmus experience and become a mentor. Help
                    future students navigate their exchange journey with
                    confidence.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/help-future-students">
                      <Button size="lg">
                        <Heart className="h-5 w-5 mr-2" />
                        Join as Mentor
                      </Button>
                    </Link>
                    <Link href="/share-story">
                      <Button variant="outline" size="lg">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Share Your Story
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
