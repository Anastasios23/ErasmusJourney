import React, { useState, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Input } from "../src/components/ui/input";
import { Skeleton } from "../src/components/ui/skeleton";
import { Label } from "../src/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { useStories, useLikeStory } from "../src/hooks/useStories";
import {
  StudentStoryErrorBoundary,
  StoryCardSkeleton,
  EmptyState,
} from "../src/components/StudentStoryComponents";
import { StoriesListMetaTags } from "../src/utils/seoUtils";
import AIRecommendations from "../src/components/AIRecommendations";
import StandardIcon from "../src/components/StandardIcon";
import { StoriesHeroSection } from "../src/components/StoriesHeroSection";
import EnhancedStoryCard from "../src/components/EnhancedStoryCard";
import StoriesSorting from "../src/components/StoriesSorting";
import { QuickFilters } from "../src/components/QuickFilters";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";
import { useRecentlyViewed } from "../src/hooks/useRecentlyViewed";
import { RecentlyViewed } from "../src/components/RecentlyViewed";
import {
  GRID_LAYOUTS,
  RESPONSIVE_SPACING,
  RESPONSIVE_TEXT,
} from "../src/utils/responsiveLayout";
import {
  CARD_STYLES,
  INTERACTIVE_STATES,
  TEXT_STYLES,
} from "../src/utils/visualConsistency";
import {
  Search,
  Heart,
  Eye,
  Calendar,
  BookOpen,
  SlidersHorizontal,
  X,
  ChevronDown,
  MapPin,
  GraduationCap,
  AlertCircle,
  TrendingUp,
  Users,
  Globe,
  Star,
  Filter,
} from "lucide-react";

const ITEMS_PER_PAGE = 6;

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Stories" },
  { value: "experience", label: "Experience" },
  { value: "accommodation", label: "Accommodation" },
  { value: "academics", label: "Academics" },
  { value: "culture", label: "Culture" },
  { value: "travel", label: "Travel" },
];

