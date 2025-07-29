import { useState, useMemo } from "react";
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
import { useStories, useLikeStory } from "../src/hooks/useStories";
import {
  StudentStoryErrorBoundary,
  StoryCardSkeleton,
  EmptyState,
} from "../src/components/StudentStoryComponents";
import { StoriesListMetaTags } from "../src/utils/seoUtils";
import AIRecommendations from "../src/components/AIRecommendations";
import StandardIcon from "../src/components/StandardIcon";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // React Query for data fetching with caching
  const { stories, loading, error, refetch } = useStories();
  const { likeStory } = useLikeStory();

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

      return matchesSearch && matchesCategory;
    });
  }, [stories, searchTerm, selectedCategory]);

  const finalLoading = loading;

  // Pagination
  const totalPages = Math.ceil(filteredStories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStories = filteredStories.slice(
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all";

  return (
    <StudentStoryErrorBoundary onRetry={refetch}>
      <StoriesListMetaTags totalStories={stories.length} />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Student Stories
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover inspiring experiences from students who've embarked on
                their Erasmus journey. Get insights, tips, and motivation for
                your own adventure.
              </p>
            </header>

            {/* Search and Filter */}
            <section aria-label="Search and filter stories">
              <Card className="mb-8">
                <CardContent className="pt-6">
                  {/* Search Bar */}
                  <div className="mb-4">
                    <Label htmlFor="search" className="sr-only">
                      Search stories
                    </Label>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                        aria-hidden="true"
                      />
                      <Input
                        id="search"
                        placeholder="Search stories by title, city, or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        aria-describedby="search-help"
                      />
                      <div id="search-help" className="sr-only">
                        Search for stories by title, city, or content
                      </div>
                    </div>
                  </div>

                  {/* Filter Toggle and Categories */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((category) => (
                        <Badge
                          key={category.value}
                          variant={
                            selectedCategory === category.value
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            setSelectedCategory(category.value);
                            setCurrentPage(1);
                          }}
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
                        </Badge>
                      ))}
                    </div>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear all
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">
                  {finalLoading ? (
                    "Loading stories..."
                  ) : (
                    <>
                      Found {filteredStories.length}{" "}
                      {filteredStories.length === 1 ? "story" : "stories"}
                      {currentPage > 1 &&
                        ` (Page ${currentPage} of ${totalPages})`}
                    </>
                  )}
                </p>
              </div>
              <Link href="/share-story">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Share Your Story
                </Button>
              </Link>
            </div>

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

            {/* Stories Grid */}
            {!finalLoading && !error && (
              <section aria-label="Student stories">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {paginatedStories.map((story) => (
                    <article
                      key={story.id}
                      className="group"
                      aria-labelledby={`story-${story.id}-title`}
                    >
                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                        onClick={() => router.push(`/stories/${story.id}`)}
                      >
                        <div className="aspect-video overflow-hidden rounded-t-lg relative">
                          <Image
                            src={
                              story.imageUrl ||
                              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                            }
                            alt={
                              story.title ||
                              story.studentName ||
                              "Student story"
                            }
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <CardHeader className="pb-2 flex-none">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary">
                              {(story.tags && story.tags[0]?.toLowerCase()) ||
                                (story.helpTopics &&
                                  story.helpTopics[0]?.toLowerCase()) ||
                                "experience"}
                            </Badge>
                            <div className="flex items-center text-xs text-gray-500 gap-1">
                              <Calendar
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                              <time dateTime={story.createdAt}>
                                {new Date(story.createdAt).toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                          <CardTitle
                            id={`story-${story.id}-title`}
                            className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors"
                          >
                            {story.title ||
                              `${story.studentName}'s Experience in ${story.city}`}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                            {story.excerpt ||
                              story.story?.substring(0, 150) + "..." ||
                              "No description available"}
                          </p>

                          {/* Author Info */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-8 h-8">
                              <Image
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(story.author?.name || story.studentName || "anonymous")}`}
                                alt={
                                  story.author?.name ||
                                  story.studentName ||
                                  "Anonymous User"
                                }
                                fill
                                className="rounded-full object-cover"
                                sizes="32px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {story.author?.name ||
                                  story.studentName ||
                                  "Anonymous User"}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {story.author?.university ||
                                  story.university ||
                                  "University"}
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1 text-sm text-blue-600 mb-3">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            <span>
                              {story.location?.city || story.city || "City"},{" "}
                              {story.location?.country ||
                                story.country ||
                                "Country"}
                            </span>
                          </div>

                          {/* Stats and Actions */}
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <div className="flex gap-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikeStory(story.id);
                                }}
                                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                aria-label={`Like story: ${story.title || story.studentName}`}
                              >
                                <Heart className="h-3 w-3" />
                                <span>{story.likes || 0}</span>
                              </button>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" aria-hidden="true" />
                                <span>{story.views || 0}</span>
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/stories/${story.id}`);
                              }}
                            >
                              Read More
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </article>
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
            {!finalLoading && !error && filteredStories.length === 0 && (
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
