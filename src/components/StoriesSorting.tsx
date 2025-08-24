import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  TrendingUp,
  Clock,
  Star,
  Heart,
  Eye,
  Grid,
  List,
  LayoutGrid,
  Calendar,
  MapPin,
  Filter,
} from "lucide-react";

interface StoriesSortingProps {
  totalStories: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  sortBy: string;
  setSortBy: (value: string) => void;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showFeatured: boolean;
  setShowFeatured: (value: boolean) => void;
}

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest First",
    icon: <Clock className="h-4 w-4" />,
    description: "Most recently published stories",
  },
  {
    value: "popular",
    label: "Most Popular",
    icon: <TrendingUp className="h-4 w-4" />,
    description: "Highest engagement stories",
  },
  {
    value: "highest-rated",
    label: "Highest Rated",
    icon: <Star className="h-4 w-4" />,
    description: "Best reviewed experiences",
  },
  {
    value: "most-liked",
    label: "Most Liked",
    icon: <Heart className="h-4 w-4" />,
    description: "Community favorites",
  },
  {
    value: "most-viewed",
    label: "Most Viewed",
    icon: <Eye className="h-4 w-4" />,
    description: "Widely read stories",
  },
  {
    value: "alphabetical",
    label: "A-Z by Location",
    icon: <MapPin className="h-4 w-4" />,
    description: "Alphabetical by city",
  },
];

const VIEW_OPTIONS = [
  {
    value: "grid" as const,
    label: "Grid View",
    icon: <Grid className="h-4 w-4" />,
    description: "Card-based layout",
  },
  {
    value: "list" as const,
    label: "List View",
    icon: <List className="h-4 w-4" />,
    description: "Detailed list format",
  },
  {
    value: "compact" as const,
    label: "Compact",
    icon: <LayoutGrid className="h-4 w-4" />,
    description: "Condensed view",
  },
];

export default function StoriesSorting({
  totalStories,
  filteredCount,
  currentPage,
  totalPages,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  showFeatured,
  setShowFeatured,
}: StoriesSortingProps) {
  const currentSortOption = SORT_OPTIONS.find(
    (option) => option.value === sortBy,
  );

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Grid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Stories Overview</h3>
              <div className="text-gray-300 text-sm">
                <span className="font-medium text-white">
                  {filteredCount.toLocaleString()}
                </span>
                {filteredCount !== totalStories && (
                  <>
                    {" of "}
                    <span className="font-medium text-white">
                      {totalStories.toLocaleString()}
                    </span>
                  </>
                )}{" "}
                {filteredCount === 1 ? "story" : "stories"} found
                {currentPage > 1 && (
                  <span className="text-gray-400">
                    {" • Page "}
                    <span className="font-medium text-white">{currentPage}</span>
                    {" of "}
                    <span className="font-medium text-white">{totalPages}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Featured Toggle */}
          <Button
            variant={showFeatured ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFeatured(!showFeatured)}
            className={`flex items-center gap-2 transition-all ${
              showFeatured
                ? "bg-yellow-500 text-yellow-900 hover:bg-yellow-400"
                : "bg-white/10 border-white/30 text-white hover:bg-white/20"
            }`}
          >
            <Star className={`h-4 w-4 ${showFeatured ? "fill-current" : ""}`} />
            Featured
          </Button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="p-6">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Sort by:
              </span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[220px] h-11 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-400 rounded-xl bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  {currentSortOption?.icon}
                  <SelectValue placeholder="Sort by..." />
                </div>
              </SelectTrigger>
              <SelectContent className="border-2 border-gray-200 rounded-xl">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="p-3 hover:bg-blue-50 focus:bg-blue-50 rounded-lg m-1"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        {option.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{option.label}</span>
                        <span className="text-xs text-gray-600">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LayoutGrid className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                View:
              </span>
            </div>
            <div className="flex items-center border-2 border-gray-200 rounded-xl p-1 bg-white shadow-sm">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setViewMode(option.value)}
                  className={`h-9 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                    viewMode === option.value
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={option.description}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