export default function StudentStoriesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const [showFeatured, setShowFeatured] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // React Query for data fetching with caching
  const { stories, loading, error, refetch } = useStories();
  const { likeStory } = useLikeStory();

  // User profile from form submissions
  const { getDraftData } = useFormSubmissions();
  const { addRecentItem } = useRecentlyViewed();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile
  React.useEffect(() => {
    const basicInfoData = getDraftData("basic-info");
    if (basicInfoData) {
      setUserProfile({
        university: basicInfoData.universityInCyprus,
        hostCountry: basicInfoData.hostCountry,
        hostCity: basicInfoData.hostCity,
        hostUniversity: basicInfoData.hostUniversity,
      });
    }
  }, [getDraftData]);

  // Extract unique values for filters
  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          stories
            .map((story) => story.location?.country || story.country)
            .filter(Boolean),
        ),
      ).sort(),
    [stories],
  );

  const universities = useMemo(
    () =>
      Array.from(
        new Set(
          stories
            .map((story) => story.author?.university || story.university)
            .filter(Boolean),
        ),
      ).sort(),
    [stories],
  );

  const periods = useMemo(
    () =>
      Array.from(
        new Set(stories.map((story) => story.exchangePeriod).filter(Boolean)),
      ).sort(),
    [stories],
  );

  // Generate featured topics for hero section
  const featuredTopics = useMemo(() => {
    const topicCounts = new Map();
    stories.forEach((story) => {
      const topics = [...(story.tags || []), ...(story.helpTopics || [])];
      topics.forEach((topic) => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    return [
      {
        name: "accommodation",
        count: topicCounts.get("accommodation") || 0,
        icon: <MapPin className="h-4 w-4" />,
        color: "bg-green-100 text-green-800",
      },
      {
        name: "culture",
        count: topicCounts.get("culture") || 0,
        icon: <Globe className="h-4 w-4" />,
        color: "bg-purple-100 text-purple-800",
      },
      {
        name: "academics",
        count: topicCounts.get("academics") || 0,
        icon: <GraduationCap className="h-4 w-4" />,
        color: "bg-blue-100 text-blue-800",
      },
      {
        name: "travel",
        count: topicCounts.get("travel") || 0,
        icon: <Users className="h-4 w-4" />,
        color: "bg-orange-100 text-orange-800",
      },
      {
        name: "budget",
        count: topicCounts.get("budget") || 0,
        icon: <TrendingUp className="h-4 w-4" />,
        color: "bg-yellow-100 text-yellow-800",
      },
    ].filter((topic) => topic.count > 0);
  }, [stories]);

  // Filter stories based on search and category
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesSearch =
        searchTerm === "" ||
        (story.title || story.studentName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (story.content || story.story || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (story.location?.city || story.city || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (story.location?.country || story.country || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (story.university || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        (story.tags &&
          story.tags.some(
            (tag) => tag.toLowerCase() === selectedCategory.toLowerCase(),
          )) ||
        (story.helpTopics &&
          story.helpTopics.some(
            (topic) => topic.toLowerCase() === selectedCategory.toLowerCase(),
          ));

      const matchesCountry =
        selectedCountry === "all" ||
        (story.location?.country || story.country || "").toLowerCase() ===
          selectedCountry.toLowerCase();

      const matchesUniversity =
        selectedUniversity === "all" ||
        (story.author?.university || story.university || "").toLowerCase() ===
          selectedUniversity.toLowerCase();

      const matchesPeriod =
        selectedPeriod === "all" ||
        (story.exchangePeriod || "").toLowerCase() ===
          selectedPeriod.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCountry &&
        matchesUniversity &&
        matchesPeriod
      );
    });
  }, [
    stories,
    searchTerm,
    selectedCategory,
    selectedCountry,
    selectedUniversity,
    selectedPeriod,
  ]);

  // Sort filtered stories
  const sortedStories = useMemo(() => {
    const sorted = [...filteredStories];

    switch (sortBy) {
      case "popular":
        return sorted.sort(
          (a, b) =>
            (b.likes || 0) + (b.views || 0) - ((a.likes || 0) + (a.views || 0)),
        );
      case "highest-rated":
        return sorted.sort((a, b) => 4.8 - 4.8); // Placeholder - would use actual ratings
      case "most-liked":
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "most-viewed":
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "alphabetical":
        return sorted.sort((a, b) =>
          (a.location?.city || a.city || "").localeCompare(
            b.location?.city || b.city || "",
          ),
        );
      case "newest":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [filteredStories, sortBy]);

  const finalLoading = loading;

  // Pagination
  const totalPages = Math.ceil(sortedStories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStories = sortedStories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleLikeStory = async (storyId: string) => {
    try {
      await likeStory(storyId);
    } catch (error) {
      console.error("Failed to like story:", error);
    }
  };

  const handleStoryClick = (story: any) => {
    // Track this story as recently viewed
    addRecentItem({
      id: story.id,
      title: story.title || `${story.studentName}'s Story`,
      type: "story",
      url: `/stories/${story.id}`,
      metadata: {
        city: story.location?.city || story.city,
        country: story.location?.country || story.country,
        author: story.studentName || story.author?.name,
        university: story.university || story.author?.university,
      },
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedCountry("all");
    setSelectedUniversity("all");
    setSelectedPeriod("all");
    setCurrentPage(1);
    setSortBy("newest");
  };

  const handleQuickFilter = (filters: {
    country?: string;
    university?: string;
    category?: string;
    sortBy?: string;
  }) => {
    if (filters.country) setSelectedCountry(filters.country);
    if (filters.university) setSelectedUniversity(filters.university);
    if (filters.category) setSelectedCategory(filters.category);
    if (filters.sortBy) setSortBy(filters.sortBy);
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all" ? selectedCategory : null,
    selectedCountry !== "all" ? selectedCountry : null,
    selectedUniversity !== "all" ? selectedUniversity : null,
    selectedPeriod !== "all" ? selectedPeriod : null,
  ].filter(Boolean).length;

  return (
    <StudentStoryErrorBoundary onRetry={refetch}>
      <StoriesListMetaTags totalStories={stories.length} />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Hero Section */}
            <StoriesHeroSection
              totalStories={stories.length}
              featuredTopics={featuredTopics}
              onTopicClick={(topic) => {
                setSelectedCategory(topic);
                setCurrentPage(1);
              }}
            />

            {/* Quick Filters */}
            <div className="mb-8">
              <Card className="shadow-sm border border-gray-200">
                <CardContent className="pt-6">
                  <QuickFilters
                    userProfile={userProfile}
                    onFilterApply={handleQuickFilter}
                    activeFilters={{
                      country: selectedCountry,
                      university: selectedUniversity,
                      category: selectedCategory,
                      sortBy: sortBy,
                    }}
                    availableCountries={countries}
                    availableUniversities={universities}
                    onClearFilters={clearFilters}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Search and Filter */}
            <section aria-label="Search and filter stories">
              <div className="mb-8 bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                {/* Modern Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          Find Your Perfect Story
                        </h3>
                        <p className="text-blue-100 text-sm">
                          Search through {stories.length} authentic experiences
                        </p>
                      </div>
                    </div>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All ({activeFiltersCount})
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Enhanced Search Bar */}
                  <div className="mb-6">
                    <Label htmlFor="search" className="sr-only">
                      Search stories
                    </Label>
                    <div className="relative group">
                      <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors"
                        aria-hidden="true"
                      />
                      <Input
                        id="search"
                        placeholder="Search by student name, city, university, or story content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-12 h-14 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all"
                        aria-describedby="search-help"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <div id="search-help" className="sr-only">
                        Search for stories by title, city, or content
                      </div>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="p-1 bg-blue-100 rounded">
                          <Filter className="h-3 w-3 text-blue-600" />
                        </div>
                        Categories
                      </span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORY_OPTIONS.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => {
                            setSelectedCategory(category.value);
                            setCurrentPage(1);
                          }}
                          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transform hover:scale-105 ${
                            selectedCategory === category.value
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm"
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setSelectedCategory(category.value);
                              setCurrentPage(1);
                            }
                          }}
                        >
                          {category.label}
                          {selectedCategory === category.value && (
                            <span className="ml-2">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all px-4 py-2"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Advanced Filters</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {/* Active Filters Indicator */}
                    {activeFiltersCount > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span className="font-medium text-blue-600">
                            {activeFiltersCount} filter
                            {activeFiltersCount !== 1 ? "s" : ""} active
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Advanced Filters Panel */}
                  {showFilters && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-100 shadow-inner">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Filter className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          Advanced Filters
                        </h4>
                        <div className="h-px bg-gradient-to-r from-blue-200 to-transparent flex-1"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            Country
                          </Label>
                          <div className="relative">
                            <select
                              value={selectedCountry}
                              onChange={(e) =>
                                setSelectedCountry(e.target.value)
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all appearance-none cursor-pointer hover:border-gray-300 shadow-sm"
                            >
                              <option value="all">🌍 All countries</option>
                              {countries.map((country) => (
                                <option key={country} value={country}>
                                  📍 {country}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <div className="p-1.5 bg-purple-100 rounded-lg">
                              <GraduationCap className="h-4 w-4 text-purple-600" />
                            </div>
                            University
                          </Label>
                          <div className="relative">
                            <select
                              value={selectedUniversity}
                              onChange={(e) =>
                                setSelectedUniversity(e.target.value)
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white transition-all appearance-none cursor-pointer hover:border-gray-300 shadow-sm"
                            >
                              <option value="all">🎓 All universities</option>
                              {universities.map((university) => (
                                <option key={university} value={university}>
                                  🏛️{" "}
                                  {university.length > 35
                                    ? university.substring(0, 35) + "..."
                                    : university}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            Period
                          </Label>
                          <div className="relative">
                            <select
                              value={selectedPeriod}
                              onChange={(e) =>
                                setSelectedPeriod(e.target.value)
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 bg-white transition-all appearance-none cursor-pointer hover:border-gray-300 shadow-sm"
                            >
                              <option value="all">📅 All periods</option>
                              {periods.map((period) => (
                                <option key={period} value={period}>
                                  🗓️ {period}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Enhanced Results Summary with Sorting */}
            <StoriesSorting
              totalStories={stories.length}
              filteredCount={sortedStories.length}
              currentPage={currentPage}
              totalPages={totalPages}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showFeatured={showFeatured}
              setShowFeatured={setShowFeatured}
            />

            {/* Error State */}
            {error && (
              <Card className="mb-8 bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-red-800">
                    Failed to load stories. Please try again later.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {finalLoading && <StoryCardSkeleton count={6} className="mb-12" />}

            {/* AI Recommendations */}
            {!finalLoading && !error && stories.length > 0 && (
              <div className="mb-12">
                <AIRecommendations maxRecommendations={3} />
              </div>
            )}

            {/* Enhanced Stories Grid */}
            {!finalLoading && !error && (
              <section aria-label="Student stories">
                <div
                  className={`mb-12 ${
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : viewMode === "list"
                        ? "space-y-6"
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  }`}
                >
                  {paginatedStories.map((story) => (
                    <div key={story.id} onClick={() => handleStoryClick(story)}>
                      <EnhancedStoryCard
                        story={story}
                        onLike={handleLikeStory}
                        compact={viewMode === "compact"}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
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
            {!finalLoading && !error && sortedStories.length === 0 && (
              <EmptyState
                title="No stories found"
                description="Try adjusting your search criteria or be the first to share a story about this topic."
                actionLabel="Share Your Story"
                onAction={() => router.push("/share-story")}
                icon={<BookOpen className="h-8 w-8 text-gray-400" />}
              />
            )}

            {/* CTA Section */}
            <section className="mt-16">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Share Your Erasmus Story
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Have an amazing Erasmus experience to share? Help future
                    students by sharing your insights, tips, and memorable
                    moments.
                  </p>
                  <Link href="/share-story">
                    <Button size="lg">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Share Your Story
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </StudentStoryErrorBoundary>
  );
}
