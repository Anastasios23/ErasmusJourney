import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Header from "../components/Header";
import Footer from "../src/components/Footer";
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
  const [experiences, setExperiences] = useState<CourseMatchingExperience[]>(
    [],
  );
  const [filteredExperiences, setFilteredExperiences] = useState<
    CourseMatchingExperience[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStats, setFilterStats] = useState<FilterStats | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
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
          exp.studentName.toLowerCase().includes(search),
      );
    }

    // Destination filter
    if (selectedDestination && selectedDestination !== "all") {
      filtered = filtered.filter(
        (exp) => `${exp.hostCity}, ${exp.hostCountry}` === selectedDestination,
      );
    }

    // Department filter
    if (selectedDepartment && selectedDepartment !== "all") {
      filtered = filtered.filter(
        (exp) =>
          exp.hostDepartment === selectedDepartment ||
          exp.homeDepartment === selectedDepartment,
      );
    }

    // Difficulty filter
    if (selectedDifficulty && selectedDifficulty !== "all") {
      filtered = filtered.filter(
        (exp) => exp.courseMatchingDifficult === selectedDifficulty,
      );
    }

    // Level filter
    if (selectedLevel && selectedLevel !== "all") {
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
    setSelectedDestination("all");
    setSelectedDepartment("all");
    setSelectedDifficulty("all");
    setSelectedLevel("all");
    setRecommendedOnly(false);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/course-matching-experiences/${id}`);
  };

  // Get unique values for filter dropdowns
  const uniqueDestinations = [
    ...new Set(experiences.map((exp) => `${exp.hostCity}, ${exp.hostCountry}`)),
  ].sort();

  const uniqueDepartments = [
    ...new Set([
      ...experiences.map((exp) => exp.hostDepartment),
      ...experiences.map((exp) => exp.homeDepartment),
    ]),
  ].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>Course Matching Experiences - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Explore real student experiences with course matching and academic planning during Erasmus exchanges"
        />
      </Head>

      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          {/* Vertical Container Lines */}
          <div className="absolute inset-0 max-w-7xl mx-auto">
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div className="absolute right-4 md:right-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-between mb-8"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
                Back to Dashboard
              </motion.button>
            </Link>
            <Link href="/course-matching">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-full text-sm font-medium hover:bg-white/90 transition-colors shadow-lg"
              >
                <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
                Share Your Experience
              </motion.button>
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
              <Icon icon="solar:notebook-linear" className="w-4 h-4" />
              Student Experiences
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Course Matching Experiences
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
            className="text-base md:text-lg text-white/70 max-w-3xl mb-8"
          >
            Discover how other students navigated course selection and credit
            transfer during their Erasmus exchanges. Learn from their challenges
            and successes.
          </motion.p>

          {/* Stats Grid */}
          {filterStats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:users-group-rounded-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {filterStats.totalExperiences}
                </div>
                <div className="text-sm text-white/70">Total Experiences</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:graph-up-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {Math.round(filterStats.successRate)}%
                </div>
                <div className="text-sm text-white/70">Avg Success Rate</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:book-2-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {Math.round(filterStats.avgCoursesMatched)}
                </div>
                <div className="text-sm text-white/70">Avg Courses Matched</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 cursor-default"
              >
                <Icon
                  icon="solar:star-linear"
                  className="w-6 h-6 text-white/80 mb-2"
                />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {filterStats.avgDifficulty.toFixed(1)}
                </div>
                <div className="text-sm text-white/70">Difficulty Rating</div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:filter-linear" className="h-5 w-5" />
              Filter Experiences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Icon
                  icon="solar:magnifer-linear"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                />
                <Input
                  placeholder="Search universities, cities, students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={selectedDestination}
                onValueChange={setSelectedDestination}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All destinations</SelectItem>
                  {uniqueDestinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
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
                  {filteredExperiences.length} of {experiences.length}{" "}
                  experiences
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

      <Footer />
    </div>
  );
}
