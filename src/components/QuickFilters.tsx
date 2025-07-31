import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  MapPin,
  GraduationCap,
  Globe,
  Users,
  Star,
  TrendingUp,
  Heart,
  Clock,
  X,
} from "lucide-react";

interface QuickFiltersProps {
  userProfile?: {
    university?: string;
    hostCountry?: string;
    hostCity?: string;
    hostUniversity?: string;
  } | null;
  onFilterApply: (filters: {
    country?: string;
    university?: string;
    category?: string;
    sortBy?: string;
  }) => void;
  activeFilters: {
    country: string;
    university: string;
    category: string;
    sortBy: string;
  };
  availableCountries: string[];
  availableUniversities: string[];
  onClearFilters: () => void;
}

export function QuickFilters({
  userProfile,
  onFilterApply,
  activeFilters,
  availableCountries,
  availableUniversities,
  onClearFilters,
}: QuickFiltersProps) {
  const hasActiveFilters =
    activeFilters.country !== "all" ||
    activeFilters.university !== "all" ||
    activeFilters.category !== "all" ||
    activeFilters.sortBy !== "newest";

  const quickFilterOptions = [
    // Personal filters based on user profile
    ...(userProfile?.hostCountry &&
    availableCountries.includes(userProfile.hostCountry)
      ? [
          {
            label: `My Destination (${userProfile.hostCountry})`,
            icon: <MapPin className="h-4 w-4" />,
            action: () => onFilterApply({ country: userProfile.hostCountry }),
            active: activeFilters.country === userProfile.hostCountry,
            variant: "personal" as const,
          },
        ]
      : []),

    ...(userProfile?.hostUniversity &&
    availableUniversities.includes(userProfile.hostUniversity)
      ? [
          {
            label: `My University (${userProfile.hostUniversity.slice(0, 20)}${userProfile.hostUniversity.length > 20 ? "..." : ""})`,
            icon: <GraduationCap className="h-4 w-4" />,
            action: () =>
              onFilterApply({ university: userProfile.hostUniversity }),
            active: activeFilters.university === userProfile.hostUniversity,
            variant: "personal" as const,
          },
        ]
      : []),

    ...(userProfile?.university &&
    availableUniversities.includes(userProfile.university)
      ? [
          {
            label: `My Home University`,
            icon: <GraduationCap className="h-4 w-4" />,
            action: () => onFilterApply({ university: userProfile.university }),
            active: activeFilters.university === userProfile.university,
            variant: "personal" as const,
          },
        ]
      : []),

    // Popular content filters
    {
      label: "Most Popular",
      icon: <TrendingUp className="h-4 w-4" />,
      action: () => onFilterApply({ sortBy: "popular" }),
      active: activeFilters.sortBy === "popular",
      variant: "sort" as const,
    },
    {
      label: "Most Liked",
      icon: <Heart className="h-4 w-4" />,
      action: () => onFilterApply({ sortBy: "likes" }),
      active: activeFilters.sortBy === "likes",
      variant: "sort" as const,
    },
    {
      label: "Recent Stories",
      icon: <Clock className="h-4 w-4" />,
      action: () => onFilterApply({ sortBy: "newest" }),
      active: activeFilters.sortBy === "newest",
      variant: "sort" as const,
    },

    // Category filters
    {
      label: "Accommodation Tips",
      icon: <MapPin className="h-4 w-4" />,
      action: () => onFilterApply({ category: "accommodation" }),
      active: activeFilters.category === "accommodation",
      variant: "category" as const,
    },
    {
      label: "Cultural Experiences",
      icon: <Globe className="h-4 w-4" />,
      action: () => onFilterApply({ category: "culture" }),
      active: activeFilters.category === "culture",
      variant: "category" as const,
    },
    {
      label: "Academic Life",
      icon: <GraduationCap className="h-4 w-4" />,
      action: () => onFilterApply({ category: "academics" }),
      active: activeFilters.category === "academics",
      variant: "category" as const,
    },
    {
      label: "Travel & Adventures",
      icon: <Users className="h-4 w-4" />,
      action: () => onFilterApply({ category: "travel" }),
      active: activeFilters.category === "travel",
      variant: "category" as const,
    },
  ];

  const getVariantStyle = (variant: string, active: boolean) => {
    if (active) {
      switch (variant) {
        case "personal":
          return "bg-blue-600 text-white border-blue-600";
        case "sort":
          return "bg-green-600 text-white border-green-600";
        case "category":
          return "bg-purple-600 text-white border-purple-600";
        default:
          return "bg-gray-600 text-white border-gray-600";
      }
    }

    switch (variant) {
      case "personal":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "sort":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "category":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Quick Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Personal Filters */}
        {userProfile && (
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">For You</p>
            <div className="flex flex-wrap gap-2">
              {quickFilterOptions
                .filter((option) => option.variant === "personal")
                .map((option, index) => (
                  <Button
                    key={`personal-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={option.action}
                    className={`${getVariantStyle(option.variant, option.active)} transition-colors`}
                  >
                    {option.icon}
                    <span className="ml-1 text-xs">{option.label}</span>
                    {option.active && (
                      <Star className="h-3 w-3 ml-1 fill-current" />
                    )}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Sort Filters */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Sort By</p>
          <div className="flex flex-wrap gap-2">
            {quickFilterOptions
              .filter((option) => option.variant === "sort")
              .map((option, index) => (
                <Button
                  key={`sort-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={option.action}
                  className={`${getVariantStyle(option.variant, option.active)} transition-colors`}
                >
                  {option.icon}
                  <span className="ml-1 text-xs">{option.label}</span>
                  {option.active && (
                    <Star className="h-3 w-3 ml-1 fill-current" />
                  )}
                </Button>
              ))}
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Categories</p>
          <div className="flex flex-wrap gap-2">
            {quickFilterOptions
              .filter((option) => option.variant === "category")
              .map((option, index) => (
                <Button
                  key={`category-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={option.action}
                  className={`${getVariantStyle(option.variant, option.active)} transition-colors`}
                >
                  {option.icon}
                  <span className="ml-1 text-xs">{option.label}</span>
                  {option.active && (
                    <Star className="h-3 w-3 ml-1 fill-current" />
                  )}
                </Button>
              ))}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-300"
            >
              <Star className="h-3 w-3 mr-1 fill-current" />
              Active Filters
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 text-xs text-blue-700">
            {activeFilters.country !== "all" && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Country: {activeFilters.country}
              </span>
            )}
            {activeFilters.university !== "all" && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                University: {activeFilters.university.slice(0, 20)}...
              </span>
            )}
            {activeFilters.category !== "all" && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Category: {activeFilters.category}
              </span>
            )}
            {activeFilters.sortBy !== "newest" && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Sort: {activeFilters.sortBy}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
