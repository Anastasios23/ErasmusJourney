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
// Cyprus universities - these will be fetched from the database
const cyprusUniversities = [
  "University of Cyprus",
  "University of Nicosia",
  "Cyprus University of Technology",
  "Frederick University",
  "European University Cyprus",
];

export default function Community() {
  const router = useRouter();
  const [universityInCyprus, setUniversityInCyprus] = useState("");
  const [departmentInCyprus, setDepartmentInCyprus] = useState("");
  const [levelOfStudy, setLevelOfStudy] = useState("");
  const [hostUniversity, setHostUniversity] = useState("");
  const [hostCountry, setHostCountry] = useState("");
  const [hostCity, setHostCity] = useState("");

  // Available options based on dynamic agreements from database
  const [availableDepartments, setAvailableDepartments] = useState<string[]>(
    [],
  );
  const [availableAgreements, setAvailableAgreements] = useState<any[]>([]);
  const [availableHostUniversities, setAvailableHostUniversities] = useState<
    string[]
  >([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const { mentors, loading, error } = useMentorshipMembers();

  // Fetch available departments when Cyprus university changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (universityInCyprus && universityInCyprus !== "all") {
        try {
          const response = await fetch(
            `/api/universities/${encodeURIComponent(universityInCyprus)}/departments`,
          );
          if (response.ok) {
            const data = await response.json();
            setAvailableDepartments(data.departments || []);
          } else {
            setAvailableDepartments([]);
          }
        } catch (error) {
          console.error("Error fetching departments:", error);
          setAvailableDepartments([]);
        }
      } else {
        setAvailableDepartments([]);
      }
    };

    fetchDepartments();

    // Reset dependent fields
    setDepartmentInCyprus("");
    setLevelOfStudy("");
    setHostUniversity("");
    setHostCountry("");
    setHostCity("");
  }, [universityInCyprus]);

  // Fetch available agreements when university, department, or level changes
  useEffect(() => {
    const fetchAgreements = async () => {
      if (
        universityInCyprus &&
        departmentInCyprus &&
        universityInCyprus !== "all" &&
        departmentInCyprus !== "all"
      ) {
        try {
          const params = new URLSearchParams({
            homeUniversity: universityInCyprus,
            department: departmentInCyprus,
          });

          // Add level if it's UNIC and level is selected
          if (
            universityInCyprus.includes("Nicosia") &&
            levelOfStudy &&
            levelOfStudy !== "all"
          ) {
            params.append("level", levelOfStudy);
          }

          const response = await fetch(`/api/agreements?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            setAvailableAgreements(data.agreements || []);

            // Extract unique host universities
            const uniqueHostUniversities = [
              ...new Set(
                data.agreements.map(
                  (agreement: any) => agreement.partnerUniversity.name,
                ),
              ),
            ].sort();

            // Extract unique countries and cities
            const uniqueCountries = [
              ...new Set(
                data.agreements.map(
                  (agreement: any) => agreement.partnerCountry,
                ),
              ),
            ].sort();

            const uniqueCities = [
              ...new Set(
                data.agreements.map((agreement: any) => agreement.partnerCity),
              ),
            ].sort();

            setAvailableHostUniversities(uniqueHostUniversities);
            setAvailableCountries(uniqueCountries);
            setAvailableCities(uniqueCities);
          } else {
            setAvailableAgreements([]);
            setAvailableHostUniversities([]);
            setAvailableCountries([]);
            setAvailableCities([]);
          }
        } catch (error) {
          console.error("Error fetching agreements:", error);
          setAvailableAgreements([]);
          setAvailableHostUniversities([]);
          setAvailableCountries([]);
          setAvailableCities([]);
        }
      } else {
        setAvailableAgreements([]);
        setAvailableHostUniversities([]);
        setAvailableCountries([]);
        setAvailableCities([]);
      }
    };

    fetchAgreements();

    // Reset dependent fields
    setHostUniversity("");
    setHostCountry("");
    setHostCity("");
  }, [universityInCyprus, departmentInCyprus, levelOfStudy]);

  // Reset level of study when department changes or when switching from UNIC
  useEffect(() => {
    if (!universityInCyprus?.includes("Nicosia")) {
      setLevelOfStudy("");
    }
  }, [universityInCyprus, departmentInCyprus]);

  // Update available countries and cities when host university is selected
  useEffect(() => {
    if (
      hostUniversity &&
      hostUniversity !== "all" &&
      availableAgreements.length > 0
    ) {
      // Filter agreements by selected host university
      const filteredAgreements = availableAgreements.filter(
        (agreement) => agreement.partnerUniversity.name === hostUniversity,
      );

      if (filteredAgreements.length > 0) {
        // Extract unique countries and cities for this host university
        const uniqueCountries = [
          ...new Set(
            filteredAgreements.map((agreement) => agreement.partnerCountry),
          ),
        ].sort();

        const uniqueCities = [
          ...new Set(
            filteredAgreements.map((agreement) => agreement.partnerCity),
          ),
        ].sort();

        setAvailableCountries(uniqueCountries);
        setAvailableCities(uniqueCities);

        // Auto-select country and city if there's only one option (which is typical for a specific university)
        if (uniqueCountries.length === 1) {
          setHostCountry(uniqueCountries[0]);
        } else {
          setHostCountry("");
        }

        if (uniqueCities.length === 1) {
          setHostCity(uniqueCities[0]);
        } else {
          setHostCity("");
        }
      }
    } else {
      // Reset when no host university is selected
      setHostCountry("");
      setHostCity("");
    }
  }, [hostUniversity, availableAgreements]);

  // Get filtered host universities based on selected country and city
  const filteredHostUniversities = useMemo(() => {
    if (!availableAgreements.length) return [];

    return availableAgreements
      .filter((agreement) => {
        // Filter by country if selected
        if (
          hostCountry &&
          hostCountry !== "all" &&
          agreement.partnerCountry !== hostCountry
        ) {
          return false;
        }
        // Filter by city if selected
        if (
          hostCity &&
          hostCity !== "all" &&
          agreement.partnerCity !== hostCity
        ) {
          return false;
        }
        return true;
      })
      .map((agreement) => agreement.partnerUniversity.name)
      .filter((university, index, arr) => arr.indexOf(university) === index) // Remove duplicates
      .sort();
  }, [availableAgreements, hostCountry, hostCity]);

  // Filter mentors based on the 6 specific criteria
  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesUniversityInCyprus =
        !universityInCyprus ||
        universityInCyprus === "all" ||
        mentor.universityInCyprus === universityInCyprus;

      const matchesDepartmentInCyprus =
        !departmentInCyprus ||
        departmentInCyprus === "all" ||
        mentor.studyProgram.includes(departmentInCyprus) ||
        mentor.specializations.some(
          (spec) =>
            spec.toLowerCase().includes(departmentInCyprus.toLowerCase()) ||
            departmentInCyprus.toLowerCase().includes(spec.toLowerCase()),
        );

      const matchesLevelOfStudy =
        !levelOfStudy ||
        levelOfStudy === "all" ||
        mentor.levelOfStudy === levelOfStudy;

      const matchesHostUniversity =
        !hostUniversity ||
        mentor.hostUniversity
          .toLowerCase()
          .includes(hostUniversity.toLowerCase());

      const matchesHostCountry =
        !hostCountry ||
        mentor.hostCountry.toLowerCase().includes(hostCountry.toLowerCase());

      const matchesHostCity =
        !hostCity ||
        mentor.hostCity.toLowerCase().includes(hostCity.toLowerCase());

      return (
        matchesUniversityInCyprus &&
        matchesDepartmentInCyprus &&
        matchesLevelOfStudy &&
        matchesHostUniversity &&
        matchesHostCountry &&
        matchesHostCity
      );
    });
  }, [
    mentors,
    universityInCyprus,
    departmentInCyprus,
    levelOfStudy,
    hostUniversity,
    hostCountry,
    hostCity,
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
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* University in Cyprus */}
                  <Select
                    value={universityInCyprus}
                    onValueChange={setUniversityInCyprus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="University in Cyprus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {cyprusUniversities.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Department in Cyprus */}
                  <Select
                    value={departmentInCyprus}
                    onValueChange={setDepartmentInCyprus}
                    disabled={
                      !universityInCyprus || universityInCyprus === "all"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Department in Cyprus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {availableDepartments.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Level of Study - Only for UNIC */}
                  <Select
                    value={levelOfStudy}
                    onValueChange={setLevelOfStudy}
                    disabled={
                      !universityInCyprus ||
                      universityInCyprus === "all" ||
                      !universityInCyprus.includes("Nicosia")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          universityInCyprus?.includes("Nicosia")
                            ? "Level of Study"
                            : "Level (UNIC only)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="bachelor">Bachelor</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Host Country */}
                  <Select
                    value={hostCountry}
                    onValueChange={setHostCountry}
                    disabled={availableCountries.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Host Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {availableCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Host City */}
                  <Select
                    value={hostCity}
                    onValueChange={setHostCity}
                    disabled={availableCities.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Host City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Host University */}
                  <Select
                    value={hostUniversity}
                    onValueChange={setHostUniversity}
                    disabled={filteredHostUniversities.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Host University" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {filteredHostUniversities.map((university) => (
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

            {/* Error State - Only show if no mentors are available */}
            {error && mentors.length === 0 && (
              <Card className="mb-8 bg-red-50 border-red-200">
                <CardContent className="pt-6 text-center">
                  <div className="text-red-800 mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Unable to Load Mentors
                    </h3>
                    <p className="text-sm">{error}</p>
                  </div>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Warning for fallback data */}
            {error && mentors.length > 0 && (
              <Card className="mb-4 bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="flex items-center text-yellow-800 text-sm">
                    <span className="mr-2">⚠️</span>
                    <span>
                      Showing sample data due to connectivity issues. Please
                      refresh to try loading live data.
                    </span>
                  </div>
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

                        {/* University Information - Clearly Distinguished */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {/* University in Cyprus (Home) */}
                          <div className="text-sm">
                            <span className="text-gray-600">
                              University in Cyprus:{" "}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {mentor.universityInCyprus || "N/A"}
                            </span>
                          </div>

                          {/* Department/Study Program */}
                          <div className="text-sm">
                            <span className="text-gray-600">Department: </span>
                            <span className="font-semibold text-gray-900">
                              {mentor.studyProgram || "N/A"}
                            </span>
                          </div>

                          {/* Level of Study */}
                          {mentor.levelOfStudy && (
                            <div className="text-sm">
                              <span className="text-gray-600">Level: </span>
                              <span className="font-semibold text-gray-900 capitalize">
                                {mentor.levelOfStudy}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Host University Experience */}
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                            <GraduationCap className="h-4 w-4" />
                            <span>Exchange Experience</span>
                          </div>

                          <div className="text-sm">
                            <span className="text-blue-700">
                              Host University:{" "}
                            </span>
                            <span className="font-semibold text-blue-900">
                              {mentor.hostUniversity || "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {mentor.hostCity}, {mentor.hostCountry}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Calendar className="h-4 w-4" />
                            <span>{mentor.exchangePeriod}</span>
                          </div>
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
                  {mentors.length === 0
                    ? "No mentors available yet"
                    : "No mentors found"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {mentors.length === 0
                    ? "Be the first to join our mentorship program and help future students!"
                    : "Try adjusting your search criteria or be the first to join our mentorship program for this combination."}
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
