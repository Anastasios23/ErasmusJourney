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
          return "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg";
        case "sort":
          return "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg";
        case "category":
          return "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg";
        default:
          return "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg";
      }
    }

    switch (variant) {
      case "personal":
        return "bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm";
      case "sort":
        return "bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 shadow-sm";
      case "category":
        return "bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm";
      default:
        return "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm";
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quick Filters</h3>
            <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Personal Filters */}
        {userProfile && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-blue-100 rounded">
                <Users className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Personalized for You</p>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickFilterOptions
                .filter((option) => option.variant === "personal")
                .map((option, index) => (
                  <button
                    key={`personal-${index}`}
                    onClick={option.action}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 ${getVariantStyle(option.variant, option.active)}`}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                      {option.active && (
                        <Star className="h-3 w-3 fill-current" />
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Sort Filters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-green-100 rounded">
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Sort Options</p>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickFilterOptions
              .filter((option) => option.variant === "sort")
              .map((option, index) => (
                <button
                  key={`sort-${index}`}
                  onClick={option.action}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 ${getVariantStyle(option.variant, option.active)}`}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                    {option.active && (
                      <Star className="h-3 w-3 fill-current" />
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-purple-100 rounded">
              <Filter className="h-3 w-3 text-purple-600" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Story Categories</p>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickFilterOptions
              .filter((option) => option.variant === "category")
              .map((option, index) => (
                <button
                  key={`category-${index}`}
                  onClick={option.action}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300 ${getVariantStyle(option.variant, option.active)}`}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                    {option.active && (
                      <Star className="h-3 w-3 fill-current" />
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-inner">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Star className="h-3 w-3 text-white fill-current" />
            </div>
            <h4 className="font-semibold text-blue-900">Active Filters</h4>
            <div className="h-px bg-blue-200 flex-1"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.country !== "all" && (
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <MapPin className="h-3 w-3" />
                {activeFilters.country}
              </span>
            )}
            {activeFilters.university !== "all" && (
              <span className="inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <GraduationCap className="h-3 w-3" />
                {activeFilters.university.slice(0, 20)}{activeFilters.university.length > 20 ? '...' : ''}
              </span>
            )}
            {activeFilters.category !== "all" && (
              <span className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <Filter className="h-3 w-3" />
                {activeFilters.category}
              </span>
            )}
            {activeFilters.sortBy !== "newest" && (
              <span className="inline-flex items-center gap-1 bg-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                {activeFilters.sortBy}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
