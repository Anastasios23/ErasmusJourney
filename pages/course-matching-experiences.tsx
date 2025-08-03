import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import CourseMatchingExperienceCard from "../src/components/CourseMatchingExperienceCard";
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
import { Badge } from "../src/components/ui/badge";
import { Skeleton } from "../src/components/ui/skeleton";
import {
  BookOpen,
  Search,
  Filter,
  Users,
  GraduationCap,
  MapPin,
  Star,
  TrendingUp,
  ArrowLeft,
  Plus,
} from "lucide-react";

interface CourseMatchingExperience {
  id: string;
  studentName: string;
  homeUniversity: string;
  homeDepartment: string;
  hostUniversity: string;
  hostDepartment: string;
  hostCity: string;
  hostCountry: string;
  levelOfStudy: string;
  hostCourseCount: number;
  homeCourseCount: number;
  courseMatchingDifficult: string;
  courseMatchingChallenges?: string;
  timeSpentOnMatching?: string;
  creditsTransferredSuccessfully?: number;
  totalCreditsAttempted?: number;
  recommendCourses: string;
  recommendationReason?: string;
  overallAcademicExperience?: number;
  biggestCourseChallenge?: string;
  academicAdviceForFuture?: string;
  teachingQuality?: number;
  languageOfInstruction?: string;
  classSize?: string;
  studentSupportServices?: number;
  courseSelectionTips?: string;
  academicPreparationAdvice?: string;
  bestCoursesRecommendation?: string;
  coursesToAvoid?: string;
  hostCourses?: Array<{
    name: string;
    code?: string;
    ects: number;
    difficulty?: string;
    examTypes?: string[];
    teachingStyle?: string;
    workload?: string;
    recommendation?: string;
    type?: string;
  }>;
  equivalentCourses?: Array<{
    hostCourseName: string;
    homeCourseName: string;
    hostCourseCode?: string;
    homeCourseCode?: string;
    ects: number;
    matchQuality?: string;
    approvalDifficulty?: string;
    notes?: string;
  }>;
}

interface FilterStats {
  totalExperiences: number;
  avgDifficulty: number;
  successRate: number;
  avgCoursesMatched: number;
  topDestinations: Array<{ name: string; count: number }>;
  topDepartments: Array<{ name: string; count: number }>;
}

export default function CourseMatchingExperiences() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<CourseMatchingExperience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<CourseMatchingExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStats, setFilterStats] = useState<FilterStats | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [recommendedOnly, setRecommendedOnly] = useState(false);

  // Load course matching experiences
  useEffect(() => {
    fetchCourseMatchingExperiences();
  }, []);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [
    experiences,
    searchTerm,
    selectedDestination,
    selectedDepartment,
    selectedDifficulty,
    selectedLevel,
    recommendedOnly,
  ]);

  const fetchCourseMatchingExperiences = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/course-matching/experiences");
      if (!response.ok) {
        throw new Error("Failed to fetch course matching experiences");
      }
      const data = await response.json();
      setExperiences(data.experiences || []);
      setFilterStats(data.stats || null);
    } catch (err) {
      console.error("Error fetching course matching experiences:", err);
      setError("Failed to load course matching experiences");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...experiences];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (exp) =>
          exp.hostUniversity.toLowerCase().includes(search) ||
          exp.homeUniversity.toLowerCase().includes(search) ||
          exp.hostDepartment.toLowerCase().includes(search) ||
          exp.homeDepartment.toLowerCase().includes(search) ||
          exp.hostCity.toLowerCase().includes(search) ||
          exp.hostCountry.toLowerCase().includes(search) ||
          exp.studentName.toLowerCase().includes(search)
      );
    }

    // Destination filter
    if (selectedDestination) {
      filtered = filtered.filter((exp) =>
        `${exp.hostCity}, ${exp.hostCountry}` === selectedDestination
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(
        (exp) =>
          exp.hostDepartment === selectedDepartment ||
          exp.homeDepartment === selectedDepartment
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(
        (exp) => exp.courseMatchingDifficult === selectedDifficulty
      );
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter((exp) => exp.levelOfStudy === selectedLevel);
    }

    // Recommended only filter
    if (recommendedOnly) {
      filtered = filtered.filter((exp) => exp.recommendCourses === "Yes");
    }

    setFilteredExperiences(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDestination("");
    setSelectedDepartment("");
    setSelectedDifficulty("");
    setSelectedLevel("");
    setRecommendedOnly(false);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/course-matching-experiences/${id}`);
  };

  // Get unique values for filter dropdowns
  const uniqueDestinations = [
    ...new Set(
      experiences.map((exp) => `${exp.hostCity}, ${exp.hostCountry}`)
    ),
  ].sort();

  const uniqueDepartments = [
    ...new Set([
      ...experiences.map((exp) => exp.hostDepartment),
      ...experiences.map((exp) => exp.homeDepartment),
    ]),
  ].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Course Matching Experiences - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore real student experiences with course matching and academic planning during Erasmus exchanges"
        />
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/course-matching">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Share Your Experience
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Course Matching Experiences
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how other students navigated course selection and credit transfer 
              during their Erasmus exchanges. Learn from their challenges and successes.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {filterStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Experiences
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filterStats.totalExperiences}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Average Success Rate
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(filterStats.successRate)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Courses Matched
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(filterStats.avgCoursesMatched)}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Difficulty Rating
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {filterStats.avgDifficulty.toFixed(1)}/5
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Experiences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search universities, cities, students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All destinations</SelectItem>
                  {uniqueDestinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All difficulties</SelectItem>
                  <SelectItem value="Very Easy">Very Easy</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Difficult">Difficult</SelectItem>
                  <SelectItem value="Very Difficult">Very Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recommendedOnly}
                    onChange={(e) => setRecommendedOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Recommended experiences only
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredExperiences.length} of {experiences.length} experiences
                </span>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experiences Grid */}
        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">{error}</div>
            </CardContent>
          </Card>
        ) : filteredExperiences.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                {experiences.length === 0
                  ? "No course matching experiences found. Be the first to share your experience!"
                  : "No experiences match your current filters. Try adjusting your search criteria."}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExperiences.map((experience) => (
              <CourseMatchingExperienceCard
                key={experience.id}
                courseMatching={experience}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
