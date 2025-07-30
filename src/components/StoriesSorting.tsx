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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Results Summary */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {filteredCount.toLocaleString()}
          </span>
          {filteredCount !== totalStories && (
            <>
              {" of "}
              <span className="font-medium text-gray-900">
                {totalStories.toLocaleString()}
              </span>
            </>
          )}{" "}
          {filteredCount === 1 ? "story" : "stories"}
          {currentPage > 1 && (
            <span className="text-gray-500">
              {" • Page "}
              <span className="font-medium text-gray-900">{currentPage}</span>
              {" of "}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </span>
          )}
        </div>

        {/* Featured Toggle */}
        <Button
          variant={showFeatured ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFeatured(!showFeatured)}
          className="flex items-center gap-2"
        >
          <Star className={`h-3 w-3 ${showFeatured ? "fill-current" : ""}`} />
          Featured
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:block">
            Sort by:
          </span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-9">
              <div className="flex items-center gap-2">
                {currentSortOption?.icon}
                <SelectValue placeholder="Sort by..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    {option.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">
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
        <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
          {VIEW_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={viewMode === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(option.value)}
              className={`h-7 px-2 ${
                viewMode === option.value
                  ? "bg-white shadow-sm"
                  : "hover:bg-gray-100"
              }`}
              title={option.description}
            >
              {option.icon}
              <span className="sr-only">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
